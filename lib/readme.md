


Process:
```
/* =======================================
string.src ➡️   Program.AST 
                ⬇
                PluginFns[]
                ⬇
                Program`.AST ➡️ string.src
======================================= */

import {pluginFnArrThunkd} from './preset'
import * as patches from 'fast-json-patch'
import { generate }from 'escodegen'

const src = await loadStr()
const programAST = parse(src)

const patches = await pluginFnArr.reduce(
    async (acc,pf) => [...acc, ...await pf(acc)],
    Promise.resolve(programAST.body)
)

const newProgramAst = patches.reduce(patches.applyReducer, programAST)
const newSrc = generate(newProgramAst)
```


PluginFn:
```
- discoverNodes: (ProgramAST, cfg) -> { loc: oldNode }
- toOps: (cfg, oldNode) -> { loc: ΔJsonPatches[] }
+ listOps: (ProgramAST, cfg) -> ΔJsonPatches[]

issue: ΔJsonPatches[] requries delicate location modifying

-- or --

- convert(oldNode)-> newNode[]
- apply(Program.body) -> newBodyNodes[]

```

1. Walk through all the js files from the root
2. change all `require` to `import` styles
3. adjust the from location to be a `relative URL` instead of a `NPM token`
4. Create default exports out of all other exports - if none provided
5. alter `module.exports` to use `export const`
