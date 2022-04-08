import * as estree from 'estree'

import * as requireConnectedProperty from './declarationStyles/convertConnectedProperty'
import * as requireConnectedPropertyObjectPattern from './declarationStyles/convertConnectedPropertyObjectPattern'
import * as requireDefault from './declarationStyles/convertDefault'
import * as requireImpliedFunction from './declarationStyles/convertImpliedDefaultFunction'
import * as requireObjectPattern from './declarationStyles/convertObjectPattern'

// import * as exportsModuleDefault from './exportStyles/defaultModuleExport'
// import * as exportsDefault from './exportStyles/defaultExports'
// import * as exportsNamed from './exportStyles/namedExports'
// import * as exportsModuleNamed from './exportStyles/namedModuleExport'
// import * as addExtension from './renaming/addExtension'
// import * as addDirDots from './renaming/digIntoNodeModules'

type ITestNodeFn = (node:estree.Node | estree.Node[]) => boolean
type IConvertFn = (node: estree.Node) => estree.Node[]
interface IPluginMod {testNode:ITestNodeFn, convert:IConvertFn}

export const bodyReducer = ( pluginMod:IPluginMod ) => async (body: estree.Node[]): Promise<estree.Node[]> => 
     body.reduce(async (acc, node) => pluginMod.testNode(node)
               ? [...(await acc), ...pluginMod.convert(node)] 
               : [...await acc, node] ,Promise.resolve([] as estree.Node[]))

export default [
    bodyReducer(requireConnectedProperty),
    bodyReducer(requireConnectedPropertyObjectPattern),
    bodyReducer(requireDefault),
    bodyReducer(requireImpliedFunction),
    bodyReducer(requireObjectPattern),
]

// export const listOpsPlugins = [
//     requireConnectedProperty.listOps
// ]