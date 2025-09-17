import type { CookieContext, GlobalContext, RenderContext, RenderOptions } from '@airportmap/types';
import type Server from '@server/core/Server';
import type { CookieOptions, Request, Response } from 'express';

export default class Renderer {

    constructor (
        private server: Server
    ) {}

    private cookieContext ( req: Request, res: Response ) : CookieContext {

        const cookies: CookieContext = {};
        const cookieOpts: CookieOptions = {
            path: '/', sameSite: 'strict',
            secure: this.server.config.server.https,
            expires: new Date( Date.now() + 1.2e9 )
        };

        for ( const [ key, val ] of Object.entries( this.server.config.cookies ?? {} ) ) {

            switch ( key ) {

                default:
                    cookies[ key ] = req.cookies?.[ key ] || val;
                    break;

                case 'locale':
                    if ( this.server.isModEnabled( 'i18n', true ) )
                        cookies.locale =
                            req.cookies?.locale ||
                            req.acceptsLanguages?.()[ 0 ] ||
                            req.language || val;
                    break;

            }

            res.cookie( key, cookies[ key ], cookieOpts );

        }

        return cookies;

    }

    private supportedLngs ( req: Request ) : GlobalContext[ 'app' ][ 'supportedLngs' ] {

        return Array.from( req?.i18n?.options?.supportedLngs || [] )
            .filter( l => l && l !== 'cimode' )
            .map( code => ( { code, label: req.t( '_lang:' + code ) } ) );

    }

    private globalContext ( req: Request, cookies: CookieContext ) : GlobalContext {

        const fn: GlobalContext[ 'fn' ] = {};

        if ( this.server.isModEnabled( 'i18n', true ) )
            fn.i18n = req.t.bind( req );

        return {
            fn, cookies,
            app: {
                env: this.server.env,
                host: req.get( 'host' ) || '',
                protocol: req.protocol,
                supportedLngs: this.supportedLngs( req )
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

    private htmlClasses ( req: Request, cookies: CookieContext, extraClasses?: string ) : string {

        const { theme, locale } = cookies;
        const classes = new Set< string > ();

        if ( theme ) classes.add( `_theme_${ theme }` );
        if ( locale ) classes.add( `_locale_${ locale }` );

        const ua = req.headers[ 'user-agent' ] || '';
        classes.add( /mobile/i.test( ua ) ? `_mobile` : `_web` );

        if ( extraClasses ) extraClasses.split( /\s+/ ).filter( Boolean ).forEach(
            c => classes.add( c )
        );

        return Array.from( classes ).join( ' ' );

    }

    public async render ( req: Request, res: Response, options: RenderOptions ) : Promise< void > {

        try {

            const { template, htmlClasses, bodyClasses, assets = {}, meta = {}, data } = options;

            const cookieContext = this.cookieContext( req, res );
            const globalContext = this.globalContext( req, cookieContext );
            const classes = this.htmlClasses( req, cookieContext, htmlClasses );
            const pageAssets = await this.server.assetLoader.assets( assets );

            res.status( 200 ).render( template, {
                ...globalContext, ...data,
                htmlClasses: classes, bodyClasses,
                assets: pageAssets,
                meta: { ...globalContext.meta, ...meta }
            } as RenderContext );

        } catch ( err ) {

            this.server.debug.warn( 'server:renderer', `Rendering error: ${ ( err as Error ).message }` );
            res.status( 500 ).render( 'base/error', { err } );

        }

    }

}
