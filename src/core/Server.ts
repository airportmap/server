import type { ServerConfig } from '@airportmap/types';
import loadConfig from '@server/core/Config';
import Debug from '@server/core/Debug';
import AssetLoader from '@server/helper/AssetLoader';
import Renderer from '@server/helper/Renderer';
import i18n from '@server/mods/I18n';
import views from '@server/mods/Views';
import router from '@server/mods/Router';
import deepmerge from 'deepmerge';
import express, { type Application } from 'express';
import { type Server as HttpServer } from 'node:http';
import { join } from 'node:path';

export default class Server {

    private serverConfig?: ServerConfig;
    private mods: Record< string, any > = {};
    private debugger?: Debug;
    private expressApp?: Application;
    private httpServer?: HttpServer;

    private helper: {
        assetLoader?: AssetLoader;
        renderer?: Renderer;
    } = {};

    public get path () : string { return this.PATH }
    public get env () : string { return this.ENV }
    public get config () : ServerConfig { return this.serverConfig! }
    public get enabledMods () : string[] { return Object.keys( this.mods ).filter( ( k ) => this.mods[ k ] ) }
    public get debug () : Debug { return this.debugger! }
    public get app () : Application { return this.expressApp! }
    public get server () : HttpServer { return this.httpServer! }

    public get assetLoader () : AssetLoader { return this.helper.assetLoader ??= new AssetLoader ( this ) }
    public get renderer () : Renderer { return this.helper.renderer ??= new Renderer ( this ) }

    constructor (
        private PATH: string,
        private ENV: string = process.env.NODE_ENV || 'production'
    ) {}

    private async loadConfig () : Promise< ServerConfig > {

        return deepmerge(
            await loadConfig< Partial< ServerConfig > >( join( this.path, `conf/server.yml` ) ),
            await loadConfig< Partial< ServerConfig > >( join( this.path, `conf/server.${ this.env }.yml` ) )
        ) as ServerConfig;

    }

    private async loadMods () : Promise< void > {

        this.mods.i18n = await i18n( this );
        this.mods.views = await views( this );
        this.mods.router = await router( this );

    }

    private listen () : void {

        const { port, host } = this.config.server;

        if ( this.app ) this.httpServer = this.app.listen( port, host );
        else this.debug.err( 'server', `Need to call server.init() first` );

    }

    public async init () : Promise< void > {

        this.serverConfig = await this.loadConfig();
        this.debugger = new Debug ( this.config.server.debug );
        this.expressApp = express();

        await this.loadMods();

    }

    public run () : void {

        this.listen();

        this.server.on( 'connect', () => {
            const { port, host, https } = this.config.server;
            this.debug.log( 'server', `Airportmap server is running on port: ${ port }`, true );
            this.debug.log( 'server', `Serving host: ${ host }` );
            this.debug.log( 'server', `HTTPS enabled: ${ https ? 'yes' : 'no' }` );
            this.debug.log( 'server', `Debugger enabled: ${ this.debug.enabled ? 'yes' : 'no' }` );
            this.debug.log( 'server', `Loaded modules: ${ this.enabledMods.join( ', ' ) }` );
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
