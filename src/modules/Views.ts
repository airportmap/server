import { type Server } from '@server';

export default async function views ( server: Server ) : Promise< boolean > {

    if ( server.config.views && server.config.views.enabled ) {

        const { viewEngine = 'pug', viewBase = 'views' } = server.config.views;

        server.app.set( 'view engine', viewEngine );
        server.app.set( 'views', viewBase );

    }

    return false;

}
