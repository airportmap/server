import type { ServerConfig } from '@airportmap/types';
import { loadYamlConfig } from '@server/core/ConfigLoader';
import { Debug } from '@server/core/Debug';
import Renderer from '@server/helper/Renderer';
import i18n from '@server/mods/I18n';
import views from '@server/mods/Views';
import router from '@server/mods/Router';
import deepmerge from 'deepmerge';
import express, { type Application } from 'express';
import { type Server as HttpServer } from 'node:http';
import { join } from 'node:path';

export default class Server {

    private serverCfg?: ServerConfig;
    private modules: Record< string, boolean > = {};
    private debugCls?: Debug;
    private expressApp?: Application;
    private httpServer?: HttpServer;

    public get path () : string { return this.PATH }
    public get env () : string { return this.ENV }
    public get config () : ServerConfig { return this.serverCfg! }
    public get mods () : string[] { return Object.keys( this.modules ).filter( ( k ) => this.modules[ k ] ) }
    public get debug () : Debug { return this.debugCls! }
    public get app () : Application { return this.expressApp! }
    public get server () : HttpServer { return this.httpServer! }

    public get renderer () : Renderer { return new Renderer ( this ) }

    constructor (
        private PATH: string,
        private ENV: string = process.env.NODE_ENV || 'production'
    ) {}

    private async loadConfig () : Promise< ServerConfig > {

        return deepmerge(
            await loadYamlConfig( join( this.path, `conf/server.yml` ) ),
            await loadYamlConfig( join( this.path, `conf/server.${ this.env }.yml` ) )
        ) as ServerConfig;

    }

    private async loadModules () : Promise< void > {

        this.modules.i18n = await i18n( this );
        this.modules.views = await views( this );
        this.modules.router = await router( this );

    }

    private listen () : void {

        if ( this.app ) this.httpServer = this.app.listen( this.config.port, this.config.host );
        else this.debug.err( 'server', `Need to call server.init() first` );

    }

    public async init () : Promise< void > {

        this.serverCfg = await this.loadConfig();
        this.debugCls = new Debug ( this.config.debug );
        this.expressApp = express();

        await this.loadModules();

    }

    public run () : void {

        this.listen();

        this.server.on( 'connect', () => {
            this.debug.log( 'server', `Airportmap server is running on port: ${ this.config.port }`, true );
            this.debug.log( 'server', `Serving host: ${ this.config.host }` );
            this.debug.log( 'server', `HTTPS enabled: ${ this.config.https ? 'yes' : 'no' }` );
            this.debug.log( 'server', `Debugger enabled: ${ this.debug.enabled ? 'yes' : 'no' }` );
            this.debug.log( 'server', `Loaded modules: ${ this.mods.join( ', ' ) }` );
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
