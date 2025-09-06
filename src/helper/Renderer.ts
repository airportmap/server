import type { GlobalContext, RenderOptions } from '@airportmap/types';
import type Server from '@server/core/Server';
import { type Request, type Response } from 'express';

export default class Renderer {

    constructor (
        private server: Server
    ) {}

    private async globalContext ( req: Request ) : Promise< GlobalContext > {

        return {
            fn: {
                i18n: req.t.bind( req )
            },
            app: {
                env: this.server.env,
                host: req.get( 'host' ) || '',
                protocol: req.protocol,
                lang: req.language
            },
            site: {
                originalUrl: req.originalUrl,
                path: req.path,
                query: req.query,
                params: req.params
            },
            meta: {
                canonical: `${ req.protocol }://${ req.get( 'host' ) }${ req.originalUrl }`,
                robots: 'index, follow'
            }
        };

    }

    public async render ( req: Request, res: Response, options: RenderOptions ) : Promise< void > {

        try {

            const { template, assets, meta, data } = options;

            const globalContext = await this.globalContext( req );

            res.status( 200 ).render( template, {
                ...globalContext, ...data,
                assets: this.server.assetLoader.assets( assets ),
                meta: { ...globalContext.meta, ...meta }
            } );

        } catch ( err ) {

            this.server.debug.warn( 'server:renderer', `Rendering error: ${ ( err as Error ).message }` );
            res.status( 500 ).render( 'base/error', { err } );

        }

    }

}
