import * as es from 'estree'
export const convert = async (node: es.Node):Promise<es.Node[]>=>{
    return [node]
}
export const testNode = (node:es.Node | es.Node[]):boolean=>{
    return Array.isArray(node) ? false: true
}