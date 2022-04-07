
import * as estree from 'estree';
import {createSelector} from '../../createQuerySelector';
import deepClone from 'lodash.clonedeep'
import {full} from 'acorn-walk'
import acorn from 'acorn';
import get from 'lodash.get'
import set from 'lodash.set'

const findRequireName = (c: estree.Node, i=0) : estree.SimpleLiteral => {
	// pluck + recurse

     if (c.type === 'CallExpression') {
          const r = c.arguments.filter(a=> a.type === 'Literal' 
                                             && !('regex' in a) 
                                             && !('bigint' in a) 
                                             ) as estree.SimpleLiteral[]
          return r.length > 0 
               ? r[0]
               : findRequireName(c.callee, i+1)
	}

     if(c.type === 'MemberExpression'){
          return findRequireName(c.object, i+1);
     }

     console.error(i, c, new Error().stack)
	throw new Error('Need more logic branches for finding the require');
};

export const replaceRequireFn = (replacer: estree.Identifier, programAST: estree.Node)=>{
     const localAST = deepClone(programAST) as acorn.Node
     full(localAST, (node:acorn.Node) => {
          if( node.type === 'CallExpression'){
               if(
                    (node as unknown as estree.CallExpression).callee.type === 'Identifier' 
                    && ((node as unknown as estree.CallExpression).callee as estree.Identifier).name === 'require'
                 ){
                    node.type = 'Identifier'; // was CallExpression
                    (node as unknown as estree.Identifier).name = replacer.name;
               }
          }
     })
     return localAST as estree.Node
}


/**
 * Convert Implied Default Function
 *
 * in -
 * ```
 * const myA4 = require('asdf4')('Arity1Param')('Arity2Param')
 * ```
 *
 * out -
 * ```
 * import asdf4_defaultFunc from 'asdf4';
 * const myA4 = asdf4_defaultFunc('Arity1Param')('Arity2Param')
 * ```
 *
 * @param node
 */
export const convert = (node: estree.Node): estree.Node[] => {
	/**
     * ```json require
     *     {
     *       "type": "VariableDeclaration",
     *       "kind": "const"
     *       "declarations": [
     *         {
     *           "type": "VariableDeclarator",
     *           "id": {
     *             "type": "Identifier",
     *             "name": "myA4"
     *           },
     *           "init": {
     *             "type": "CallExpression",
     *             "optional": false
     *             "arguments": [
     *               {
     *                 "type": "Literal",
     *                 "value": "arity2Param",
     *                 "raw": "\"arity2Param\""
     *               }
     *             ],
     *             "callee": {
     *               "type": "CallExpression",
     *               "optional": false
     *               "arguments": [
     *                 {
     *                   "type": "Literal",
     *                   "value": "arity1Param",
     *                   "raw": "\"arity1Param\""
     *                 }
     *               ],
     *               "callee": {
     *                 "type": "CallExpression",       // set this one to the new made up func
     *                 "optional": false,
     *                 "callee": {                     // innerMost -> finds require -> stops descent
     *                   "type": "Identifier",
     *                   "name": "require"
     *                 }
     *                 "arguments": [                  // pairs with args
     *                   {
     *                     "type": "Literal",
     *                     "value": "asdf4",
     *                     "raw": "\"asdf4\""
     *                   }
     *                 ],
     *                 
     *               }
     *             }
     *           }
     *         }
     *       ]
     *     }
     * ```
     */
     const n = node as estree.VariableDeclaration
	const declator: estree.VariableDeclarator = n.declarations
		.filter(d => d.type === 'VariableDeclarator')[0];

	const outterCall = declator.init as estree.CallExpression;
	const requireArgs = findRequireName(outterCall);

	const madeUpFunctionName:estree.Identifier = {
		type: 'Identifier',
		name: `${requireArgs.value ?? `__${Date.now()}`}__default`,
	};

	const importing:estree.ImportDeclaration = {
		type: 'ImportDeclaration',
		source: findRequireName(outterCall) as estree.Literal,
		specifiers: [
			{
				type: 'ImportDefaultSpecifier',
				local: madeUpFunctionName,
			},
		],
	};
	const assigning : estree.VariableDeclaration = {
		type: 'VariableDeclaration',
		kind: n.kind,
		declarations: [{
			type: 'VariableDeclarator',
			id: declator.id as estree.Identifier,
			init: replaceRequireFn(madeUpFunctionName, outterCall) as estree.Expression,
		}],

	};

	return [importing, assigning];
};

const requireWithImpliedDefaultFunction = {
	type: 'VariableDeclaration',
	id: {init: {callee: {name: 'require'}}},
};

export const hasRequireFn = (n: estree.Node): boolean => {
     switch(n.type){
          case 'Program':
               return n.body.some(s=>hasRequireFn(s))
          case 'VariableDeclaration':
               return n.declarations.some(d=>hasRequireFn(d))
          case 'VariableDeclarator':
               return hasRequireFn(n.init as estree.Node)
          case 'MemberExpression':
               return hasRequireFn(n.object as estree.Node)
          case 'CallExpression':
               return hasRequireFn(n.callee)
          case 'Identifier':
               return n.name === 'require'
          default:
               return false
     }
}


export const selector = {
     select: (ast: estree.Program):estree.Node[]=>{
          const allDeclaratorsWithRequire = ast.body
               .filter(n=>n.type==='VariableDeclaration')
               .reduce((p,c) => {
                    const declarators = (c as estree.VariableDeclaration).declarations
                    return [...p, ...declarators]
               }, [] as estree.VariableDeclarator[])
               .filter(n => hasRequireFn(n))
          return allDeclaratorsWithRequire
     },
	obj: requireWithImpliedDefaultFunction,
	str: createSelector(requireWithImpliedDefaultFunction),
};

export const testNode = (node: estree.Node | estree.Node[]):boolean=>{
     return !node || Array.isArray(node) 
          ? false
          : hasRequireFn(node)
}