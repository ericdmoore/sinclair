import * as estree from 'estree'
import {stripStartEnd} from './stripLocFrom'
import {deepEq, ITestCalcResult, ITestFn, ITestResult} from '../tests'

export const test  =  (name:string, input:estree.Node, expected: Record<string, unknown>):ITestFn =>    
    async(skip, ignore):Promise<ITestResult>=>{
        const actual = stripStartEnd(input)
        return {
            name,
            skip: skip ?? false,
            ignore: ignore ?? false,
            actual,
            expected,
            testPassed: deepEq(actual,expected)
        }
    }

export const tests = {
    clearLocs:{
        Identifier: test(
            'Identifier Node', 
            {type:'Identifier', name:'Yolo', start:0, end:4} as estree.Node ,
            {type:'Identifier', name:'Yolo'}
        ),
        VariableDeclaration: test(
            'Var Decl Node', 
            {type:'Identifier', name:'Yolo', start:0, end:4} as estree.Node ,
            {type:'Identifier', name:'Yolo'}
        ),
        CallExpression: test(
            'Call Ex Node', 
            {type:'CallExpression', optional:false, computed: false, start:0, end:4, arguments:[{type: 'Literal', value:'a', start:0, end:4} as any], callee:{type:'Identifier', name:'func', start:0, end:4}} as estree.Node ,
            {type:'CallExpression', optional:false, computed: false, arguments:[{type: 'Literal', value:'a'}], callee:{type:'Identifier', name:'func'}}
        )
    }
}

export default tests
/// /////////////////////////////////////////////////////////////////

;(async()=>{
    if(typeof module !=='undefined' && require.main === module){
        console.log('>>> local runner ');
        const tr1 = await tests.clearLocs.Identifier() as ITestCalcResult
        const tr2 = await tests.clearLocs.CallExpression() as ITestCalcResult
    
        // console.log(1,'actual  :',JSON.stringify(tr1.actual, null, 2));
        // console.log(1,'expected:',JSON.stringify(tr1.expected, null, 2));
    
        console.log(2,'actual  :',JSON.stringify(tr2.actual, null, 2));
        // console.log(2,'expected:',JSON.stringify(tr2.expected, null, 2));
    
        console.log([{pass1: tr1.testPassed}, {pass2: tr2.testPassed} ])
    }
})()