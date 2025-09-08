import type Server from '@server/core/Server';
import { join } from 'node:path';

export default async function views ( server: Server ) : Promise< boolean > {

    if ( server.isModEnabled( 'views' ) ) {

        const { viewEngine = 'pug', viewBase = 'views' } = server.config.mods.views;

        server.app.set( 'view engine', viewEngine );
        server.app.set( 'views', join( server.path, viewBase ) );

        return true;

    }

    return false;

}
