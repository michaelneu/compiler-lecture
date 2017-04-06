export class ScannerException extends Error {
    public readonly inner: Error;

    public constructor(message: string, innerException?: Error) {
        super(message);

        this.inner = innerException;
    }
}

export class Token {
    private static TOKEN_ID = 0;

    public constructor(
        public readonly name: string,
        public readonly id: number = Token.TOKEN_ID++
    ) { }

    public equals(token: Token) : boolean {
        return token && this.id == token.id;
    }
}

export class MatchedToken {
    public constructor(
        public readonly value: string,
        public readonly token: Token
    ) { }
}

export abstract class Scanner {
    public static EOF = new Token("eof");
    protected index: number;
    private _lookahead: string;

    protected get lookahead() : string {
        return this._lookahead;
    }

    public constructor(
        protected readonly text: string
    ) {
        if (!text) {
            throw new ScannerException("no text passed to lexer");
        }

        this.index = -1;
        this.consume();
    }

    protected consume() : void {
        this.index++;

        if (this.index >= this.text.length) {
            this._lookahead = null;
        } else {
            this._lookahead = this.text.charAt(this.index);
        }
    }

    public abstract nextToken() : MatchedToken;
}
