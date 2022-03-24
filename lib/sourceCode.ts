// Import { resolve } from "path";
import {readFile} from 'fs/promises';

import * as acornjs from 'acorn';
// Import {full} from 'acorn-walk';
import {generate} from 'escodegen';
import {query} from 'esquery';
import * as estree from 'estree';
import {createSelector, JSish} from './createQuerySelector';
// Import * as babeljs from "@babel/core";

// const babelrc = require('../babel.config.js')
// console.log({babelrc})

// const configFile = resolve( './babel.config.js')
// console.log({configFile})

// export const loadedOpts =  babeljs.loadPartialConfig({ configFile}) ?? undefined
// console.log({loadedOpts})

// export const babelio = {
//     parseFile : async (
//         filename:string,
//         opts: babel.TransformOptions | undefined )  =>
//         babeljs.transformFileAsync(filename, babelrc),
//     parseString : async (str: string, opts: babel.TransformOptions) =>
//          babeljs.transformAsync(str, {...opts, configFile, ...babelrc} ),
//     astToString : async (ast:babel.Node, code:string, opts: babel.TransformOptions) =>
//         babeljs.transformFromAstAsync(ast, code, opts),
//     convertExportstoES6:  async (i: {ast:babel.Node, code:string, opts: babel.TransformOptions}) =>
//         { return i },
//     addDefaultExport:  async (i: {ast:babel.Node, code:string, opts: babel.TransformOptions}) =>
//         { return i },
// }

export type AcornRootNode = acornjs.Node & {body: acornjs.Node[], sourceType: Pick<acornjs.Options, 'sourceType'>}

export const acorn = {
	async toCodeString(i:{tree: AcornRootNode }):Promise<string> {
		return generate(i.tree);
	},
	async query(ast: estree.Node, q: string | JSish) {
		const q_ = typeof q === 'string' ? q : createSelector(q);
		return query(ast, q_);
	},
	async ecmaParse(i: {src?:string, file:string}) : Promise<AcornRootNode> {
		const src = i.src ? i.src : (await readFile(i.file)).toString();

		const node = acornjs.parse(src, {ecmaVersion: 12, sourceType: 'module', sourceFile: i.file});
		return Promise.resolve(node as acornjs.Node & {body:acornjs.Node[], sourceType: Pick<acornjs.Options, 'sourceType'> });
	},
};

(async () => {
	console.log(
		JSON.stringify(
			await acorn.ecmaParse({src: 'const myA4 = require("asdf4")("arity1Param")("arity2Param")', file: 'somefakeFile.js'}),
			null,
			2,
		),
	);
})();

/*

*/
