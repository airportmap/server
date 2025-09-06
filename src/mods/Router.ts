import type { RouteConfig } from '@airportmap/types';
import { loadYamlConfig } from '@server/core/ConfigLoader';
import type Server from '@server/core/Server';
import { type Application } from 'express';
import { join } from 'node:path';

export default async function router ( server: Server ) : Promise< boolean > {

    if ( server.config.router && server.config.router.enabled ) {

        try {

            const { configPath, cntrlBase } = server.config.router;

            const routes = await loadYamlConfig< RouteConfig >( join( server.path, configPath ) );

            for ( const { method, path, controller } of routes.routes ) {

                try {

                    const cntlr = await import( join( cntrlBase, controller ) );
                    const fn = cntlr[ method ] || cntlr.default || cntlr;

                    if ( typeof server.app[ method as keyof Application ] === 'function' && typeof fn === 'function' )
                        ( server.app[ method as keyof Application ] as any )( path, fn );

                } catch ( err ) { server.debug.warn(
                    'server:router', `Failed to load controller for route ${ method }::${ path }: ${ err }`
                ) }

            }

            return true;

        } catch ( err ) {

            server.debug.err( 'server:router', `Error while setting up router`, err );
            process.exit( 1 );

        }

    }

    return false;

}
