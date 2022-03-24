/* eslint-disable no-prototype-builtins */
import {globby} from 'globby';
import {resolve} from 'path';
import merge from 'lodash.merge';
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
type ITestRunAccum = Dict< ITestResult>

export const mergeTests = (l: ITestObj, ...r: ITestObj[]) =>
	r.length > 0
		? r.reduce((p, c) => merge(p, c), l)
		: l;

export const findTestFiles = async (discoveryPath:string[] = ['/tests/**/tests.ts']):Promise<string[]> => {
	const paths = await globby(discoveryPath, {globstar: true});
	return paths;
};

export const findTests = async (i:{discoveryPath:string[]} | {paths:string[]} = {discoveryPath: ['/tests/**/tests.ts']}) => {
	if ('discoveryPath' in i) {
		const paths = await globby(i.discoveryPath, {globstar: true});
		const tests = await Promise.all(paths.map(async p => (await import(resolve(p))).default));
		return tests as ITestObj[];
	}

	const tests = await Promise.all(i.paths.map(async p => (await import(resolve(p))).default));
	return tests as ITestObj[];
};

export const runTests = async (_testObj: ITestObj, _startingState :ITestRunAccum): Promise<ITestRunAccum> => {
	console.log('...running');
	return {};
};

export {isSubset as default};

(async () => {
	const paths = await findTestFiles();
	console.log({paths});

	const tests = await findTests({paths});
	console.log({tests});

	const mergedTest = mergeTests(tests[0], ...tests.slice(1));
	console.log({mergedTest});
})();
