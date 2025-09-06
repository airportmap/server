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

        return [ 'css', 'js' ].reduce( ( assets, t ) => ( {
            ...assets,
            [t]: Object.entries( this.manifest!.assets[ t ] )
                .filter( ( [ , v ] ) => ( v as any ).global )
                .map( ( [ k ] ) => k )
        } ), { css: [], js: [] } );

    }

    private resolveAssets ( options?: RenderOptions[ 'assets' ] ) : NonNullable< RenderOptions[ 'assets' ] > {

        return {
            css: options?.css || [],
            js: options?.js || [],
            preload: options?.preload || []
        };

    }

    private resolveDeps < T > ( type: 'css' | 'js', assets: string[] ) : T {

        return [] as T;

    }

    public async assets ( options: RenderOptions[ 'assets' ] ) : Promise< Assets > {

        this.manifest ??= await loadConfig< AssetManifest >(
            join( this.server.path, 'conf/assetManifest.yml' )
        );

        const { css, js, preload } = this.resolveAssets( options );
        const globalAssets = this.globalAssets();

        return {
            css: [ ...this.resolveDeps< Assets[ 'css' ] >( 'css', [ ...globalAssets.css, ...css ] ) ],
            js: [ ...this.resolveDeps< Assets[ 'js' ] >( 'js', [ ...globalAssets.js, ...js ] ) ],
            preload: [ ...( this.manifest.preload || [] ), ...preload ]
        };

    }

}
