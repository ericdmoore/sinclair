const {SomeFunc} = require('./lib1.js')

exports.default = () => {
    const a = 1
    const b = 2
    const c = SomeFunc()
    return a + b
}