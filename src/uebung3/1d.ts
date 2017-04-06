import { Scanner, ScannerException, MatchedToken, Token } from "./scanner";

export class FixedCommaScanner extends Scanner {
    public static readonly NUMBER = new Token("number");

    private get lookaheadIsZero() : boolean {
        return this.lookahead == "0";
    }

    private get lookaheadIsMinus() : boolean {
        return this.lookahead == "-";
    }

    private get lookaheadIsDot() : boolean {
        return this.lookahead == ".";
    }

    private get lookaheadIsNumeric() : boolean {
        switch (this.lookahead) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                return true;
            
            default:
                return false;
        }
    }

    public nextToken(): MatchedToken<any> {
        if (this.lookahead == null) {
            return new MatchedToken(null, FixedCommaScanner.EOF);
        } else {
            if (this.lookaheadIsNumeric || this.lookaheadIsDot || this.lookaheadIsMinus) {
                const number = this.matchNumber(),
                      float = parseFloat(number);

                return new MatchedToken<number>(float, FixedCommaScanner.NUMBER);
            } else {
                throw new ScannerException(`unknown token "${this.lookahead}"`);
            }
        }
    }

    private matchNumber() : string {
        return this.matchOptionalMinus() + this.matchPositiveNumber();
    }

    private matchOptionalMinus() : string {
        if (this.lookaheadIsMinus) {
            this.consume();

            return "-";
        } else {
            return "";
        }
    }

    private matchPositiveNumber() : string {
        if (this.lookaheadIsDot) {
            this.consume();

            return "." + this.matchSequenceOfAnyNumber();
        } else if (this.lookaheadIsNumeric) {
            if (this.lookaheadIsZero) {
                this.consume();

                return "0" + this.matchDot() + this.matchOptionalSequenceOfAnyNumber();
            } else {
                return this.matchSingleNonZeroNumber() + this.matchOptionalSequenceOfAnyNumber() + this.matchOptionalDot() + this.matchOptionalSequenceOfAnyNumber();
            }
        }
    }

    private matchSequenceOfAnyNumber() : string {
        let buffer = "";

        while (this.lookaheadIsNumeric) {
            buffer += this.lookahead;
            this.consume();
        }

        if (buffer.length == 0) {
            throw new ScannerException("empty number sequence. expected at least 1 number");
        }

        return buffer;
    }

    private matchSingleNonZeroNumber() : string {
        if (this.lookaheadIsNumeric && !this.lookaheadIsZero) {
            const char = this.lookahead;

            this.consume();

            return char;
        } else {
            throw new ScannerException("lookahead is not numeric");
        }
    }

    private matchOptionalSequenceOfAnyNumber() : string {
        if (this.lookaheadIsNumeric) {
            return this.matchSequenceOfAnyNumber();
        } else {
            return "";
        }
    }

    private matchDot() : string {
        if (this.lookaheadIsDot) {
            this.consume();

            return ".";
        } else {
            throw new ScannerException(`expected '.', got '${this.lookahead}'`);
        }
    }

    private matchOptionalDot() : string {
        if (this.lookaheadIsDot) {
            return this.matchDot();
        } else {
            return "";
        }
    }
}



const lexer = new FixedCommaScanner("-0.123.123");
let next = lexer.nextToken();

while (!next.token.equals(FixedCommaScanner.EOF)) {
    console.log(`${next.token.name}: ${next.value}`);
    next = lexer.nextToken();
}
