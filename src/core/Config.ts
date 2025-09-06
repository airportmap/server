import { load } from 'js-yaml';
import { readFile } from 'node:fs/promises';

export default async function loadConfig < T extends object > ( path: string ) : Promise< T > {

    try {

        const content = await readFile( path, { encoding: 'utf8' } );

        return ( load( content, { json: path.endsWith( 'json' ) } ) ?? {} ) as T;

    } catch ( err ) { return {} as T }

}
