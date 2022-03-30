/* eslint-disable capitalized-comments */

import * as estree from 'estree';
import {ITestFn, ITestCalcResult, ITestSkipped, ITestIgnored,  deepEq} from '../../tests';

import * as ac from '../../../lib/sourceCode';
// import * as acorn from 'acorn'
import * as declarationStyles from '../../../lib/declarationStyles/index';
import {stripStartEnd, normalSpaces} from '../../_utils/index'
import {generate} from 'escodegen';
import { tryStatement } from '@babel/types';


const inputSrc = 'const a1 = require(\'impliedFunc\')(\'arirty1Param\')';
const inputSrc2 = 'let {a2} = require(\'impliedFunc\')(\'arirty1Param\')(\'arirty2Param\')';

const buildTest = (name:string, input: string, expected:string): ITestFn => async (skip, ignore) => {
	if(skip || ignore){ return { name, skip, ignore } as ITestSkipped | ITestIgnored}
	const inputTree = await ac.acorn.ecmaParse({src: input, file: 'not-real-esmImport-test.js'}) as ac.AcornRootNode;
	const vars = await ac.acorn.query(inputTree as estree.Node, 'VariableDeclaration');

	const convertedNodes = await declarationStyles.impliedDefaultFunction.convert(vars[0] as estree.VariableDeclaration)
	const actual = normalSpaces(convertedNodes.map(ast => generate(ast)).join('\n'))

	return {
		name,
		skip: true, //  skip ?? false,
		ignore: true, //ignore ?? false,
		actual,
		expected,
		testPassed: deepEq(actual, expected),
	};
}

export const astTest: ITestFn = async (skip = false, ignore = false) => {
	const inputTree = await ac.acorn.ecmaParse({src: inputSrc, file: 'not-real-esmImport-test.js'}) as ac.AcornRootNode;
	const vars = await ac.acorn.query(inputTree as estree.Node, 'VariableDeclaration');

	const _actual = await declarationStyles.impliedDefaultFunction.convert(vars[0] as estree.VariableDeclaration);
	const expected = [
		{
			type: 'ImportDeclaration',
			source: {
				type: 'Literal',
				value: 'impliedFunc',
				raw: '\'impliedFunc\'',
			},
			specifiers: [
				{
					type: 'ImportDefaultSpecifier',	
					local: {type: 'Identifier', name: 'impliedFunc__defaultFunc'}
				}
			],
		},
		{	
			type:'VariableDeclaration',
			kind:'const',
			declarations:[
				{
				  type: "VariableDeclarator",
				  id: {
					type: "Identifier",
					name: "a1"
				  },
				  init: {
					type: "CallExpression",
					optional: false,
					arguments: [
					  {
						type: "Literal",
						value: "arirty1Param",
						raw: "'arirty1Param'"
					  }
					],
					callee: {
					  type: "Identifier",
					  callee: {
						type: "Identifier",
						name: "require"
					  },
					  optional: false,
					  name: "impliedFunc__defaultFunc",
					  arguments: [
						{
						  type: "Literal",
						  value: "impliedFunc",
						  raw: "'impliedFunc'"
						}
					  ]
					}
				  }
				}
			  ]
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


const convertToAst = async (s:string | estree.Node ): Promise<estree.Node> =>{
	return typeof s ==='string'
		? await ac.acorn.ecmaParse({src: s, file:'fakeFileFromRequireTestIMpliedDefault.test.ts'}) as estree.Node
		: s as estree.Node
}

export const replaceRequire2 = (name: string, 
	replacer: estree.Identifier, 
	input: string | estree.Node, 
	expected: string| estree.Node ): ITestFn => async (skip, ignore)=>{

const inp = await convertToAst(input)

const updated = declarationStyles.impliedDefaultFunction.replaceRequireFn(replacer, inp)
const actual = generate(updated)

const exp = typeof expected === 'string' 
	? expected
	: generate(expected)

return {
	name,
	skip : skip ?? false,
	ignore: ignore ?? false,
	actual,
	expected: exp,
	testPassed: deepEq(actual,exp)
}
}

export const tests = {
	replacerTests:{
		codeChanges: replaceRequire2(
			'replace2',
			{type:'Identifier', name:'defaultFunc'},
			'const a = require("asdf")("other")',
			'const a = defaultFunc(\'other\');'
		)
	},
	requireImpliedFunction: {
		artiy1: buildTest(
			'arity1',
			inputSrc,
			'import impliedFunc__defaultFunc from \'impliedFunc\'; const a1 = impliedFunc__defaultFunc(\'arirty1Param\');'
		),
		artiy2: buildTest(
			'arity1',
			inputSrc2,
			'import impliedFunc__defaultFunc from \'impliedFunc\'; let {a2} = impliedFunc__defaultFunc(\'arirty1Param\')(\'arirty2Param\');'
		),
		astTest,
	},
};

export default tests;

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
(async () => {
	if (typeof module !== 'undefined' && require.main === module) {
		// Local test runner
		console.log('>>> local runner ');
		const trs = await Promise.all([
			tests.replacerTests.codeChanges(),
			tests.requireImpliedFunction.artiy2(),
			tests.requireImpliedFunction.artiy2(),
			tests.requireImpliedFunction.astTest(),
		]) as ITestCalcResult[]


		trs.forEach((test, i)=>{
			console.log(i+1,'actual  :', JSON.stringify(test.actual, null, 2));
			console.log(i+1,'expected:', JSON.stringify(test.expected, null, 2));
			console.log('')
		})

		
		
		console.log( trs.map((t,i)=>({i:i+1, pass: t.testPassed })) )
		
		// failed reports
		trs.filter(t=>!t.testPassed).forEach((t,i)=>{
			console.log(i+1, t.name, 'expected: ' ,JSON.stringify(t.expected,null,2))
			console.log(i+1, t.name, 'actual  : ' ,JSON.stringify(t.actual,null,2))
		})
	}
})();