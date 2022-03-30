/* eslint-disable capitalized-comments */

import * as estree from 'estree';
import {ITestFn, ITestCalcResult, isSubset, deepEq} from '../../tests';

import * as ac from '../../../lib/sourceCode';
import * as declarationStyles from '../../../lib/declarationStyles/index';
import {stripStartEnd, normalSpaces} from '../../_utils/index'
import {generate} from 'escodegen';

const inputSrc = 'var {a1, b2, c3} = require(\'objectPattern\')';

const buildTest = (name:string, input: string, expected:string): ITestFn => async (skip, ignore) => {
	const inputTree = await ac.acorn.ecmaParse({src: input, file: 'not-real-esmImport-test.js'}) as ac.AcornRootNode;
	const vars = await ac.acorn.query(inputTree as estree.Node, 'VariableDeclaration');
	// console.log(2, JSON.stringify({vars},null,2))

	const convertedNodes = await declarationStyles.objectPatterns.convert(vars[0] as estree.VariableDeclaration)
	const actual:string = normalSpaces(convertedNodes.map(ast => generate(ast)).join('\n'))

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

	const _actual = await declarationStyles.objectPatterns.convert(vars[0] as estree.VariableDeclaration);
	// Clean up the actual so that we can use the deepeq to compare to
	const actual = stripStartEnd(_actual)
	const expected = [
		{
			type: 'ImportDeclaration',
			source: {
				type: 'Literal',
				value: 'objectPattern',
				raw: '\'objectPattern\'',
			},
			specifiers: [
				{
					type: 'ImportSpecifier',
					local: {type: 'Identifier', name: 'a1'},
					imported: {type: 'Identifier', name: 'a1'},
				},
				{
					type: 'ImportSpecifier',
					local: {type: 'Identifier', name: 'b2'},
					imported: {type: 'Identifier', name: 'b2'},
				},
				{
					type: 'ImportSpecifier',
					local: {type: 'Identifier', name: 'c3'},
					imported: {type: 'Identifier', name: 'c3'},
				},
			],
		},
	];
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
	requires: {
		importASTchanges: test1,
		importString: buildTest('basic',inputSrc,'import { a1, b2, c3 } from \'objectPattern\';')
	},
};

export default tests;


/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

;(async () => {
	if (typeof module !== 'undefined' && require.main === module) {
		// Local test runner
		console.log('>>> local runner ');
		const tr1 = await tests.requires.importASTchanges() as ITestCalcResult;
		const tr2 = await tests.requires.importString() as ITestCalcResult;

		console.log(1,'actual  :', JSON.stringify(tr1.actual, null, 2));
		console.log(1,'expected:', JSON.stringify(tr1.expected, null, 2));

		console.log(2,'actual  :', JSON.stringify(tr2.actual, null, 2));
		console.log(2,'expected:', JSON.stringify(tr2.expected, null, 2));
		console.log([{pass1: tr1.testPassed},{pass2: tr2.testPassed}])
	}
})();
