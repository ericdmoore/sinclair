import * as estree from 'estree';
import {createSelector} from '../createQuerySelector';

/**
 * Type2
 * @param node
 */
export const convert = (node: estree.VariableDeclaration): estree.Node[] => {
	/**
     *
     * ```json from> "const {a1,  b1} = require('asd1')" // note> const {a1, ...b1} = require('CAN NOT BE TRANSLATED') - may not be valid NODE.js either
     *    {
     *     "type": "VariableDeclaration",
     *     "kind": "const"
     *     "declarations": [
     *       {
     *         "type": "VariableDeclarator",
     *         "id": {
     *           "type": "ObjectPattern",
     *           "properties": [
     *             {
     *               "type": "Property",
     *               "method": false,
     *               "shorthand": true,
     *               "computed": false,
     *               "key": {
     *                 "type": "Identifier",
     *                 "name": "a1"
     *               },
     *               "kind": "init",
     *               "value": {
     *                 "type": "Identifier",
     *                 "name": "a1"
     *               }
     *             },
     *             {
     *               "type": "Property",
     *               "method": false,
     *               "shorthand": true,
     *               "computed": false,
     *               "key": {
     *                 "type": "Identifier",
     *                 "name": "b1"
     *               },
     *               "kind": "init",
     *               "value": {
     *                 "type": "Identifier",
     *                 "name": "b1"
     *               }
     *             }
     *           ]
     *         },
     *         "init": {
     *           "type": "CallExpression",
     *           "callee": {
     *             "type": "Identifier",
     *             "name": "require"
     *           },
     *           "arguments": [
     *             {
     *               "type": "Literal",
     *               "value": "asd1",
     *               "raw": "'asd1'"
     *             }
     *           ],
     *           "optional": false
     *         }
     *       }
     *     ],
     *   },
     *
     * ```
     */

	const decl: estree.VariableDeclarator = node.declarations.filter(d => d.type === 'VariableDeclarator')[0];
	const callEx = decl.init as estree.CallExpression;
	const objPattern = decl.id as estree.ObjectPattern;

	const requiredArgs = callEx.arguments.filter(({type}) => type === 'Literal')[0] as estree.Literal;

	// Convert Property -> ImportSpecifier
	const patternedNames: estree.ImportSpecifier[] = objPattern.properties
		.filter(o => o.type === 'Property')
		.map(o => ({
			type: 'ImportSpecifier',
			imported: (o as estree.Property).key as estree.Identifier,
			local: (o as estree.Property).value as estree.Identifier,
		}));

	const ret: estree.ImportDeclaration = {
		type: 'ImportDeclaration',
		source: requiredArgs,
		specifiers: patternedNames,
	};
	return [ret];
};

const requireWithObjecPattern = {
	type: 'VariableDeclaration',
	id: {
		type: 'ObjectPattern', init: {callee: {name: 'require'}},
	},
};

export const selector = {
	obj: requireWithObjecPattern,
	str: createSelector(requireWithObjecPattern),
};
