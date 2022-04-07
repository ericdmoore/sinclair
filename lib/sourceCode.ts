// Import { resolve } from "path";
import {readFile} from 'fs/promises';

import * as acornjs from 'acorn';
import {fullAncestor} from 'acorn-walk';
import * as estree from 'estree';
import {generate} from 'escodegen';
import {query} from 'esquery';

import {createSelector, JSish} from './createQuerySelector';
import {stripStartEnd} from '../tests/_utils/stripLocFrom'
// Import * as babeljs from "@babel/core";

type Dict<T> = {[key:string]:T}
type INodeTester = (
  node: estree.Node | estree.Node[], 
  tree: Readonly<estree.Program>,
  curPathSegs: string[], 
  ancestors: Array<estree.Node | estree.Node[]>,
  existing: Dict<estree.Node | estree.Node[]>) => boolean

export const acorn = {
	toCodeString: async (i:estree.Program ) => generate(i),
	async query(ast: estree.Program, q: string | JSish) {
		const q_ = typeof q === 'string' ? q : createSelector(q);
		return query(ast, q_);
	},
	async ecmaParse(i: {src?:string, file:string}) : Promise<estree.Program> {
		const src = i.src ? i.src : (await readFile(i.file)).toString();
		const node = acornjs.parse(src, {
      ecmaVersion: 12, 
      sourceType: 'module', 
      sourceFile: i.file,
      ranges: false,
      locations: false,
    });
		return node as unknown as estree.Program
	},
  async findNodePaths(
    ast: Readonly<estree.Program>,
    testFn: INodeTester,
    node?: estree.Node | estree.Node[],
    curPathSeg: string[] = [],
    ancestors: Array<estree.Node | estree.Node[]> = [],
    existing: Dict<estree.Node | estree.Node[]> = {}
  ):Promise<Dict<estree.Node | estree.Node[]>>{
    
    ancestors.length===0 && ancestors.push(ast)
    const curNode: estree.Node | estree.Node[] = node ?? ast
    
    if(Array.isArray(curNode)){
      // add the array to the result?
      if(testFn(curNode, ast, curPathSeg, ancestors, existing)){
        existing = {...existing, [curPathSeg.join('/')]: curNode}
      }
      // iterate + recurse
      for(let i = 0; i < curNode.length; i++){ 
        const nextNode = curNode[i]
        const key = i.toString()        
        if(typeof nextNode ==='object'){
          existing = {
            ...existing,
            ...await acorn.findNodePaths(ast, testFn, nextNode, curPathSeg.concat([key]), ancestors.concat([nextNode]), existing)
          }
        }
      }
    } else {
      // add the object to the result?
      if(testFn(curNode, ast, curPathSeg, ancestors, existing)){
        existing = {...existing, [curPathSeg.join('/')]: curNode}
      }
      // iterate + recurse
      for(const key in curNode){
        const nxtNode = (curNode as any)[key]
        if(typeof nxtNode ==='object'){
          existing = {
            ...existing,
            ...await acorn.findNodePaths(ast, testFn, nxtNode, curPathSeg.concat([key]), ancestors.concat([nxtNode]), existing)
          }
        }
      }
    }
    return existing
  }
};

// module.exports = 'Hello world'; module-export-default
// exports.SimpleMessage = 'Hello world'; exports-default


(async () => {
  if (typeof module !== 'undefined' && require.main === module) {
    const programAst = await acorn.ecmaParse({
      file: 'somefakeFile.js',
      src: `
      const {a1, ...b1} = require(\'asd1\')
      `, 
    });
  
    console.log('ast: ',JSON.stringify(stripStartEnd(programAst) ,null, 2));
  
    // const test: INodeTester = (node, tree, paths, ancestors)=>{
    //   return Array.isArray(node) 
    //     ? false 
    //     : node.type === "Identifier" && node.name === 'exports'
    // }
  
    // const paths =  await acorn.findNodePaths(programAst, test)
  
    // 'ExpressionStatement[expression.operator="="][expression.left="exports"]'
    // const selector = 'ExpressionStatement'
    // const selected = await acorn.query(programAst,selector)
    
    // console.log({paths, selector})
    // console.log('selected: ',JSON.stringify(stripStartEnd(selected),null, 2))
  }
})();

/*

{
  "type": "ExpressionStatement",
  "expression": {
    "type": "AssignmentExpression",
    "operator": "=",
    "left": {
      "type": "Identifier",
      "name": "exports"
    },
    "right": {
      "type": "Identifier",
      "name": "variablename"
    }
  }
}

*/
