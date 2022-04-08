import * as estree from 'estree';
import type { Stats, PathLike, Dirent} from 'fs';
import type { ParsedPath } from 'path';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { acorn } from './sourceCode'
import { sort } from './transformers/ordering/importsFirstExportsLast'

// import findDependentSourceFiles from './getFiles';
// import {query} from 'esquery';
// import {selector} from './esmImports';

/**
 * Print Lines
 * @param lines - how manby lines?
 * @param offsetIdx - start with some offset?
 */
const printLines = (lines = 10, offsetIdx = 0) => (initS: string) => {
	console.log(
		initS.slice(offsetIdx)
			.split('\n')
			.slice(0, lines)
			.join('\n'),
		'\n...',
		'\n...',
		'\n',
	);
};

const mountPath = (mountDir:string, p: (s:string)=> ParsedPath) => (path: string) => {
	mountDir = resolve(mountDir);
	const pp = p(path);
	const dir = pp.dir.slice(mountDir.length);

	return {
		path,
		mount: {
			root: mountDir,
			dir,
			depth: dir.split('/').length,
		},
		...pp,
	};
};


export const applyToSrc = async (
	input:{src?:string, file:string}, 
	pluginFns: ((body: estree.Node[])=> Promise<estree.Node[]>)[] = []
	): Promise<{src:string, file:string}> => {
		const tree = await acorn.ecmaParse(input);
		const newBody = await pluginFns.reduce(async (body, fn) => fn(await body), 
			Promise.resolve(tree.body) as Promise<estree.Node[]>
		) as (estree.Statement | estree.Directive | estree.ModuleDeclaration)[]
		tree.body = await sort(newBody) as (estree.Statement | estree.Directive | estree.ModuleDeclaration)[]
		return {src: await acorn.toCodeString(tree), file: input.file} 
}

/**
 * 
 * @param input 
 * @param pluginFns 
 * @sideEffect - fs writeFile
 */
export const applyToFile = async (
	input:{src?:string, file:string}, 
	pluginFns: ((body: estree.Node[])=> Promise<estree.Node[]>)[] = []
	): Promise<void> => {
		const {file, src} = await applyToSrc(input, pluginFns)
		return writeFile(file, src)
}

export const globToFiles = async (globs:string[], fs?: {
		lstat: (path:PathLike)=>Promise<Stats>
		readdir?: (path:PathLike)=>Promise<Dirent[]>
	}):Promise<string[]> =>{
	const lstat = fs ? fs.lstat :  (await import('node:fs/promises')).lstat
	const readdir = fs ? fs.readdir : (await import('node:fs/promises')).readdir

	return []
}