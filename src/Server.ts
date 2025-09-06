import type { ServerConfig } from '@airportmap/types';
import { Debug } from '@server/core/Debug';
import express, { type Application } from 'express';

export class Server {

    private cfg: ServerConfig;
    private debug: Debug;
    private modules: string[];
    private app: Application;

    constructor ( cfg: ServerConfig ) {

        this.cfg = cfg;
        this.debug = new Debug ( cfg.debug );
        this.app = express();

        ( async () => await this.loadModules() )();

    }

    private async loadModules () : Promise< void > {}

    public get config () : ServerConfig { return this.cfg }
    public get debugger () : Debug { return this.debug }
    public get mods () : string[] { return this.modules }
    public get server () : Application { return this.app }

    public listen () : void {

        const { host, port, https, debug } = this.cfg;

        this.app.listen( port, host, ( err: Error ) => {

            if ( err ) this.debug.err( 'server', `Error starting server`, err );
            else {

                this.debug.log( 'server', `Airportmap server is running on port: ${ port }`, true );
                this.debug.log( 'server', `Serving host: ${ host }` );
                this.debug.log( 'server', `HTTPS enabled: ${ https ? 'yes' : 'no' }` );
                this.debug.log( 'server', `Debugger enabled: ${ debug ? 'yes' : 'no' }` );
                this.debug.log( 'server', `Loaded modules: ${ this.modules.join( ', ' ) }` );

            }

        } );

    }

}
