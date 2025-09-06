import type Server from '@server/core/Server';
import { join } from 'node:path';

export default async function views ( server: Server ) : Promise< boolean > {

    if ( server.config.mods.views && server.config.mods.views.enabled ) {

        const { viewEngine = 'pug', viewBase = 'views' } = server.config.mods.views;

        server.app.set( 'view engine', viewEngine );
        server.app.set( 'views', join( server.path, viewBase ) );

    }

    return false;

}
