import * as declarationStyles from './declarationStyles/index';

/**
 * Supprted Patterns
 *
 * 1. const a = require('asd')  // default
 * 2. const {a1 , b1} = require('asd1')  // objectPattern
 * 3. const myA2 = require('asd2').key1  // Var Assignment of connected Property
 * 4. const { a3 } = require('asd3').key2 // ObjPattern Assignment of Connected Property
 * 5. const myA4 = require('asd4')('SomeParam') // Assignment From Imported Default Function Call
 * 6. const {myA5} = require('asd5')('SomeParam').key3 // Object Pattern Assigment From Implied Function and Key DeReferencex
 *
 */

// TYPE1
export const requireDefault = declarationStyles.convertDefault;

// TYPE2
export const requireDefaultObjectPattern = declarationStyles.convertObjectPattern;

// TYPE3 + 4
export const requireConnectedProp = declarationStyles.convertConnectedProperty;

// // TYPE4s
// export const requireDefault = declarationStyles.conver;

// TYPE5
export const requireImpliedDefaultFunction = declarationStyles.convertImpliedDefaultFunction;

// Const replaceRequireWith = (newF: estree.Identifier, tree: estree.CallExpression): estree.CallExpression => {
// 	if (tree.callee.type === 'Identifier' && tree.callee.name === 'require') {
// 		tree.callee = newF;
// 		return tree;
// 	}

// 	if (tree.callee.type === 'CallExpression') {
// 		return replaceRequireWith(newF, tree.callee);
// 	}

// 	throw new Error('Need more logic branches for repalacing require and copying moving the crazy complicated JS chains');
// };

// const findRequireName = (c: estree.CallExpression) : estree.Literal => {
// 	const callEx = c.callee;
// 	if (c.callee.type === 'CallExpression') {
// 		return findRequireName(c.callee as estree.CallExpression);
// 	}

// 	if (c.callee.type === 'Identifier' && (c.callee as estree.Identifier)?.name === 'require') {
// 		return c.arguments[0] as estree.Literal;
// 	}

// 	throw new Error('Need more logic branches for finding the require');
// };

// export const convertMultiDeclatationToMultiLine = (node: estree.VariableDeclaration):estree.Node[] => [];

// /**
//  * Type2
//  * @param node
//  */
// export const convertObjectPattern = (node: estree.VariableDeclaration): estree.Node[] => {
// 	/**
//      *
//      * ```json require
//      *    {
//      *     "type": "VariableDeclaration",
//      *     "kind": "const"
//      *     "declarations": [
//      *       {
//      *         "type": "VariableDeclarator",
//      *         "id": {
//      *           "type": "ObjectPattern",
//      *           "properties": [
//      *             {
//      *               "type": "Property",
//      *               "method": false,
//      *               "shorthand": true,
//      *               "computed": false,
//      *               "key": {
//      *                 "type": "Identifier",
//      *                 "name": "a1"
//      *               },
//      *               "kind": "init",
//      *               "value": {
//      *                 "type": "Identifier",
//      *                 "name": "a1"
//      *               }
//      *             },
//      *             {
//      *               "type": "Property",
//      *               "method": false,
//      *               "shorthand": true,
//      *               "computed": false,
//      *               "key": {
//      *                 "type": "Identifier",
//      *                 "name": "b1"
//      *               },
//      *               "kind": "init",
//      *               "value": {
//      *                 "type": "Identifier",
//      *                 "name": "b1"
//      *               }
//      *             }
//      *           ]
//      *         },
//      *         "init": {
//      *           "type": "CallExpression",
//      *           "start": 55,
//      *           "end": 70,
//      *           "callee": {
//      *             "type": "Identifier",
//      *             "name": "require"
//      *           },
//      *           "arguments": [
//      *             {
//      *               "type": "Literal",
//      *               "value": "asd1",
//      *               "raw": "'asd1'"
//      *             }
//      *           ],
//      *           "optional": false
//      *         }
//      *       }
//      *     ],
//      *   },
//      *
//      * ```
//      */

// 	/**
//      *
//      * ```json import
//      * ```
//      */

// 	const decl: estree.VariableDeclarator = node.declarations.filter(d => d.type === 'VariableDeclarator')[0];
// 	const callEx = decl.init as estree.CallExpression;
// 	const requiredArgs = callEx.arguments.filter(({type}) => type === 'Literal')[0] as estree.Literal;

