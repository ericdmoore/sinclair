import type {PromiseOr} from '../types';
import * as estree from 'estree';
import {createSelector, JSish} from '../createQuerySelector';

const defaultRequireObj = {
	type: 'VariableDeclaration',
	declarations: {'*': {
		id: {type: 'Identifier'},
		init: {
			type: 'CallExpression',
			callee: {name: 'require'},
		},
	}},
};

/**
 * Type1 conversion
 * @param node
 */
export const convert = (node: estree.VariableDeclaration): estree.ImportDeclaration[] => {
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

	const decl: estree.VariableDeclarator = (node.declarations ?? []).filter(d => d.type === 'VariableDeclarator')[0];
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

export const selector = {
	obj: defaultRequireObj,
	str: createSelector(defaultRequireObj),
};

export const find = (_selector:string | JSish) => (_ast :PromiseOr<estree.Node>) => {};

/**
 * Per node
 */
export const alter = async (_node :PromiseOr<estree.VariableDeclaration>):Promise<estree.Node> => {
	// Const _n = await node;
	const ret: estree.ImportDeclaration = {
		type: 'ImportDeclaration',
		source: {
			type: 'Literal',
			raw: '',
			value: '',
		},
		specifiers: [
			{
				type: 'ImportSpecifier',
				imported: {type: 'Identifier', name: ''},
				local: {type: 'Identifier', name: ''}, // For `as` token
			},
		],
	};
	return ret;
};

export const apply = (_selector:string | JSish) => async (ast :PromiseOr<estree.Node>) : Promise<estree.Node> => ast;

