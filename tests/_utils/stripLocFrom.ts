import * as estree from 'estree'

export const stripStartEnd = <T>(i:T): Omit<T,'start' | 'end'> => {
    if(Array.isArray(i)){
        // console.log('i',i)
        for(let j = 0; j<i.length ; j++ ){
            // console.log('before',i[j])
            i[j] = stripStartEnd(i[j])
            // console.log('after',i[j])
        }
        return i
    }else{
        // console.log({i})
        const {start, end, ...obj} = i as any
        for(const key in obj){
            obj[key] = typeof obj[key] === 'object' 
                ? stripStartEnd(obj[key])
                : obj[key]
        }
        return obj
    }
} 
