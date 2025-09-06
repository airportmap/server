import type { AppConfig } from '@airportmap/types';
import express, { type Application } from 'express';

export class Server {

    private cfg: AppConfig;
    private app: Application;

    constructor ( cfg: AppConfig ) {

        this.cfg = cfg;
        this.app = express();

        this.setup();

    }

    private viewEngine () : void {

        this.app.set( 'view engine', this.cfg._express.viewEngine ?? 'pug' );
        this.app.set( 'views', this.cfg.paths.views );

    }

    private serveStatic () : void {

        for ( const [ key, path ] of Object.entries( this.cfg.paths.static ) ) {

            this.app.use( `/${ key }`, express.static( path ) );

        }

    }

    public setup () : void {

        this.viewEngine();
        this.serveStatic();

    }

    public getCfg () : AppConfig { return this.cfg }

    public getApp () : Application { return this.app }

}
