import * as estree from 'estree';

/**
 * Type1 conversion
 * @param node
 */
export const convert = (node: estree.Node): estree.ImportDeclaration[] => {
	/**
      * ```json from> "cosnt = require('asd')"
      *     {
      *     "type": "VariableDeclaration",
      *     "kind": "const"
      *     "declarations": [
      *       {
      *         "type": "VariableDeclarator",
      *         "id": {
      *           "type": "Identifier",
      *           "name": "a"
      *         },
      *         "init": {
      *           "optional": false
      *           "type": "CallExpression",
      *           "callee": {
      *             "type": "Identifier",
      *             "name": "require"
      *           },
      *           "arguments": [
      *             {
      *               "type": "Literal",
      *               "value": "asd",
      *               "raw": "'asd'"
      *             }
      *           ],
      *         }
      *       }
      *     ],
      *   },
      * ```
      */
	
	// console.log(JSON.stringify(node,null,2))

	const n = node as estree.VariableDeclaration
	const decl: estree.VariableDeclarator = (n.declarations ?? []).filter(d => d.type === 'VariableDeclarator')[0];
	const callEx = decl.init as estree.CallExpression;
	const args = callEx.arguments.filter(({type}) => type === 'Literal')[0] as estree.Literal;

	const ret: estree.ImportDeclaration = {
		type: 'ImportDeclaration',
		source: args,
		specifiers: [{
			type: 'ImportDefaultSpecifier',
			local: {
				type: 'Identifier',
				name: (decl.id as estree.Identifier).name,
			},
		}],
	};

	return [ret];
};

export const testNode = (node: estree.Node | estree.Node[]):boolean=>{
	return Array.isArray(node)
		? false 
		: node.type === 'VariableDeclaration' 
		  && (node as any).declarations[0]?.init?.callee?.name === 'require'
		  && typeof (node as any).declarations[0]?.id.name === 'string'
		  && !((node as any).declarations[0]?.id?.properties ?? []).some((prop: {type:string}) => prop.type === 'RestElement' )
}