// Represent a checkers Color.
export class Color {
    // Name of the color
    #name;
    // Each piece has an index.
    #initialIndex;
    // Initial row where the color starts.
    #initialRow;
    // Row where the color promotes.
    #promoteRow;
    // -1 or +1 in rows.
    #goDirection;
    // The player who is playing this color.
    #player;
    constructor(name, initialIndex, initialRow, promoteRow, goDirection) {
        this.#name = name;
        this.#initialIndex = initialIndex;
        this.#initialRow = initialRow;
        this.#goDirection = goDirection;
        this.#promoteRow = promoteRow;
    }

    get name() {
        return this.#name;        
    }

    get promoteRow() {
        return this.#promoteRow;        
    }

    get initialIndex() {
        return this.#initialIndex;
    }

    get initialRow() {
        return this.#initialRow;
    }

    get goDirection() {
        return this.#goDirection;
    }

   
}
// Specific piece on the board.
export class Piece 
{    
    // If the piece is king.
    #isKing;
    // If the piece is on the board.
    #isOnBoard;
    // Row is from 0 to 7
    #row;
    // Row is from 0 to 7
    #col;
    
    #color;
    // Unique piece index.
    #index;
    #player;
    constructor(color, row, col, index, player) {
        this.init(color, row, col);
        this.#isKing = false;
        this.#isOnBoard = true;
        this.#index = index;
        this.#player = player;
    }

    drawOnBoard(runtime, x,y,width, height) {
        
        const pieceY = y - height * this.#row;        
        const pieceX = x +  this.#col * width;        
        runtime.callFunction("drawPiece",pieceX, pieceY, this.#color.name, this.#index);
    }

    
    eaten() {
        this.#isOnBoard = false;
        this.#player.addToOnBoardCounter(-1);
        if (this.#isKing) {
            this.#player.addToKingCounter(-1);            
        }
    }
    unEaten() {
        this.#isOnBoard = true;
        this.#player.addToOnBoardCounter(1);
        if (this.#isKing) {
            this.#player.addToKingCounter(1);            
        }
    }

    promoteToKing() {
        this.#isKing = true;
        this.#player.addToKingCounter(1);
    }

    unPromoteToKing() {
        this.#isKing = false;
        this.#player.addToKingCounter(-1);
    }

    isKing() {
        return this.#isKing;
    }

    setPosition(row, col) {
        this.#row = row;
        this.#col = col;
    }

    init(color, row, col) {
        this.#color = color;
        this.#row = row;
        this.#col = col;
    }
    
    get index() {
        return this.#index;
    }

    get isKing() {
        return this.#isKing;
    }

    get isOnBoard() {
        return this.#isOnBoard;        
    }

    get row() {
        return this.#row;
    }

    get col() {
        return this.#col;
    }

    get color() {
        return this.#color;
    }

    get player() {
        return this.#player;
    }

}