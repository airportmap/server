import { Server as HttpServer } from 'node:http';
import type { ServerConfig } from '@airportmap/types';
import { Debug } from '@server/core/Debug';
import { setupI18n } from '@server/core/SetupI18n';
import express, { type Application } from 'express';

export class Server {

    private cfg: ServerConfig;
    private modules: Record< string, boolean >;
    private debug: Debug;

    private expressApp?: Application;
    private httpServer?: HttpServer;

    public get config () : ServerConfig { return this.cfg }
    public get mods () : string[] { return Object.keys( this.modules ).filter( ( k ) => this.modules[ k ] ) }
    public get debugger () : Debug { return this.debug }

    public get app () : Application { return this.expressApp }
    public get server () : HttpServer { return this.httpServer }

    constructor ( cfg: ServerConfig ) {

        this.cfg = cfg;
        this.debug = new Debug ( cfg.debug );

    }

    private async loadModules () : Promise< void > {

        this.modules.i18n = await setupI18n( this );

    }

    private listen () : void {

        if ( this.app ) this.httpServer = this.app.listen( this.cfg.port, this.cfg.host );
        else this.debugger.err( 'server', `Need to call server.init() first` );

    }

    public async init () : Promise< void > {

        this.expressApp = express();

        await this.loadModules();

    }

    public run () : void {

        this.listen();

        this.server.on( 'connect', () => {
            this.debugger.log( 'server', `Airportmap server is running on port: ${ this.cfg.port }`, true );
            this.debugger.log( 'server', `Serving host: ${ this.cfg.host }` );
            this.debugger.log( 'server', `HTTPS enabled: ${ this.cfg.https ? 'yes' : 'no' }` );
            this.debugger.log( 'server', `Debugger enabled: ${ this.debugger.enabled ? 'yes' : 'no' }` );
            this.debugger.log( 'server', `Loaded modules: ${ this.mods.join( ', ' ) }` );
        } );

        this.server.on( 'close', () => {
            this.debugger.log( 'server', `Airportmap server shut down`, true );
        } );

        this.server.on( 'error', ( err: Error ) => {
            this.debugger.err( 'server', `Server error occurred`, err );
            process.exit( 1 );
        } );

    }

    public close () : void { if ( this.server ) this.server.close() }

}
