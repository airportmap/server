export class Debug {

    constructor (
        private debug: boolean = false
    ) {}

    private logMsg ( type: 'log' | 'warn' | 'error', module: string, msg: string, critical?: boolean ) : void {

        if ( critical || type === 'error' || this.debug ) console[ type ](
            `${ new Date().toISOString() } [${ module.toLowerCase() }] ${ type.toUpperCase() }: ${ msg }`
        );

    }

    public get enabled () : boolean { return this.debug }

    public log ( module: string, msg: string, critical?: boolean ) : void {

        this.logMsg( 'log', module, msg, critical );

    }

    public warn ( module: string, msg: string, critical?: boolean ) : void {

        this.logMsg( 'warn', module, msg, critical );

    }

    public err ( module: string, msg: string, err?: any ) : void {

        this.logMsg( 'error', module, msg + ( err instanceof Error ) ? `: ${ err.message }` : ``, true );

    }

}
