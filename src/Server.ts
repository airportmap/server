import { Server as HttpServer } from 'node:http';
import type { ServerConfig } from '@airportmap/types';
import { Debug } from '@server/core/Debug';
import express, { type Application } from 'express';

export class Server {

    private cfg: ServerConfig;
    private debug: Debug;
    private modules: string[];

    private app?: Application;
    private server?: HttpServer;

    public get config () : ServerConfig { return this.cfg }
    public get debugger () : Debug { return this.debug }
    public get mods () : string[] { return this.modules }

    constructor ( cfg: ServerConfig ) {

        this.cfg = cfg;
        this.debug = new Debug ( cfg.debug );

    }

    private async loadModules () : Promise< void > {}

    private listen () : void {

        if ( this.app ) this.server = this.app.listen( this.cfg.port, this.cfg.host );
        else this.debug.err( 'server', `Need to call server.init() first` );

    }

    public async init () : Promise< void > {

        this.app = express();

        await this.loadModules();

    }

    public run () : void {

        const { host, port, https, debug } = this.cfg;

        this.listen();

        this.server.on( 'connect', () => {
            this.debug.log( 'server', `Airportmap server is running on port: ${ port }`, true );
            this.debug.log( 'server', `Serving host: ${ host }` );
            this.debug.log( 'server', `HTTPS enabled: ${ https ? 'yes' : 'no' }` );
            this.debug.log( 'server', `Debugger enabled: ${ debug ? 'yes' : 'no' }` );
            this.debug.log( 'server', `Loaded modules: ${ this.modules.join( ', ' ) }` );
        } );

        this.server.on( 'close', () => {
            this.debug.log( 'server', `Airportmap server shut down`, true );
        } );

        this.server.on( 'error', ( err: Error ) => {
            this.debug.err( 'server', `Server error occurred`, err );
            process.exit( 1 );
        } );

    }

    public close () : void { if ( this.server ) this.server.close() }

}
