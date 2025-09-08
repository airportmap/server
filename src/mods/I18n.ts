import type { I18nConfig, I18nLookup } from '@airportmap/types';
import loadConfig from '@server/core/Config';
import type Server from '@server/core/Server';
import i18next from 'i18next';
import FsBackend from 'i18next-fs-backend';
import { LanguageDetector, handle } from 'i18next-http-middleware';
import { join } from 'node:path';

export default async function i18n ( server: Server ) : Promise< boolean > {

    if ( server.config?.mods?.i18n && server.config.mods.i18n.enabled ) {

        try {

            const { configPath, lookupPath } = server.config.mods.i18n;

            const config = await loadConfig< I18nConfig >( join( server.path, configPath ) );
            const lookup = await loadConfig< I18nLookup >( join( server.path, lookupPath ) );

            await i18next
                .use( FsBackend )
                .use( LanguageDetector )
                .init( {
                    debug: server.debug.enabled,
                    cleanCode: true,
                    fallbackLng: config.i18n.fallbackLng,
                    supportedLngs: lookup.supportedLngs,
                    preload: config.i18n.preload,
                    ns: lookup.namespaces,
                    backend: {
                        loadPath: join( config.i18n.path, config.i18n.pattern )
                    },
                    detection: {
                        order: [ 'cookie', 'header' ],
                        lookupCookie: 'locale',
                        caches: [ 'cookie' ],
                        cookieSameSite: 'strict',
                        cookieSecure: server.config.server.https
                    }
                } );

            server.app.use( handle( i18next ) );
            server.bindFn< typeof i18next.getFixedT >( 't', i18next.getFixedT );

            return true;

        } catch ( err ) {

            server.debug.exit( 'server:i18n', `Error while setting up i18n`, err );

        }

    }

    return false;

}
