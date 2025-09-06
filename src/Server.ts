import express, { type Application } from 'express';

export class Server {

    private app: Application;

    constructor ( cfg ) {

        this.app = express();

    }

}
