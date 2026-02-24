import {Piece, Color} from './piece.js';
export class Move
{
    // The piece that is moving
    #movingPiece;
    // Moving rows order array (including original place)
    #moveRows;
    // Moving cols order array (including original place)
    #moveCols;
    // Eaten pieces.
    #eatenPieces;
    // Promote to King
    #promoteToKing;
    constructor(movingPiece, moveRows, moveCols, eatenPieces, promoteToKing) {
        this.#movingPiece = movingPiece;
        this.#moveRows = moveRows;
        this.#moveCols = moveCols;
        this.#eatenPieces = eatenPieces;        
        this.#promoteToKing = promoteToKing;
    }

    getCopy() {
        return new Move(this.#movingPiece, [ ...this.#moveRows], [...this.#moveCols], [...this.#eatenPieces], this.#promoteToKing);
    }

    doMove() {
        const initialRow = this.#moveRows[this.#moveRows.length - 1];
        const initalCol = this.#moveCols[this.#moveCols.length - 1];        
          // Move to final position
          this.#movingPiece.setPosition(initialRow, initalCol);
          // eat pieces.
          for (let i = 0; i < this.#eatenPieces.length; i++) {
			  
              this.#eatenPieces[i].eaten();
          }
          // promote to king
          if (this.#promoteToKing) {
              this.#movingPiece.promoteToKing();
          }
    }
    undoMove() {
        const initialRow = this.#moveRows[0];
        const initalCol = this.#moveCols[0];
        // Restore to original place
        this.#movingPiece.setPosition(initialRow, initalCol);
        // un eat pieces.
        for (let i = 0; i < this.#eatenPieces.length; i++) {
            this.#eatenPieces[i].unEaten();
        }
        // Unpromote to king
        if (this.#promoteToKing) {
            this.#movingPiece.unPromoteToKing();
        }
    }
    addPosition(row, col) {
        this.#moveRows.push(row);
        this.#moveCols.push(col);
    }
    addEatenPieces(eatenPiecesArray)
    {
        this.#eatenPieces = this.#eatenPieces.concat(eatenPiecesArray);
    }

    updateIsPromoting(isPromoting) {
        this.#promoteToKing = isPromoting;
    }
    

    get movingPiece() {
        return this.#movingPiece;
    }
    get finishRow() {
        return this.moveRows[this.moveRows.length - 1];
    }

    get finishCol() {
        return this.moveCols[this.moveCols.length - 1];
    }

    get firstRow() {
        return this.moveRows[0];
    }

    get firstCol() {
        return this.moveCols[0];
    }
    get moveRows() {
        return this.#moveRows;
    }
    get moveCols() {
        return this.#moveCols;
    }
    get isPromotingToKing() {
        return this.#promoteToKing;
    }

    get eatenPieces() {
        return this.#eatenPieces;
    }

    get isEatingMove() {
        return this.#eatenPieces.length > 0;
    }
}