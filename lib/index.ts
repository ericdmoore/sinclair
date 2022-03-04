import {readFile, writeFile} from 'fs/promises'
import {resolve} from 'path'
import getFiles from './getFiles'

(async ()=>{
    const requireStmt = /const|let|var *({?.+}?) *= *require\((.+)\)/gi
    const namedExportStmt = /exports.(.+)[ ]*=/gi
    const namedModuleExportStmt = /module.exports.(.+)[ ]*=/gi

    const defaultExportStmt = /exports[ ]* =/gi
    const defaultModuleExportStmt = /module.exports[ ]*=/gi

    const acornBinPath = resolve('./node_modules/acorn/dist/bin.js')
    const acornS = (await readFile(acornBinPath)).toString()
    
    // const matches = [...acornS.matchAll(requireStmt)].forEach( m => {
    //     const [line, importToken, fromToken] = m
    //     console.log({line, importToken, fromToken, index: m.index, groups: m.groups})
    // })

    const replaced = acornS.replaceAll(requireStmt, 'import $1from $2')
    console.log( replaced.split('\n').slice(0,15).join('\n'), '\n...','\n...','\n' )
    
    // const [match, importToken, fromToken ] = [...requireStmt.exec(acornS)]
    // console.log({match, importToken, fromToken})     

    // [line, importToken, fromToken, index, ogInput]
    // console.log({index, line, importToken, fromToken})

    // for await (const n of getFiles('./')){
    //     
    //     const lines = (await readFile(n)).toString().split('\n')

    //     if(lines.some(l => requireStmt.test(l))){
    //         console.log(n)
    //         lines.forEach(l=>{
    //             for(const m of l.matchAll(requireStmt)){
    //                 console.log(m)
    //             }
    //         })
    //     }
    // }
})()
