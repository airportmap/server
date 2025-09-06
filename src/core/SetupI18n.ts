import { type Server } from '@server';
import { loadJsonConfig, loadYamlConfig } from '@server/core/ConfigLoader';
import i18next from 'i18next';
import FsBackend from 'i18next-fs-backend';
import { LanguageDetector, handle } from 'i18next-http-middleware';

export async function setupI18n ( server: Server ) : Promise< boolean > {

    if ( server.config.i18n && server.config.i18n.enabled ) {

        const { configPath, lookupPath } = server.config.i18n;

        const config = await loadYamlConfig( configPath );
        const lookup = await loadJsonConfig( lookupPath );

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

        } catch ( err ) {

            server.debugger.err( 'server:i18n', `Error while setting up i18n`, err );
            process.exit( 1 );

        }

    }

    return false;

}
