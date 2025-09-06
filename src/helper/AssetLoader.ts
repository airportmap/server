import type { Assets, AssetManifest, RenderOptions } from '@airportmap/types';
import loadConfig from '@server/core/Config';
import type Server from '@server/core/Server';
import { join } from 'node:path';

export default class AssetLoader {

    private manifest?: AssetManifest;

    constructor (
        private server: Server
    ) {}

    private globalAssets () : { css: string[], js: string[] } {

        const assets: { css: string[], js: string[] } = { css: [], js: [] };

        [ 'css', 'js' ].forEach( ( t ) => {
            const a = this.manifest!.assets[ t as keyof AssetManifest[ 'assets' ] ] as any;
            assets[ t as keyof typeof assets ] = Object.keys( a ).filter( ( k ) => a[ k ].global )
        } );

        return assets;

    }

    private resolveDeps < T > ( type: 'css' | 'js', assets: string[] ) : T {

        const resolved = new Set < string > ();
        const visiting = new Set < string > ();
        const manifest = this.manifest!.assets[ type ];

        const visit = ( asset: string ) : void => {

            if ( resolved.has( asset ) ) return;

            if ( visiting.has( asset ) ) {
                this.server.debug.warn( 'server:assetLoader',
                    `Circular dependency detected for ${ type }: ${ asset }`
                );
                return;
            }

            if ( ! manifest[ asset ] ) {
                this.server.debug.warn( 'server:assetLoader',
                    `Asset not found in manifest: ${ type }/${ asset }`
                );
                return;
            }

            visiting.add( asset );
            manifest[ asset ].dependencies?.forEach( visit );
            visiting.delete( asset );
            resolved.add( asset );

        };

        assets.forEach( visit );

        return Array.from( resolved ).map( ( k ) => {

            const asset = manifest[ k ];

            delete asset.dependencies;
            delete asset.global;

            return asset;

        } ) as T;

    }

    public async assets ( options: RenderOptions[ 'assets' ] ) : Promise< Assets > {

        this.manifest ??= await loadConfig< AssetManifest >(
            join( this.server.path, 'conf/assetManifest.yml' )
        );

        const { css = [], js = [], preload = [] } = options ?? {};
        const globalAssets = this.globalAssets();

        return {
            css: [ ...this.resolveDeps< Assets[ 'css' ] >( 'css', [ ...globalAssets.css, ...css ] ) ],
            js: [ ...this.resolveDeps< Assets[ 'js' ] >( 'js', [ ...globalAssets.js, ...js ] ) ],
            preload: [ ...( this.manifest.preload || [] ), ...preload ]
        };

    }

}
