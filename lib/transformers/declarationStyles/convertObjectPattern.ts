import * as estree from 'estree';
import {createSelector} from '../../createQuerySelector';
import {stripStartEnd} from '../../../tests/_utils/stripLocFrom'

/**
 * Type2
 * @param node
 */
export const convert = (node: estree.Node): estree.Node[] => {
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

     const n = node as estree.VariableDeclaration
	const decl: estree.VariableDeclarator = n.declarations.filter(d => d.type === 'VariableDeclarator')[0];
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
     
     console.log({patternedNames, objPatternProps: objPattern.properties})

     const madeUpNamespaceName = `${requiredArgs.value}_ns`
	const importing: estree.ImportDeclaration = {
		type: 'ImportDeclaration',
		specifiers: [{ type:'ImportNamespaceSpecifier', local:{ type:"Identifier",  name: madeUpNamespaceName} }],
          source: requiredArgs,
	};

     const assigning: estree.VariableDeclaration = {
		type: 'VariableDeclaration',
          kind: n.kind,
          declarations:[{
               type: 'VariableDeclarator',
               id: { type:'ObjectPattern', properties: objPattern.properties },
               init: { type:'Identifier', name: madeUpNamespaceName },
          }]
	};

	return [importing, assigning];
};

export const testNode = (node:estree.Node | estree.Node[]):boolean=>{
     if(Array.isArray(node) ){
          return false
     }else{
          if(node.type === 'VariableDeclaration'){
               const n = node as estree.VariableDeclaration
               const decl0IDObjPattern = n.declarations[0]?.id?.type === 'ObjectPattern'
               const decl0CallEx = n.declarations[0]?.init?.type === 'CallExpression'
               const fromRequire = (n.declarations[0]?.init as any)?.callee?.name === 'require'
               return decl0IDObjPattern && decl0CallEx && fromRequire
                    
          }else {
               return false
          }
     }
}