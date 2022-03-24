/* eslint-disable capitalized-comments */
/* eslint-disable no-unused-vars */
import {ITestFn, ITestCalcResult, isSubset} from '../testUtils';
import type {Node, VariableDeclaration} from 'estree';

import * as ac from '../../lib/sourceCode';
import * as esmImport from '../../lib/esmImports';
import * as declarationStyles from '../../lib/declarationStyles/index';

import {deepEqual} from 'assert';
import {generate} from 'escodegen';

// import {diff} from 'json-diff';

const deepEq = (a:unknown, e:unknown):boolean => {
	try {
		deepEqual(a, e);
		return true;
	} catch (_) {
		return false;
	}
};

export const test1: ITestFn = async (skip = false, ignore = false) => {
	const inputSrc = 'const a = require(\'asd\')';
	const inputTree = await ac.acorn.ecmaParse({src: inputSrc, file: 'not-real-esmImport-test.js'}) as ac.AcornRootNode;
	const vars = await ac.acorn.query(inputTree as Node, 'VariableDeclaration');

	// console.log({vars});
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
	const inputTree = await ac.acorn.ecmaParse({src: inputSrc, file: 'not-real-esmImport-test.js'}) as ac.AcornRootNode;
	const vars = await ac.acorn.query(inputTree as Node, 'VariableDeclaration');

	// Console.log({vars});
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
	// Local test runner
	const tr = (await test2(false, false)) as ITestCalcResult;
	console.log({tr});
	const {actual, expected} = tr;
	console.log(JSON.stringify(actual, null, 2));
	console.log(JSON.stringify(expected, null, 2));
})();

export default {
	requires: {
		importASTchanges: test1(),
		toImportString: test2(),
	},
};