// 	const objPattern = decl.id as estree.ObjectPattern;
// 	const patternedNames: estree.ImportSpecifier[] = objPattern.properties.map(o => {
// 		console.log(o.type === 'RestElement');// Throw
// 		if (o.type === 'Property') {
// 			return {
// 				type: 'ImportSpecifier',
// 				imported: o.key as estree.Identifier,
// 				local: o.value as estree.Identifier,
// 			};
// 		}

// 		return {
// 			type: 'ImportSpecifier',
// 			imported: {type: 'Identifier', name: '...'} as estree.Identifier,
// 			local: {type: 'Identifier', name: '...'} as estree.Identifier,
// 		};
// 	});

// 	const ret: estree.ImportDeclaration = {
// 		type: 'ImportDeclaration',
// 		source: requiredArgs,
// 		specifiers: patternedNames,
// 	};
// 	return [ret];
// };

// const requireWithObjecPattern = {
// 	type: 'VariableDeclaration',
// 	id: {
// 		type: 'ObjectPattern', init: {callee: {name: 'require'}},
// 	},
// };

// /**
//  * Type3
//  * @param node
//  */
// export const convertConnectedProperty = (node: estree.VariableDeclaration): estree.Node[] => {
// /**
//  *
//  * ```json require
//  *  {
//  *     "type": "VariableDeclaration",
//  *     "kind": "const"
//  *     "declarations": [
//  *       {
//  *         "type": "VariableDeclarator",
//  *         "id": {
//  *           "type": "Identifier",
//  *           "name": "myA2"
//  *         },
//  *         "init": {
//  *           "type": "MemberExpression",
//  *           "object": {
//  *             "type": "CallExpression",
//  *             "callee": {
//  *               "type": "Identifier",
//  *               "name": "require"
//  *             },
//  *             "arguments": [
//  *               {
//  *                 "type": "Literal",
//  *                 "value": "asd2",
//  *                 "raw": "'asd2'"
//  *               }
//  *             ],
//  *             "optional": false
//  *           },
//  *           "property": {
//  *             "type": "Identifier",
//  *             "name": "key1"
//  *           },
//  *           "computed": false,
//  *           "optional": false
//  *         }
//  *       }
//  *     ],
//  *   },
//  * ```
//  *
//  */

// 	const declator: estree.VariableDeclarator = node.declarations.filter(d => d.type === 'VariableDeclarator')[0];
// 	const membEx = declator.init as estree.MemberExpression;
// 	const callEx = membEx.object as estree.CallExpression;
// 	const pulledProp = membEx.property as estree.Identifier;

// 	const importing:estree.ImportDeclaration = {
// 		type: 'ImportDeclaration',
// 		source: callEx.arguments.filter(({type}) => type === 'Literal')[0] as estree.Literal,
// 		specifiers: [
// 			{
// 				type: 'ImportSpecifier',
// 				imported: pulledProp,
// 				local: pulledProp,
// 			},
// 		],
// 	};
// 	const assigning:estree.VariableDeclaration = {
// 		type: 'VariableDeclaration',
// 		kind: node.kind,
// 		declarations: [
// 			{
// 				type: 'VariableDeclarator',
// 				id: declator.id as estree.Identifier,
// 				init: pulledProp,
// 			},
// 		],
// 	};

// 	return [importing, assigning];
// };

// const requireWithConnectedProperty = {
// 	type: 'VariableDeclaration',
// 	id: {init: {callee: {name: 'require'}}},
// };

// /**
//  * Type4
//  * @param node
//  */
// export const convertConnectedPropertyObjectPattern = (node: estree.VariableDeclaration): estree.Node[] => {
// 	/**
//      * ```json require
//      * {
//      *  "type": "VariableDeclaration",
//      *  "kind": "const"
//      *  "declarations": [
//      *    {
//      *      "type": "VariableDeclarator",
//      *      "id": {
//      *        "type": "ObjectPattern",
//      *        "properties": [
//      *          {
//      *            "type": "Property",
//      *            "method": false,
//      *            "shorthand": true,
//      *            "computed": false,
//      *            "key": {
//      *              "type": "Identifier",
//      *              "name": "a3"
//      *            },
//      *            "kind": "init",
//      *            "value": {
//      *              "type": "Identifier",
//      *              "name": "a3"
//      *            }
//      *          }
//      *        ]
//      *      },
//      *      "init": {
//      *        "type": "MemberExpression",
//      *        "object": {
//      *          "type": "CallExpression",
//      *          "callee": {
//      *            "type": "Identifier",
//      *            "name": "require"
//      *          },
//      *          "arguments": [
//      *            {
//      *              "type": "Literal",
//      *              "value": "asd3",
//      *              "raw": "'asd3'" // from
//      *            }
//      *          ],
//      *          "optional": false
//      *        },
//      *        "property": {
//      *          "type": "Identifier",
//      *          "name": "key2" // key to  import
//      *        },
//      *        "computed": false,
//      *        "optional": false
//      *      }
//      *    }
//      *  ],
//      *},
//      * ```
//      */

