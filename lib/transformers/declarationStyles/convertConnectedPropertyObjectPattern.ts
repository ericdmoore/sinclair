import * as estree from 'estree';
import {stripStartEnd} from '../../../tests/_utils/stripLocFrom'

/**
 * ## Convert a Connected Property for an Object Pattern
 *
 * @param node
 */
export const convert = (node: estree.Node): estree.Node[] => {
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
     
     const n = node as estree.VariableDeclaration

	const declator: estree.VariableDeclarator = n.declarations
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
		kind: n.kind,
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

export const testNode = (node:estree.Node | estree.Node[]):boolean=>{
     console.log('looking for connected props', JSON.stringify(stripStartEnd(node),null,2))
     return Array.isArray(node) 
          ? false 
          : node.type === 'VariableDeclaration' 
               && node.declarations[0]?.init?.type === 'MemberExpression'
               && hasRequireFn(node.declarations[0]?.init)
}
