'use strict';
// const someFunc = require('./lib1.js')
// const {Example} = require('./lib1.js')

const otherFunc = ()=>{
    const a = 1 //  new Example()
    const b = 2 // new Example()
    // const c = someFunc()
    return a.toString() + b.toString() // + c.toString()
}

exports.default = otherFunc