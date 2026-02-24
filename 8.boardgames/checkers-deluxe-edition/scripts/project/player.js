import {Piece, Color} from './piece.js';

export class Player
{
    static PIECES_PER_PLAYER = 12;
    static PIECES_PER_ROW = 4;
    
    static WHITE = new Color("White", 0, 0, 7, 1);
    static BLACK = new Color("Black", Player.PIECES_PER_PLAYER, 7, 0, -1);
    // Array with all the pieces.
    #pieces;        
    #color;
    #isHuman;
    #name;
    #piecesDict;
    #kingsCounter;
    #onBoardCounter;
    // Dictionary of pieces.
    constructor(color, isHuman, name) {
        this.#name = name;
        this.#color = color;
        this.#isHuman = isHuman;
        this.#kingsCounter = 0;
        this.#onBoardCounter = 0;
        this.initPieces();
    }

    initPieces() {
        this.#pieces = [];
        this.#piecesDict = {};

        let curRow = this.#color.initialRow;
        for (let i = 0; i < Player.PIECES_PER_PLAYER;i++) {
            // console.log("Init piece - " + this.#color.goDirection)
            const row = curRow + this.#color.goDirection * (Math.floor(i/Player.PIECES_PER_ROW));
            const col = (i % Player.PIECES_PER_ROW) * 2 + (row % 2);            
            const index = this.#color.initialIndex + i;
            const piece = new Piece(this.#color,row,col, index, this);
            this.#piecesDict[index] = piece;
            this.#pieces.push(piece);
            this.#onBoardCounter++;
        }
    }

    hasPiece(pieceIndex) {
        return (this.#piecesDict[pieceIndex] != undefined);
    }
    drawPieces(runtime, x, y, width, height) {
        // console.log("in draw pieces - " + this.#pieces.length);
        for (let i = 0; i < this.#pieces.length; i++) {
            this.#pieces[i].drawOnBoard(runtime, x,y ,width, height);
        }
    }
    addToOnBoardCounter(value) {
        this.#onBoardCounter += value;
    }

    addToKingCounter(value) {
        this.#kingsCounter += value;
    }
    get heuristicValue() {
        // King is equal to 3 players
        return this.#onBoardCounter + 2*this.#kingsCounter;        
    }
    get piecesOnBoard() {
        const result = [];
        for (let i = 0; i < this.#pieces.length; i++) {
            const curPiece = this.#pieces[i];
            if (curPiece.isOnBoard) {
                result.push(curPiece);
            }
        }
        
        return result;
    }
    get color() {
        return this.#color;
    }

    get pieces() {
        return this.#pieces;
    }

    get piecesDict() {
        return this.#piecesDict;
    }
    get name() {
        return this.#name;
    }

    get isHuman() {
        return this.#isHuman;
    }

    get initalIndex() {
        return this.#color.initialIndex;
    }

    get piecesDict() {
        return this.#piecesDict;
    }

    get direction() {
        return this.color.goDirection;
    }

}