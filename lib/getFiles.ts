import {lstat, readdir, readFile} from 'fs/promises'
import {extname, resolve, parse} from 'path'

export type Dict<T> = {[key:string]:T}
export type PackageJsonVersionStr = string
export type S2S = (i:string)=>string
export type U2U = (i:unknown)=>unknown
export interface PackageJson {
    dependencies?: {[pkgName:string]:PackageJsonVersionStr }
    devDependencies?: {[pkgName:string]:PackageJsonVersionStr }
}

const isValidDir = async(s:string):Promise<boolean> => {
    const d = await lstat(s).catch(()=> {return {isDirectory: () => false}})
    return d.isDirectory()
}

const ObjectMap = (k?: S2S, v?: U2U) => (o:object) => {
    const i = <T>(i:T) => {return i}
    const defaultedKeyMapper: S2S = k ?? i
    const defaultedValMapper: U2U = v ?? i

    return Object.fromEntries(
        Object.entries(o)
        .map(
            ([k,v])=>[defaultedKeyMapper(k), defaultedValMapper(v)]
        )
    )
}

const importJSON = async (path:string):Promise<unknown>=>{
    const b = await readFile(resolve(path))
    return JSON.parse(b.toString())
}

const loadDepsRecursive = async (pkgJsonPath:string, key: 'devDependencies' | 'dependencies' = 'dependencies' ):Promise<string[]>=>{
    const pkgJson = await importJSON(pkgJsonPath) as PackageJson
    const directDependents = Object.keys(pkgJson?.[key] ?? {})
        .map(k=> `node_modules/${k}/package.json`)
    
    return [...new Set([
        ...directDependents.map(d=> parse(d).dir), 
        ...(await directDependents.reduce(
            async (p,c) => {
                return [ ...new Set([
                    ...(await p), 
                    ...(await loadDepsRecursive(c))
                ]) ]
            },
            Promise.resolve([]) as Promise<string[]>
        ))
    ])]
}

export const findDependentSourceFiles = async function* (
    topPkgJsonPath: string,
    dir: string,
    suffix: string[]= ['', '.js', '.ts', '.mjs', '.jsx', '.tsx'],
    depth = 0
    ): AsyncGenerator<string, void> {
    const excludeInertFiles = ['license', 'license.txt', 'readme','readme.md' ]
    
    const pkgLockJsonPath = resolve(parse(topPkgJsonPath).dir,'package-lock.json')
    
    const exludeDevDeps = await readFile(pkgLockJsonPath)
        .catch(async ()=>{
            return Buffer.from(
                JSON.stringify(
                    { packages: (await loadDepsRecursive(topPkgJsonPath, 'devDependencies'))
                        .reduce((p,c)=> ({...p, [c]:{dev:true}}) ,{}) }
                )
            )
        })
        .then(d => Object.entries(JSON.parse(d.toString()).packages)
                    .filter(([k,v]: [any, any])=> v.dev)
                    .map(([k,v])=>{return k})
        )
    exludeDevDeps.push('node_modules/.bin')

    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* findDependentSourceFiles(topPkgJsonPath, res, suffix, depth+1);
        } else {
            if(    suffix.includes(extname(res)) 
                && !excludeInertFiles.some(inert => res.toLowerCase().endsWith(inert)) 
                && !exludeDevDeps.some(devDep => parse(res).dir.includes(devDep))
              ){ yield res }
        }
    }
}

export default findDependentSourceFiles