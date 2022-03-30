
import * as estree from 'estree';
import {createSelector} from '../createQuerySelector';

/**
 * ## Convert a Connected Property for an Object Pattern
 *
 * @param node
 */
export const convert = (node: estree.VariableDeclaration): estree.Node[] => {
	/**
     * ```json require
     * {
     *  "type": "VariableDeclaration",
     *  "kind": "const"
     *  "declarations": [
     *    {
     *      "type": "VariableDeclarator",
     *      "id": {
     *        "type": "ObjectPattern",
     *        "properties": [
     *          {
     *            "type": "Property",
     *            "method": false,
     *            "shorthand": true,
     *            "computed": false,
     *            "key": {
     *              "type": "Identifier",
     *              "name": "a3"
     *            },
     *            "kind": "init",
     *            "value": {
     *              "type": "Identifier",
     *              "name": "a3"
     *            }
     *          }
     *        ]
     *      },
     *      "init": {
     *        "type": "MemberExpression",
     *        "object": {
     *          "type": "CallExpression",
     *          "callee": {
     *            "type": "Identifier",
     *            "name": "require"
     *          },
     *          "arguments": [
     *            {
     *              "type": "Literal",
     *              "value": "asd3",
     *              "raw": "'asd3'" // from
     *            }
     *          ],
     *          "optional": false
     *        },
     *        "property": {
     *          "type": "Identifier",
     *          "name": "key2" // key to  import
     *        },
     *        "computed": false,
     *        "optional": false
     *      }
     *    }
     *  ],
     *},
     * ```
     */

	const declator: estree.VariableDeclarator = node.declarations
		.filter(d => d.type === 'VariableDeclarator')[0];
	const membEx = declator.init as estree.MemberExpression;
	const callEx = membEx.object as estree.CallExpression;
	const pulledProp = membEx.property as estree.Identifier;

	const importing:estree.ImportDeclaration = {
		type: 'ImportDeclaration',
		source: callEx.arguments.filter(({type}) => type === 'Literal')[0] as estree.Literal,
		specifiers: [
			{
				type: 'ImportSpecifier',
				imported: pulledProp,
				local: pulledProp,
			},
		],
	};

	const assigning:estree.VariableDeclaration = {
		type: 'VariableDeclaration',
		kind: node.kind,
		declarations: [
			{
				type: 'VariableDeclarator',
				id: declator.id as estree.ObjectPattern,
				init: pulledProp,
			},
		],
	};

	return [importing, assigning];
};

const requireWithObjecPatternandConnectedProperty = {
	type: 'VariableDeclaration',
	id: {init: {callee: {name: 'require'}}},
};

export const selector = {
	obj: requireWithObjecPatternandConnectedProperty,
	str: createSelector(requireWithObjecPatternandConnectedProperty),
};
