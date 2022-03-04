import getopts from 'getopts'

/***

npx ts-node bin/cli.ts -- other stuff
opts: {
    _: [ 'other', 'stuff' ],
    s: 's',
    b: true,
    a: 'alias',
    alias: 'alias'
  }
}

*/

const opts = getopts(process.argv.slice(2), {
    alias: {a: 'alias'}, 
    string:['s', 'alias'], 
    boolean:['b'],
    default:{
        s:'s',
        b: true,
        a: 'alias'
    }
})

console.log({opts})