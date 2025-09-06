import { load } from 'js-yaml';
import { readFile } from 'node:fs/promises';

export default async function loadConfig < T extends object > ( path: string, key?: string ) : Promise< T > {

    try {

        const content = await readFile( path, { encoding: 'utf8' } );
        const cfg = load( content, { json: path.endsWith( 'json' ) } ) ?? {} as any;

        return ( key ? key in cfg ? cfg[ key ] : {} : cfg ) as T;

    } catch ( err ) { return {} as T }

}
