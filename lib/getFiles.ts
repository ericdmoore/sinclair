import {readdir} from 'fs/promises'
import {extname, resolve} from 'path'

export const getFiles = async function* (dir:string, suffix:string[]= ['', '.js', '.ts', '.mjs', '.cjs', '.jsx', '.tsx']): AsyncGenerator<string, void> {
    const excludeFilesnames = ['license', 'license.txt', 'readme','readme.md' ]
    
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            if( suffix.includes(extname(res)) 
                && !excludeFilesnames.some(exc => res.toLowerCase().endsWith(exc)) ){
                yield res;
            }
        }
    }
}

export default getFiles