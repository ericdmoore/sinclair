/* eslint-disable capitalized-comments */
import {deepEqual} from 'assert'
import {diff} from 'json-diff'
import * as estree from 'estree';
import {ITestFn, ITestCalcResult, isSubset, deepEq} from '../../tests';

import * as ac from '../../../lib/sourceCode';
import * as declarationStyles from '../../../lib/declarationStyles/index';
import {stripStartEnd, normalSpaces} from '../../_utils/index'
import {generate} from 'escodegen';

const inputSrc = 'const a1 = require(\'connectedProp\').key1';
const inputSrc2 = 'var {a1, b2, c3} = require(\'connectedProp\').key2';

const buildTest = (name:string, input: string, expected:string): ITestFn => async (skip, ignore) => {
	const inputTree = await ac.acorn.ecmaParse({src: input, file: 'not-real-esmImport-test.js'}) as ac.AcornRootNode;
	const vars = await ac.acorn.query(inputTree as estree.Node, 'VariableDeclaration');
	// console.log(2, JSON.stringify({vars},null,2))

	const convertedNodes = await declarationStyles.connectedProperty.convert(vars[0] as estree.VariableDeclaration)
	const actual = normalSpaces(convertedNodes.map(ast => generate(ast)).join('\n'))

	// console.log(2, JSON.stringify({convertedNodes, actual},null,2))

	return {
		name,
		skip: skip ?? false,
		ignore: ignore ?? false,
		actual,
		expected,
		testPassed: deepEq(actual, expected),
	};
}

export const test1: ITestFn = async (skip = false, ignore = false) => {
	const inputTree = await ac.acorn.ecmaParse({src: inputSrc, file: 'not-real-esmImport-test.js'}) as ac.AcornRootNode;
	const vars = await ac.acorn.query(inputTree as estree.Node, 'VariableDeclaration');
	// console.log(1, JSON.stringify({vars},null,2))

	const _actual = await declarationStyles.connectedProperty.convert(vars[0] as estree.VariableDeclaration);
	const expected = [
		{
			type: 'ImportDeclaration',
			source: {
				type: 'Literal',
				value: 'connectedProp',
				raw: '\'connectedProp\'',
			},
			specifiers: [
				{
					type: 'ImportSpecifier',	
					imported: {type: 'Identifier', name: 'key1'},
					local: {type: 'Identifier', name: 'connectedProp_key1'},
				},
			],
		},
		{	
			type:'VariableDeclaration',
			kind:'const',
			declarations:[
				{
					type:'VariableDeclarator',
					id:{
						type:'Identifier',
						name: 'a1'
					},
					init:{
						type:'Identifier',
						name:'connectedProp_key1'
					}
				}
			],
		},
	];

	// Clean up the actual so that we can use the deepeq to compare to
	const actual = _actual.map(v => stripStartEnd(v));

	return {
		name: 'Object Pattern Require',
		skip,
		ignore,
		actual,
		expected,
		testPassed: deepEq(actual, expected),
	};
};

export const tests = {
	requireConnectedKey: {
		identifier: buildTest(
			'identifier pattern',
			inputSrc,
			'import { key1 as connectedProp_key1 } from \'connectedProp\'; const a1 = connectedProp_key1;'
		),
		objectPattern: buildTest(
			'object pattern',
			inputSrc2,
			'import { key2 as connectedProp_key2 } from \'connectedProp\'; var {a1, b2, c3} = connectedProp_key2;'
		),
		test1
	},
};

export default tests;
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

(async () => {
	if (typeof module !== 'undefined' && require.main === module) {
		// Local test runner
		console.log('>>> local runner ');
		const tr1 = await tests.requireConnectedKey.identifier() as ITestCalcResult
		const tr2 = await tests.requireConnectedKey.objectPattern() as ITestCalcResult
		const tr3 = await tests.requireConnectedKey.test1() as ITestCalcResult

		console.log(1,JSON.stringify(tr1.actual, null, 2));
		console.log(1,JSON.stringify(tr1.expected, null, 2));

		console.log(2,JSON.stringify(tr2.actual, null, 2));
		console.log(2,JSON.stringify(tr2.expected, null, 2));

		console.log('3a',JSON.stringify(tr3.actual, null, 2));
		console.log('3e',JSON.stringify(tr3.expected, null, 2));

		console.log([{pass1: tr1.testPassed},{pass2:tr2.testPassed}, {pass3: tr3.testPassed}])
		// deepEqual(tr3.actual, tr3.expected)
		console.log(diff(tr3.actual, tr3.expected))
	}
})();

// const inputSrc = 'const a1 = require(\'connectedProp\').key1';
// const inputSrc2 = 'var {a1, b2, c3} = require(\'connectedProp\').key2';



