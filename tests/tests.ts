/* eslint-disable no-prototype-builtins */
import type { PromiseOr} from '../lib/types'
import { readdir } from 'fs/promises'
import { resolve } from 'path';
import merge from 'lodash.merge';
import globrex from 'globrex'
import {deepEqual} from 'assert'

export const deepEq = (a:unknown, e:unknown):boolean => {
	try {
		deepEqual(a, e);
		return true;
	} catch (_) {
		return false;
	}
};

export const skip = (f:ITestFn) => f(true, false);

export const ignore = (f:ITestFn) => f(true, true);

export interface ITestSkipped {
    name: string
    skip: true
    ignore?: boolean
}

export interface ITestIgnored {
    name: string
    ignore: true
    skip?: boolean
}

export interface ITestCalcResult {
    name: string
    ignore: false
    skip: false
    actual: unknown
    expected: unknown
    testPassed: PromiseLike<boolean> | boolean
}

export type ITestResult = ITestCalcResult | ITestIgnored | ITestSkipped

// eslint-disable-next-line no-unused-vars
export type ITestFn = (skip?:boolean, ignore?:boolean) => Promise <ITestResult>

// Const isPrim = (input: unknown) => ['string', 'number', 'boolean', 'null', 'bigint', 'undefined'].includes(typeof input);
// const notPrim = (input:unknown) => !isPrim(input);
// const {isArray} = Array;
// const isObj = (input:unknown) => typeof input === 'object';

/**
  * @credit https://github.com/studio-b12
  * @for https://github.com/studio-b12/is-subset/blob/master/module/index.js
  *
  * Check if an object is contained within another object.
  *
  * Returns `true` if:
  * - all enumerable keys of *subset* are also enumerable in *superset*, and
  * - every value assigned to an enumerable key of *subset* strictly equals
  *   the value assigned to the same key of *superset* – or is a subset of it.
  */
export const isSubset = (superset: Record<string, unknown>, subset: Record<string, unknown>) => {
	if (
		(typeof superset !== 'object' || superset === null)
      || (typeof subset !== 'object' || subset === null)
	) {
		return false;
	}

	if (
		(superset instanceof Date || subset instanceof Date)
	) {
		return superset.valueOf() === subset.valueOf();
	}

	return Object.keys(subset).every(key => {
		if (!superset.propertyIsEnumerable(key)) {
			return false;
		}

		const subsetItem = subset[key];
		const supersetItem = superset[key];
		if (
			(typeof subsetItem === 'object' && subsetItem !== null)
				? !isSubset(supersetItem as Record<string, unknown>, subsetItem as Record<string, unknown>)
				: supersetItem !== subsetItem
		) {
			return false;
		}

		return true;
	});
};

type Dict<T> = {[key:string]: T | Dict<T>}
type ITestObj = Dict<ITestFn>
type ITestRunAccum = Dict<ITestResult>

export const mergeTests = (l: ITestObj, ...r: ITestObj[]) =>
	r.length > 0
		? r.reduce((p, c) => merge(p, c), l)
		: l;


const direntsFromFolder = (dir:string) => readdir(dir, { withFileTypes: true })

const prefixBeforeStar = (s : string)=> {
	const n = s.indexOf('*') 
	return n === -1 
		? s
		: s.slice(0,n)
}


export const findTestFiles = async (
		discoveryPaths:string[] = ['/tests/**/*.test.ts'], 
		filter?:RegExp[]
	):Promise<string[]> => {

	const paths = [] as string[]
	const localFilters:RegExp[] = filter 
		?? discoveryPaths.map(path => globrex(path,{extended:true, globstar:true}).regex) 

	let i = 0
	for(const pathname of discoveryPaths){
		const pathRe = localFilters[i]
		const fsDir = prefixBeforeStar(pathname)

		const dirents = await direntsFromFolder(fsDir)
		const files = dirents
			.filter(d=>d.isFile())
			.map(d=>resolve(fsDir, d.name))
			.filter(n=>pathRe.test(n))
		
		paths.push(...files)

		const subDirs = dirents.filter(d=>d.isDirectory()).map(d=>d.name)
		for(const subd of subDirs){
			const subFiles = await findTestFiles([resolve(fsDir, subd)], localFilters)
			paths.push(...subFiles)
		}
	}
	return paths;
};

export const findTests = async (i:{discoveryPaths:string[]} | {paths:string[]} = {discoveryPaths: ['/tests/**/*.test.ts']}) => {
	if ('discoveryPaths' in i) {
		const paths = await findTestFiles(i.discoveryPaths)
		const tests = await Promise.all(paths.map(async p => (await import(resolve(p))).default ?? {} ));
		return tests.map((t,j)=>({[paths[j]]:t})) as ITestObj[];
	}
	const tests = await Promise.all(i.paths.map(async p => (await import(resolve(p))).default));
	return tests.map((t,j)=>({[i.paths[j]]:t})) as ITestObj[];
};

export const runTests = async (testObj: ITestObj, suiteNamePrefixes :string[] =[] ): Promise<ITestRunAccum> => {
	const shouldSkip = 'skip' in testObj
	const shouldIgnore = 'skip' in testObj

	const r = await Promise.all(
		Object.entries(testObj)
		.map(async ([name, maybeTestFn])=>{
			// console.log([...suiteNamePrefixes, name].join('/'))
			return typeof maybeTestFn ==='function' 
				? {[`${suiteNamePrefixes.join('/')}/${name}`]: await maybeTestFn(shouldSkip, shouldIgnore)} as ITestRunAccum
				: await runTests(maybeTestFn, [...suiteNamePrefixes, name])
		})
	)

	// console.log(r)
	const ret = r.reduce((p,c)=>merge(p,c),{})
	// console.log({ret})
	return ret
};

export const reportTests = async (testRez: PromiseOr<ITestRunAccum>)=>{}
const fmtErrors = (s:string, i:number, a: string[]):string => {
	const padedNum = (i+1).toString().padStart(Math.log10(a.length))
	return `${padedNum}. ${s}`
}

(async () => {
	if(typeof module !=='undefined' && require.main === module){
		const discoveryPaths = [resolve('./tests/**/*.test.ts')]
		const paths = await findTestFiles(discoveryPaths);
		console.log({discoveryPaths, paths});

		const tests = await findTests({paths});
		const mergedTests = mergeTests(tests[0], ...tests.slice(1));

		const trs = await runTests(mergedTests)

		const failed =  Object.fromEntries(
							Object.entries(trs).filter(
								([name, res]) => 'testPassed' in res && res.testPassed === false
							)
						)
		console.log(JSON.stringify(failed, null,2))
		console.log(`\n\nerorrs at::\n${Object.keys(failed).map((s, i, a )=>fmtErrors(s,i,a)).join('\n') }`)
		// console.log(`  found ${Object.keys(failed).length} errors`)
	}

	return {}
})();

export default isSubset;