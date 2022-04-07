import * as estree from 'estree'

export const testNode = (node:estree.Node | estree.Node[]):boolean=>{
    return Array.isArray(node)  
        ? false 
        : node.type==='VariableDeclaration' 
            && node.declarations[0]?.id?.type === 'ObjectPattern'
            && node.declarations[0]?.id?.properties.some(prop=>prop.type==='RestElement')
            && ((node.declarations[0]?.init as estree.CallExpression)?.callee as estree.Identifier)?.name === 'require'
}

export const convert = (node:estree.Node): estree.Node[]=>{
    const n = node as estree.VariableDeclaration
    const callEx = n.declarations[0].init as estree.CallExpression
    const requireName = callEx.arguments[0] as estree.Literal
    const madeUpName = (requireName.value as string)

    const importing: estree.ImportDeclaration = {
        type:'ImportDeclaration',
        source: requireName,
        specifiers:[{
            type:'ImportNamespaceSpecifier',
            local:{
                type:'Identifier', 
                name:`ns_${madeUpName}`
            }
        }],
    }

    const assigning: estree.VariableDeclaration = {
        type:'VariableDeclaration',
        declarations: [{
            type:'VariableDeclarator',
            id: n.declarations[0].id,
            init: n.declarations[0].init
        }],
        kind: n.kind
    }
    return []
}