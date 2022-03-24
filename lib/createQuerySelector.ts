/**
 * @ref https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
 * 
 */

export type JSNestingProps = {[key:string]: string | JSNestingProps  }
export type JSish = JSNestingProps 
export interface AccPP{ acc: string, pp:string[]}

/**
* 
* @param i JSON object to look
* @param p 
* @returns  
*/
export const createSelector = (i: JSish, accpp: AccPP = {acc:'', pp:[] }):string => {
   const accumulateSelector = (i: JSish, accpp: AccPP):AccPP => 
       Object.entries(i)
       .reduce(
           ({acc,pp},[k,v] ) => {
               // console.log({acc, pp, k,v})
               if (typeof v === 'string'){
               return {
                   acc: pp.length === 0 ? `${acc}[${k}="${v}"]` : `${acc}[${pp.join('.')}.${k}="${v}"]`,
                   pp: [...pp]
                } 
           } else {
               // object
               return accumulateSelector(v, {acc, pp: [...pp, k] })
           }   
       }, accpp
   )

   return accumulateSelector(i,accpp).acc
}
