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
type IConvertFN = (node: estree.Node) => estree.Node[]

export const bodyReducer = (testNode: ITestNodeFn, convert:IConvertFN) => async (body: estree.Node[]): Promise<estree.Node[]> => 
     body.reduce(async (acc, node) => {
               return testNode(node)
               ? [...(await acc), ...convert(node)]
               : [...await acc, node]
          },Promise.resolve([] as estree.Node[])
     )

export default [
    bodyReducer(requireConnectedProperty.testNode, requireConnectedProperty.convert),
    bodyReducer(requireConnectedPropertyObjectPattern.testNode, requireConnectedPropertyObjectPattern.convert),
    bodyReducer(requireDefault.testNode, requireDefault.convert),
    bodyReducer(requireImpliedFunction.testNode, requireImpliedFunction.convert),
    bodyReducer(requireObjectPattern.testNode, requireObjectPattern.convert),
]

// export const listOpsPlugins = [
//     requireConnectedProperty.listOps
// ]