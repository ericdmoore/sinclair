/* eslint-disable capitalized-comments */
// import type {PromiseOr} from '../types';
import * as estree from 'estree';
import {createSelector} from '../createQuerySelector';

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
export const convertConnectedProperty = (node: estree.VariableDeclaration): estree.Node[] => {
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

	const declator: estree.VariableDeclarator = node.declarations.filter(d => d.type === 'VariableDeclarator')[0];
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
		kind: node.kind,
		declarations: [
			{
				type: 'VariableDeclarator',
				id: declator.id as estree.Identifier,
				init: local,
			},
		],
	};

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
