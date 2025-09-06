import { type Server } from '@server';
import i18next from 'i18next';
import FsBackend from 'i18next-fs-backend';
import { LanguageDetector, handle } from 'i18next-http-middleware';

export async function setupI18n ( server: Server ) : Promise< boolean > {

    try {

        await i18next
            .use( FsBackend )
            .use( LanguageDetector )
            .init( {
                debug: server.debugger.enabled,
                detection: {
                    order: [ 'cookie', 'header' ],
                    lookupCookie: 'locale',
                    caches: [ 'cookie' ],
                    cookieSameSite: 'strict',
                    cookieSecure: server.config.https
                }
            } );

        server.app.use( handle( i18next ) );

        return true;

    } catch ( err ) { server.debugger.err( 'server:i18n', `Error while setting up i18n`, err ) }

    return false;

}
