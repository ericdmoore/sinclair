import * as estree from 'estree'

export const sort = async(body : estree.Node[]):Promise<estree.Node[]> => 
    [...body].sort((a,z) => toNum(a) - toNum(z))

const toNum = (node: estree.Node):number=>{
    switch(node.type){
        case 'ImportDeclaration':
            return node.specifiers.some(s=>s.type==='ImportDefaultSpecifier') 
                ? -3
                : node.specifiers.some(s=>s.type==='ImportNamespaceSpecifier') 
                    ? -2
                    : -1
        case 'ExportDefaultDeclaration':
            return 2
        default:
            return 0
    }
}