import * as estree from 'estree';
import type { ParsedPath } from 'path';

import { readFile } from 'fs/promises';
import { resolve } from 'path';

import getopts from 'getopts'

import { acorn } from '../lib/sourceCode'
import { createSelector } from '../lib/createQuerySelector';
import { sort } from '../lib/transformers/ordering/importsFirstExportsLast'
import pluginFns from '../lib/transformers/index'

// import findDependentSourceFiles from './getFiles';

// import {query} from 'esquery';
// import {selector} from './esmImports';
// import { transform } from "cjstoesm";

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


/***

npx ts-node bin/cli.ts -- other stuff
opts: {
    _: [ 'other', 'stuff' ],
    s: 's',
    b: true,
    a: 'alias',
    alias: 'alias'
  }
}

*/

const opts = getopts(process.argv.slice(2), {
    alias: {g: 'glob'}, 
    string:['s', 'alias'], 
    boolean:['b'],
    default:{
        s:'s',
        b: true,
        a: 'alias'
    }
})

console.log({opts})

;(async () => {
	const acornBinPath = resolve('./node_modules/acorn/dist/acorn.js');
	const argPath = resolve('./node_modules/arg/index.js');
	const testLib1Path = resolve('./tests/mock/old/lib1.js');
	const testLib2Path = resolve('./node_modules/old/srcExample.js');
	const acornS = (await readFile(acornBinPath)).toString();
	const argS = (await readFile(argPath)).toString();
	const input = testLib1Path;
	const nodeExportsCSS = createSelector({type: 'AssignmentExpression'});

	const filePaths:string[] = [
		// Resolve('./tests/mock/old/lib1.js'),
		resolve('./tests/mock/old/crazyImports.js'),
		// resolve('./tests/mock/new/crazyImports.js'),
		// Resolve('./tests/mock/new/srcExample.js'),
		// resolve('./node_modules/arg/index.js'),
	];

	filePaths.forEach(async file => {
		console.log({file},'\n\n');

		const tree = await acorn.ecmaParse({file});
		// console.log(JSON.stringify(tree, null, 2));

		const newBody = await pluginFns.reduce(
			async (body, fn) => fn(await body), 
			Promise.resolve(tree.body) as Promise<estree.Node[]>
		) as (estree.Statement | estree.Directive | estree.ModuleDeclaration)[]
		
		// console.log('\n\n', 'newBody ::: ',newBody);
		tree.body = await sort(newBody) as (estree.Statement | estree.Directive | estree.ModuleDeclaration)[]

		console.log('\n\ncode ------------');
		console.log(await acorn.toCodeString(tree));
		console.log('------------ code');
	});

	// Correct Source Code Loop
	//
	// const deps = mountPath('./node_modules/', parse)
	// for await (const path of findDependentSourceFiles(resolve('./package.json'), 'node_modules/')){
	// console.log(deps(path))
	// }

	// console.log(
	// argPath,
	// await parseFile(argPath, {})
	// await parseString(argS, {})
	// )

	// console.log({loadedOpts})
	// console.log((await ecmaParse({src: argS, file: argPath})).body)
	// const requireStmt = /const|let|var *(\{?\S+\}?) *= *require\((.+)\);?/gi

	const classExtendsStmt = /class *(\S+) *extends *(\S+) *\{/gi;
	const classStmt = /class *(\S+) *\{/gi;
	const requireStmt = /[^*] *const|let|var *\{?(\b)\}? *= *require\(['"](\b)['"]\);?/gi;
	const namedExportStmt = /exports\.(\S+) *= *(\S+);?/gi;
	const namedModuleExportStmt = /module.exports\.(\S+) *= *(\S+);?/gi; // FYI - module is reserve word in d.ts files

	const defaultExportStmt = /exports += +(\S+);?/gi;
	const defaultModuleExportStmt = /module.exports *= *(\S+);?/gi;

	const namedExports = [...acornS.matchAll(namedExportStmt)].map(m => {
		const [line, exportName, exportval] = m;
		return {line, exportName, exportval, index: m.index, groups: m.groups};
	});

	const namedModuleExports = [...acornS.matchAll(namedModuleExportStmt)].map(m => {
		const [line, exportName, exportval] = m;
		return {line, exportName, exportval, index: m.index, groups: m.groups};
	});

	const defaultModuleExports = [...acornS.matchAll(defaultModuleExportStmt)].map(m => {
		const [line, exportval] = m;
		return {line, exportval, index: m.index, groups: m.groups};
	});

	const defaultExports = [...acornS.matchAll(defaultExportStmt)].map(m => {
		const [line, exportval] = m;
		return {line, exportval, index: m.index, groups: m.groups};
	});

	const es6IMportExports = acornS
		.replaceAll(requireStmt, 'import $1from $2')
		.replaceAll(namedModuleExportStmt, 'export const $1 = $2;')
		.replaceAll(namedExportStmt, 'export const $1 = $2;')
		.replaceAll(classExtendsStmt, 'export class $1 extends $2 {')
		.replaceAll(classStmt, 'export class $1 {');

	const withDefaultExports = es6IMportExports
		.replaceAll(defaultExportStmt, 'import $1from $2')
		.replaceAll(defaultModuleExportStmt, '');

	// Console.log({defaultExports, namedExports, namedModuleExports, defaultModuleExports})
	// printLines()(es6IMportExports)

})();
