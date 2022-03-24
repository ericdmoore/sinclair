
import * as estree from 'estree';
import {createSelector} from '../createQuerySelector';

const findRequireName = (c: estree.CallExpression) : estree.Literal => {
	// Dig if needed
	if (c.callee.type === 'CallExpression') {
		return findRequireName(c.callee as estree.CallExpression);
	}

	// Pluck the require name
	if (c.callee.type === 'Identifier' && (c.callee as estree.Identifier)?.name === 'require') {
		return c.arguments[0] as estree.Literal;
	}

	throw new Error('Need more logic branches for finding the require');
};

const replaceRequireWith = (newF: estree.Identifier, tree: estree.CallExpression): estree.CallExpression => {
	if (tree.callee.type === 'CallExpression') {
		return replaceRequireWith(newF, tree.callee);
	}

	if (tree.callee.type === 'Identifier' && tree.callee.name === 'require') {
		tree.callee = newF;
		return tree;
	}

	throw new Error('Need more logic branches for repalacing require and copying moving the crazy complicated JS chains');
};

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
export const convertImpliedDefaultFunction = (node: estree.VariableDeclaration): estree.Node[] => {
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
     *                 "callee": {                     // innerMost -> finds require -> stops descent
     *                   "type": "Identifier",
     *                   "name": "require"
     *                 },
     *                 "optional": false
     *                 "arguments": [                  // pairs with args
     *                   {
     *                     "type": "Literal",
     *                     "value": "asdf4",
     *                     "raw": "\"asdf4\""
     *                   }
     *                 ],
     *               }
     *             },
     *           }
     *         }
     *       ],
     *     }
     * ```
     */

	const declator: estree.VariableDeclarator = node.declarations
		.filter(d => d.type === 'VariableDeclarator')[0];

	const outterCall = declator.init as estree.CallExpression;
	const requireArgs = findRequireName(outterCall);

	const madeUpFunctionName:estree.Identifier = {
		type: 'Identifier',
		name: `${requireArgs.value ?? `__${Date.now()}`}__defaultFunc`,
	};

	const importing:estree.ImportDeclaration = {
		type: 'ImportDeclaration',
		source: findRequireName(outterCall) as estree.Literal,
		specifiers: [
			{
				type: 'ImportSpecifier',
				imported: madeUpFunctionName,
				local: madeUpFunctionName,
			},
		],
	};
	const assigning : estree.VariableDeclaration = {
		type: 'VariableDeclaration',
		kind: node.kind,
		declarations: [{
			type: 'VariableDeclarator',
			id: declator.id as estree.Identifier,
			init: replaceRequireWith(madeUpFunctionName, outterCall),
		}],

	};
	return [importing, assigning];
};

const requireWithImpliedDefaultFunction = {
	type: 'VariableDeclaration',
	id: {init: {callee: {name: 'require'}}},
};

export const selector = {
	obj: requireWithImpliedDefaultFunction,
	str: createSelector(requireWithImpliedDefaultFunction),
};
