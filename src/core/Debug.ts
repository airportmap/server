export class Debug {

    constructor (
        private debug: boolean = false
    ) {}

    private logMsg ( type: 'log' | 'warn' | 'error', mod: string, msg: string, critical?: boolean ) : void {

        if ( critical || type === 'error' || this.debug ) console[ type ](
            `${ new Date().toISOString() } [${ mod.toLowerCase() }] ${ type.toUpperCase() }: ${ msg }`
        );

    }

    public get enabled () : boolean { return this.debug }

    public log ( mod: string, msg: string, critical?: boolean ) : void {

        this.logMsg( 'log', mod, msg, critical );

    }

    public warn ( mod: string, msg: string, critical?: boolean ) : void {

        this.logMsg( 'warn', mod, msg, critical );

    }

    public err ( mod: string, msg: string, err?: Error ) : void {

        this.logMsg( 'error', mod, msg + ( err instanceof Error ) ? `: ${ err.message }` : ``, true );

    }

}
