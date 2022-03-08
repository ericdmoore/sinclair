import type {ParsedPath} from 'path' 

import findDependentSourceFiles from './getFiles'

import {readFile, writeFile} from 'fs/promises'
import {resolve, basename, extname, parse} from 'path' 

/**
 * Print Lines
 * @param lines - how manby lines?
 * @param offsetIdx - start with some offset?
 */
const printLines  = (lines =10, offsetIdx =0)=> (initS: string)=>{
    console.log( 
        initS.slice(offsetIdx)
        .split('\n')
        .slice(0,lines)
        .join('\n'),
        '\n...','\n...','\n' 
    )
}

const mountPath = (mountDir:string, p: (s:string)=> ParsedPath)=>(path: string)=>{
    mountDir = resolve(mountDir)
    const pp = p(path)
    const dir = pp.dir.slice(mountDir.length)
    
    return {
        path,
        mount:{
            root: mountDir,
            dir,
            depth: dir.split('/').length
        },
        ...pp
    }
}


(async ()=>{

    const deps = mountPath('./node_modules/', parse)

    for await (const path of findDependentSourceFiles(resolve('./package.json'), 'node_modules/')){
        console.log(deps(path))
    }
    
    // const requireStmt = /const|let|var *(\{?\S+\}?) *= *require\((.+)\);?/gi
    const classesStmt = /class *(\S+) *extends *(\S+) *\{/gi
    const requireStmt = /[^\*] *const|let|var *\{?(\b)\}? *= *require\(['"](\b)['"]\);?/gi
    const namedExportStmt = /exports\.(\S+) *= *(\S+);?/gi
    const namedModuleExportStmt = /module.exports\.(\S+) *= *(\S+);?/gi  // FYI - module is reserve word in d.ts files

    const defaultEs6ExportStmt = /exports += +(\S+);?/gi
    const defaultModuleExportStmt = /module.exports *= *(\S+);?/gi

    const acornBinPath = resolve('./node_modules/acorn/dist/acorn.js')
    const argPath = resolve('./node_modules/arg/index.js')

    const acornS = (await readFile(acornBinPath)).toString()
    const argS = (await readFile(argPath)).toString()
    

    const namedExports = [...acornS.matchAll(namedExportStmt)].map( m => {
        const [line, exportName, exportval] = m
        return {line, exportName, exportval, index: m.index, groups: m.groups}
    })
    
    const namedModuleExports = [...acornS.matchAll(namedModuleExportStmt)].map( m => {
        const [line, exportName, exportval] = m
        return {line, exportName, exportval, index: m.index, groups: m.groups}
    })

    const defaultExports = [...acornS.matchAll(defaultModuleExportStmt)].map( m => {
        const [line, exportval] = m
        return {line, exportval, index: m.index, groups: m.groups}
    })

    const defaultEs6Export = [...acornS.matchAll(defaultEs6ExportStmt)].map(m=>{
        const [line, exportval] = m
        return {line, exportval, index: m.index, groups: m.groups}
    })

    const es6IMportExports = acornS
        .replaceAll(requireStmt, 'import $1from $2')
        .replaceAll(namedModuleExportStmt,'export const $1 = $2;')
        .replaceAll(namedExportStmt,'export const $1 = $2;')
    
    console.log({defaultExports, namedExports, namedModuleExports, defaultEs6Export})
    printLines()(es6IMportExports)
})()
