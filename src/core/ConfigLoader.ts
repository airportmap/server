import { load } from 'js-yaml';
import { readFile } from 'node:fs/promises';

async function getFileContent ( path: string ) : Promise< string > {

    try { return await readFile( path, { encoding: 'utf8' } ) }
    catch ( err ) { return '' }

}

export async function loadJsonConfig< T extends object > ( path: string ) : Promise< T > {

    return load( await getFileContent( path ), { json: true } ) as T;

}

export async function loadYamlConfig< T extends object > ( path: string ) : Promise< T > {

    return load( await getFileContent( path ) ) as T;

}