// 	const declator: estree.VariableDeclarator = node.declarations
// 		.filter(d => d.type === 'VariableDeclarator')[0];
// 	const membEx = declator.init as estree.MemberExpression;
// 	const callEx = membEx.object as estree.CallExpression;
// 	const pulledProp = membEx.property as estree.Identifier;

// 	const importing:estree.ImportDeclaration = {
// 		type: 'ImportDeclaration',
// 		source: callEx.arguments.filter(({type}) => type === 'Literal')[0] as estree.Literal,
// 		specifiers: [
// 			{
// 				type: 'ImportSpecifier',
// 				imported: pulledProp,
// 				local: pulledProp,
// 			},
// 		],
// 	};

// 	const assigning:estree.VariableDeclaration = {
// 		type: 'VariableDeclaration',
// 		kind: node.kind,
// 		declarations: [
// 			{
// 				type: 'VariableDeclarator',
// 				id: declator.id as estree.ObjectPattern,
// 				init: pulledProp,
// 			},
// 		],
// 	};

// 	return [importing, assigning];
// };

// const requireWithObjecPatternandConnectedProperty = {
// 	type: 'VariableDeclaration',
// 	id: {init: {callee: {name: 'require'}}},
// };

// /**
//  * Type5
//  * @param node
//  */
// export const convertImpliedDefaultFunction = (node: estree.VariableDeclaration): estree.Node[] => {
// 	/**
//      * ```json require
//      * {
//      *  "type": "VariableDeclaration",
//      *  "kind": "const"
//      *  "declarations": [
//      *    {
//      *      "type": "VariableDeclarator",
//      *      "id": {
//      *        "type": "Identifier",
//      *        "name": "myA4"
//      *      },
//      *      "init": {
//      *        "type": "CallExpression",
//      *        "callee": {
//      *          "type": "CallExpression",
//      *          "callee": {
//      *            "type": "Identifier",
//      *            "name": "require"
//      *          },
//      *          "arguments": [
//      *            {
//      *              "type": "Literal",
//      *              "value": "asd4", // from
//      *              "raw": "'asd4'"
//      *            }
//      *          ],
//      *          "optional": false
//      *        },
//      *        "arguments": [
//      *          {
//      *            "type": "Literal",
//      *            "value": "SomeParam",
//      *            "raw": "'SomeParam'"
//      *          }
//      *        ],
//      *        "optional": false
//      *      }
//      *    }
//      *  ],
//      *},
//      * ```
//      */

// 	const declator: estree.VariableDeclarator = node.declarations
// 		.filter(d => d.type === 'VariableDeclarator')[0];

// 	const outterCall = declator.init as estree.CallExpression;
// 	const innerCall = outterCall.callee as estree.CallExpression;
// 	const args = innerCall.arguments[0] as estree.Literal;

// 	const madeUpFunctionName:estree.Identifier = {
// 		type: 'Identifier',
// 		name: `${args.value ?? `__${Date.now()}`}`,
// 	};

// 	const importing:estree.ImportDeclaration = {
// 		type: 'ImportDeclaration',
// 		source: findRequireName(outterCall) as estree.Literal,
// 		specifiers: [
// 			{
// 				type: 'ImportSpecifier',
// 				imported: madeUpFunctionName,
// 				local: madeUpFunctionName,
// 			},
// 		],
// 	};
// 	const assigning : estree.VariableDeclaration = {
// 		type: 'VariableDeclaration',
// 		kind: node.kind,
// 		declarations: [{
// 			type: 'VariableDeclarator',
// 			id: declator.id as estree.Identifier,
// 			init: replaceRequireWith(madeUpFunctionName, outterCall),
// 		}],

// 	};
// 	return [importing, assigning];
// };

// const requireWithImpliedDefaultFunction = {
// 	type: 'VariableDeclaration',
// 	id: {init: {callee: {name: 'require'}}},
// };

// const selectorObj = {type: 'VariableDeclataion'};

// export const selector = {
// 	o: selectorObj,
// 	s: createSelector(selectorObj),
// };
