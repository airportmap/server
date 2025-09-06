import type { RenderOptions, Assets } from '@airportmap/types';
import type Server from '@server/core/Server';

export default class AssetLoader {

    constructor (
        private server: Server
    ) {}

    public async assets ( options: RenderOptions[ 'assets' ] ) : Promise< Assets > {

        return {} as Assets;

    }

}
