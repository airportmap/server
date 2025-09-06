import type { ServerConfig } from '@airportmap/types';
import { type Application } from 'express';

export async function setupI18n ( app: Application, cfg?: ServerConfig[ 'i18n' ] ) : Promise< boolean > {

    return true;

}
