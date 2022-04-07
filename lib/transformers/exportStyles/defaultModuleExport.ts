/**
 *  default-module-export
 * 
 * in:  module.exports = {} object
 * out: export default = {} object
 *
*/

import type {PromiseOr} from '../types';
import * as estree from 'estree';

import {acorn} from '../sourceCode'
import {createSelector, JSish} from '../createQuerySelector';

/**
 * Find default module.exports
 * 
 * User should select the [0] element since there should only be one default export 
 *   
 * @param _selector 
 * @returns 
 */
export const find = (_selector?:string | JSish)=> async (ast :PromiseOr<estree.Program>): Promise<estree.Node[]> =>{
    /* json> `module.exports = variableName`
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "MemberExpression",
                    "computed": false,
                    "optional": false
                    "object": {
                        "type": "Identifier",
                        "name": "module"
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "exports"
                    },
                },
                "right": {
                    "type": "Identifier",
                    "name": "variablename"
                }
            }
        }
    */

    // ExpressionStatement[expression.operator="="][expression.left.object.name='module'][expression.left.property.name='exports']

    const selectorObj = {
        expression: {
            operator: '=', 
            left: {object:{name:'module'}, 
            property:{name:'exports'}}
        }
    }

    const selector = typeof _selector ==='undefined' 
        ? createSelector(selectorObj,{acc:'ExpressionStatement', pp:[]}) 
        : typeof _selector ==='string' 
            ? _selector
            : createSelector(_selector, {acc:'ExpressionStatement', pp:[]})

    return acorn.query(await ast, selector)
}
export const alter = ()=>{

}
export const apply = ()=>{

}