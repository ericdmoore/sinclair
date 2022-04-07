/**
  * Exports = {} object
  * export.Name = Name --> export const Name
  *
*/

import type {PromiseOr} from '../types';
import * as estree from 'estree';
import * as ac from 'acorn'
import {acorn} from '../sourceCode'
import {full} from 'acorn-walk'
import {createSelector, JSish} from '../createQuerySelector';
import * as patches from 'fast-json-patch'
patches.applyPatch

const selectorObj = {
  expression: {
      operator: '=', 
      left: {name:'exports'}
  }
};

export const selector = {
	o: selectorObj,
	s: createSelector(selectorObj, {acc:'ExpressionStatement', pp:[]})
};

export const find =  (_selector:string | JSish = selector.o)=> async (ast :PromiseOr<estree.Program>): Promise<estree.ExpressionStatement[]> =>{

  const selector = typeof _selector ==='string' 
    ? _selector
    : createSelector(_selector, {acc:'ExpressionStatement', pp:[]})

  return acorn.query(await ast, selector) as Promise< estree.ExpressionStatement[]>
};


/**
  * Per node
  */
export const alter = async (_ast :PromiseOr<estree.ExpressionStatement>):Promise<estree.Node[]> => {
  const ret = {
    type:'ExportDefaultDeclaration',
    declaration: ((await _ast).expression as estree.AssignmentExpression).right
  } as estree.ExportDefaultDeclaration

  return [ret]
};



export const convert = (_selector?:string | JSish) => 
  async (_ast :PromiseOr<estree.Program>) : Promise<estree.Node[]> => 
    { 
      const ast = await _ast
      const cjsNodes = await find(_selector)(ast)
      const es6Nodes = cjsNodes.reduce(
        async (p,n) => Promise.all([ ...(await p), ...(await alter(n)) ]),
        Promise.resolve([] as estree.Node[])
      )
      return es6Nodes
    };



const selectorDefault = (node:ac.Node) => {
  if(node.type ==='ExpressionStatement'){
    if((node as estree.ExpressionStatement) ==='AssignmentExpression'){

    }
  }
  return false
}
export const makeOps = async (
    _ast :PromiseOr<estree.Program>,
    selectorFn?: (node:ac.Node) => boolean,
    ) : Promise<patches.Operation[]> => {
  
  let replaced = [] as patches.Operation[]
  const ast = await _ast as unknown as ac.Node

  
  const select = selectorFn ?? selectorDefault

  full(ast, (node)=>{
    if(select(node)){
      ops = ops.concat(patches.compare(ast, node))
    }
  })
  
  return ops
};





export const replace = (ops: patches.Operation[] =[]) =>
  async (_ast :PromiseOr<estree.Program>) : Promise<estree.Program> => {
    return ops.reduce((doc,op,i) => patches.applyReducer(doc, op, i), await _ast)
}