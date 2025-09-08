import type { RouteConfig } from '@airportmap/types';
import loadConfig from '@server/core/Config';
import type Server from '@server/core/Server';
import type { Application, NextFunction, Request, Response } from 'express';
import { join } from 'node:path';

export default async function router ( server: Server ) : Promise< boolean > {

    if ( server.isModEnabled( 'router' ) ) {

        try {

            const { configPath, cntrlBase } = server.config.mods.router;
            const routes = await loadConfig< RouteConfig >( join( server.path, configPath ) );

            for ( const { method, path, controller } of routes.routes ) {

                try {

                    const cntlr = await import( join( cntrlBase, controller ) );
                    const fn = cntlr[ method ] || cntlr.default || cntlr;

                    ( server.app[ method as keyof Application ] as any )( path, (
                        req: Request, res: Response, next: NextFunction
                    ) => fn( req, res, server, next ) );

                } catch ( err ) { server.debug.warn(
                    'server:router', `Failed to load controller for route ${ method }::${ path }: ${ (
                        ( err as unknown as Error ).message
                    ) }`
                ) }

            }

            return true;

        } catch ( err ) { server.debug.exit( 'server:router', `Error while setting up router`, err ) }

    }

    return false;

}
