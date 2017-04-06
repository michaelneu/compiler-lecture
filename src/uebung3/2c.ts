import { MatchedToken, Scanner, ScannerException, Token } from "./scanner";

export class RealNumberScanner extends Scanner {
    public static readonly REALNUMBER = new Token("real number");

    private get lookaheadIsMinus() : boolean {
        return this.lookahead == "-";
    }

    private get lookaheadIsPlus() : boolean {
        return this.lookahead == "+";
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

    private get lookaheadIsE() : boolean {
        return this.lookahead == "E";
    }

    public nextToken(): MatchedToken<any> {
        if (this.lookahead == null) {
            return new MatchedToken(null, RealNumberScanner.EOF);
        } else {
            if (this.lookaheadIsNumeric) {
                let number = this.matchSequenceOfNumbers();

                if (this.lookaheadIsDot) {
                    number += this.lookahead;
                    this.consume();

                    number += this.matchSequenceOfNumbers();
                }

                if (this.lookaheadIsE) {
                    number += this.lookahead;
                    this.consume();

                    if (this.lookaheadIsMinus || this.lookaheadIsPlus) {
                        number += this.lookahead;
                        this.consume();
                    }

                    number += this.matchSequenceOfNumbers();
                }

                const float = parseFloat(number);

                return new MatchedToken<number>(float, RealNumberScanner.REALNUMBER);
            }
        }
    }

    private matchSequenceOfNumbers() : string {
        let buffer = "";

        if (!this.lookaheadIsNumeric) {
            throw new ScannerException(`expected a number, received '${this.lookahead}'`);
        }

        do {
            buffer += this.lookahead;
            this.consume();
        } while (this.lookaheadIsNumeric);

        return buffer;
    }
}

const scanner = new RealNumberScanner("10.3E+100");

let next = scanner.nextToken();

while (!next.token.equals(RealNumberScanner.EOF)) {
    console.log(`${next.token.name}: ${next.value}`);
    next = scanner.nextToken();
}
