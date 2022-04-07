/* eslint-disable capitalized-comments */

import type {Node, VariableDeclaration} from 'estree';
import {ITestFn, ITestCalcResult, isSubset, deepEq} from '../../tests';
import * as ac from '../../../lib/sourceCode';
import * as declarationStyles from '../../../lib/transformers/declarationStyles/index';
import {generate} from 'escodegen';



export const test1: ITestFn = async (skip = false, ignore = false) => {
	const inputSrc = 'const a = require(\'asd\')';
	const inputTree = await ac.acorn.ecmaParse({src: inputSrc, file: 'not-real-esmImport-test.js'});
	const vars = await ac.acorn.query(inputTree, 'VariableDeclaration');

	const _actual = await declarationStyles.defaults.convert(vars[0] as VariableDeclaration);
	const expected = [
		{
			type: 'ImportDeclaration',
			source: {
				type: 'Literal',
				value: 'asd',
				raw: '\'asd\'',
			},
			specifiers: [
				{
					type: 'ImportDefaultSpecifier',
					local: {type: 'Identifier', name: 'a'},
				},
			],
		},
	];

	// Clean up the actual so that we can use the deepeq to compare to
	const actual = _actual.map(v => {
		const {start, end, ...src} = (v as any).source as any;
		return {...v, source: src};
	});

	return {
		name: 'Default Require',
		skip,
		ignore,
		actual,
		expected,
		testPassed: deepEq(actual, expected),
	};
};

export const test2: ITestFn = async (skip = false, ignore = false) => {
	const inputSrc = 'const a = require(\'asd\')';
	const inputTree = await ac.acorn.ecmaParse({src: inputSrc, file: 'not-real-esmImport-test.js'});
	const vars = await ac.acorn.query(inputTree, 'VariableDeclaration');

	const _actual = await declarationStyles.defaults.convert(vars[0] as VariableDeclaration);
	const expected = [
		{
			type: 'ImportDeclaration',
			source: {
				type: 'Literal',
				value: 'asd',
				raw: '\'asd\'',
			},
			specifiers: [
				{
					type: 'ImportDefaultSpecifier',
					local: {type: 'Identifier', name: 'a'},
				},
			],
		},
	];

	// Clean up the actual so that we can use the deepeq to compare to
	const actual = _actual.map(v => {
		const {start, end, ...src} = (v as any).source as any;
		return {...v, source: src};
	});

	return {
		name: 'Default Require string',
		skip,
		ignore,
		actual: actual.map(ast => generate(ast)).join(''),
		expected: 'import a from \'asd\';',
		testPassed: deepEq(actual, expected),
	};
};

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

(async () => {
	if (typeof module !== 'undefined' && require.main === module) {
		// Local test runner
		const tr = (await test2(false, false)) as ITestCalcResult;
		console.log('>>> local runner ');
		console.log({tr});
		const {actual, expected} = tr;
		console.log(JSON.stringify(actual, null, 2));
		console.log(JSON.stringify(expected, null, 2));
	}
})();

export default {
	requires: {
		importASTchanges: test1,
		toImportString: test2,
	},
};
