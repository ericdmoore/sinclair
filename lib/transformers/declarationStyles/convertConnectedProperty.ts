/* eslint-disable capitalized-comments */
// import type {PromiseOr} from '../types';
import * as estree from 'estree';
import {acorn} from '../../sourceCode'
import * as patches from 'fast-json-patch'
import {createSelector} from '../../createQuerySelector';

/**
 * ## Connected Property
 *
 * Synth a localname for the key and use that for the subsequant variable declaration
 *
 * in: `const myA2 = require('asd2').key1`
 *
 * out: `import {key1 as asd2_key1} from 'asd2'; const myA2 = asd2_key1;`
 *
 * @param node
 * @type3
 * @todo - determine behavior for type4
 */
export const convert = (node: estree.Node): estree.Node[] => {
	/**
     *
     * ```json from> "const myA2 = require('asd2').key1"
     *  {
     *     "type": "VariableDeclaration",
     *     "kind": "const"
     *     "declarations": [
     *       {
     *         "type": "VariableDeclarator",
     *         "id": {
     *           "type": "Identifier",
     *           "name": "myA2"
     *         },
     *         "init": {
     *           "type": "MemberExpression",
     *           "computed": false,
     *           "optional": false
     *           "object": {
     *             "type": "CallExpression",
     *             "optional": false
     *             "callee": {
     *               "type": "Identifier",
     *               "name": "require"
     *             },
     *             "arguments": [
     *               {
     *                 "type": "Literal",
     *                 "value": "asd2",
     *                 "raw": "'asd2'"
     *               }
     *             ],
     *           },
     *           "property": {
     *             "type": "Identifier",
     *             "name": "key1"
     *           }
     *         }
     *       }
     *     ],
     *   },
     * ```
     *
     */
     console.log('converting...')
     const n = node as estree.VariableDeclaration
	const declator: estree.VariableDeclarator = n.declarations.filter(d => d.type === 'VariableDeclarator')[0];
	const membEx = declator.init as estree.MemberExpression;
	const pulledProp = membEx.property as estree.Identifier;
	const requireName = (membEx.object as estree.CallExpression).arguments.filter(({type}) => type === 'Literal')[0] as estree.Literal;
	const local = {type: 'Identifier', name: `${requireName.value}_${pulledProp.name}`} as estree.Identifier;

	const importing:estree.ImportDeclaration = {
		type: 'ImportDeclaration',
		source: requireName,
		specifiers: [
			{
				type: 'ImportSpecifier',
				imported: pulledProp,
				local,
			},
		],
	};
	const assigning:estree.VariableDeclaration = {
		type: 'VariableDeclaration', 
		kind: n.kind,
		declarations: [
			{
				type: 'VariableDeclarator',
				id: declator.id as estree.Identifier,
				init: local,
			},
		],
	};
     console.log({importing, assigning})
	return [importing, assigning];
};

const requireWithConnectedProperty = {
	type: 'VariableDeclaration',
	id: {init: {callee: {name: 'require'}}},
};

export const selector = {
	obj: requireWithConnectedProperty,
	str: createSelector(requireWithConnectedProperty),
};

export const testNode = (node:estree.Node | estree.Node[]):boolean => {
     return Array.isArray(node) 
          ? false
          : node.type ==='VariableDeclaration' && 
               (node as any).declarations[0].id?.init?.callee?.name === 'require'
}

type Dict<T> = {[key:string]:T}

export const discoverNodes = async (ast: estree.Program, cfg:unknown):Promise<Dict<estree.Node | estree.Node[]>>=>{
     return acorn.findNodePaths(ast, testNode)
     // return paths
}
export const toOps = async (loc:string, oldNode: estree.Node | estree.Node[] , cfg:unknown, newNodes?:Dict<estree.Node>): Promise<Dict<patches.Operation[]>>=>{
     return  {}
}
export const listOps = async (ast: estree.Program, cfg:unknown):Promise<patches.Operation[]>=>{
     const changeThese = await discoverNodes(ast, cfg)
     const tupleOps = (await Promise.all(
          Object.entries(changeThese)
               .map(async ([k,v])=>{
                    return Object.values(await toOps(k, v, cfg))
               })
          )).flat(3)
     return tupleOps
}

export default async (body: estree.Node[]): Promise<estree.Node[]> => 
     body.reduce(async (acc, node) => {
               return testNode(node)
               ? [...(await acc), ...convert(node as estree.VariableDeclaration)]
               : [...await acc, node]
          },Promise.resolve([] as estree.Node[])
     )