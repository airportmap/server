import { type Server } from '@server';

export async function setupRouter ( server: Server ) : Promise< boolean > {

    if ( server.config.router && server.config.router.enabled ) {

        try {} catch ( err ) {}

    }

    return false;

}
