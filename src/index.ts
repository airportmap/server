import Server from '@server/core/Server';
import AssetLoader from '@server/helper/AssetLoader';
import Renderer from '@server/helper/Renderer';

async function startServer ( path: string, env?: string ) : Promise< Server > {

    const server = new Server( path, env );
    await server.init();

    server.run();

    return server;

}

export { Server, AssetLoader, Renderer, startServer };
