import { load } from 'js-yaml';
import { readFile } from 'node:fs/promises';

async function getFileContent ( path: string ) : Promise< string > {

    try { return await readFile( path, { encoding: 'utf8' } ) }
    catch ( err ) { return '' }

}

async function extractConfig < T extends object > ( path: string, json: boolean, key?: string ) : Promise< T > {

    const content = await getFileContent( path );
    const cfg = load( content, { json } ) ?? {} as any;

    return ( key ? key in cfg ? cfg[ key ] : {} : cfg ) as T;

}

export async function loadJsonConfig < T extends object > ( path: string, key?: string ) : Promise< T > {

    return await extractConfig< T >( path, true, key );

}

export async function loadYamlConfig < T extends object > ( path: string, key?: string ) : Promise< T > {

    return await extractConfig< T >( path, false, key );

}
