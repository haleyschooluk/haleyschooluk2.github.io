import { Move } from './move.js';
import {Piece, Color} from './piece.js';
import {Player} from './player.js';

export class Board {
	static PositionValues = {
		Empty: -1
	};
	static Levels = {
		Easy : 0,
		MediumEasy : 1,
		Medium : 2,
		HardMedium: 3,
		Hard : 4
	}
	static GAME_ROWS = 8;
	static GAME_COLS = 8;	
	static MAX_VALUE = 1000000;
	static MIN_VALUE = -1000000;
	static MEDIUMEASY_DEPTH = 1;
	static MEDIUM_DEPTH = 2;
	static HARDMEDIUM_DEPTH = 4;
	static HARD_DEPTH = 6;
	
	// Dictionary which contains if there are pieces in a specific location.
	#piecesPositionDict;
	#player1;
	#player2;
	#currentPlayer;
	#nextPlayer;
	#noEatDraw; // How many moves without eating cause a draw.
	#noEatCounter; // How many moves without eating so far.
	#isVsComputer;
	#runtime;
	#movingPiece;
	#level;
	// Whether we're in the middle of a eating move.
	#inMiddleOfMove;
	// Related to drawing.
	#x;
	#y;
	#width;
	#height;
	constructor(runtime, noEatDraw, isVsComputer, level) {
		this.#level = level;
		this.#movingPiece = null;
		this.#piecesPositionDict = {};				
		this.#isVsComputer = isVsComputer;		
		this.#player1 = new Player(Player.WHITE, true, "Yuval");
		this.#player2 = new Player(Player.BLACK, !isVsComputer, "Roni");				
		this.#noEatDraw =noEatDraw;		
		this.#noEatCounter = 0;
		this.#runtime = runtime;
		this.#inMiddleOfMove = false;		
		this.initPiecesDict();
		this.startGame();		
	}

	get getPlayer(){
		return this.#currentPlayer;
	}

	setDrawing(x,y, width, height) {
		this.#x = x;
		this.#y = y;
		this.#width = width;
		this.#height = height;
	}

	initBoard() {
		this.#noEatCounter = 0;	
		this.#player1.initPieces();
		this.#player2.initPieces();
		this.initPiecesDict();
		
	}

	initPiecesDict() {
		this.#piecesPositionDict = {};
		for (let i = 0; i < Board.GAME_COLS * Board.GAME_ROWS; i++) {
			this.#piecesPositionDict[i] = Board.PositionValues.Empty;
		}
		this.addPlayerPieces(this.#player1);
		this.addPlayerPieces(this.#player2);
		
	}

	addPlayerPieces(player) {
		for (let i = 0; i < player.pieces.length; i++) {
			const curPiece = player.pieces[i];
			const curPosition = this.getIndex(curPiece.row, curPiece.col);
			this.#piecesPositionDict[curPosition] = curPiece;
		}
	}

	startGame() {
		this.#currentPlayer = this.#player1;
		this.#nextPlayer = this.#player2;
		this.setNextTurn();
	}

	swapTurns() {
		const tempPlayer = this.#currentPlayer;
		this.#currentPlayer = this.#nextPlayer;
		this.#nextPlayer = tempPlayer;
		
								 
	}

	 playComputerTurn() {
		 		
		let curMove = this.getComputerMove();
		this.#movingPiece = curMove.movingPiece;
		// Now we do the move and change turns:
		this.applyMoveOnBoard(this.#movingPiece, curMove);
		curMove.doMove();
		// Check if its an eating move.
		if (curMove.isEatingMove) {
			
			this.#noEatCounter = 0;						
		} else {
			this.#noEatCounter++;
		}

		if ((curMove.isEatingMove) && (this.canMakeAnotherEatingMove(curMove) && this.#currentStepInMove >= (this.#currentMove.moveCols.length -1))) {
			
			this.#inMiddleOfMove = true;
			this.setMovingPieceFrame(true);
			this.setNextTurn();
			
			
			return;				
		} else {
			
			this.turnFinished();
			this.#runtime.callFunction("computerFinishedTurn");
		}
		
	}
	
	
	//make random move for player
	makeRandomMove(){
		
	
	const optionalMoves = this.getPlayerMoves(this.#currentPlayer);
	const eatingMoves = this.getEatingMoves(optionalMoves);
	let randomMove;	
		
			if (eatingMoves.length > 0 ) {				
				 randomMove =  this.getRandomMove(eatingMoves);
			}
			else
			     randomMove = (this.getRandomMove(optionalMoves));
			this.#movingPiece = randomMove.movingPiece;
			this.applyMoveOnBoard(this.#movingPiece, randomMove);
			randomMove.doMove();
		// Check if its an eating move.
		
		if (randomMove.isEatingMove) {
			
			this.#noEatCounter = 0;						
		} else {
			this.#noEatCounter++;
		}

		if ((randomMove.isEatingMove) && (this.canMakeAnotherEatingMove(randomMove))) {
			
			this.#inMiddleOfMove = true;
			this.setMovingPieceFrame(true);
			this.setNextTurn();
			return;				
		} else {
			
			this.turnFinished();
		

	}
	}
	
	
	
	// Assumes now it is the computer turn and that the computer has moves.
	getComputerMove() {
		// Easy level
		if (this.#level === Board.Levels.Easy) {			
			if (this.#inMiddleOfMove) {				
				let eatingMoves = this.getEatingMoves(this.getMovesForPiece(this.#movingPiece));
				return (this.getRandomMove(eatingMoves));
			}
			const optionalMoves = this.getPlayerMoves(this.#currentPlayer);
			
			const eatingMoves = this.getEatingMoves(optionalMoves);
			if (eatingMoves.length > 0 ) {				
				return this.getRandomMove(eatingMoves);
			}			
			return (this.getRandomMove(optionalMoves));
		}
		
		// MediumEasy level
		if (this.#level === Board.Levels.MediumEasy) {			
			
			return this.returnMoveMinMax(Board.MEDIUMEASY_DEPTH, Board.MIN_VALUE - 1, Board.MAX_VALUE + 1);
		}
		
		// Medium level
		if (this.#level === Board.Levels.Medium) {			
			
			return this.returnMoveMinMax(Board.MEDIUM_DEPTH, Board.MIN_VALUE - 1, Board.MAX_VALUE + 1);
		}
		
		// HardMedium level
		if (this.#level === Board.Levels.HardMedium) {			
			
			return this.returnMoveMinMax(Board.HARDMEDIUM_DEPTH, Board.MIN_VALUE - 1, Board.MAX_VALUE + 1);
		}
		
		
		// Hard level
		if (this.#level === Board.Levels.Hard) {						
			return this.returnMoveMinMax(Board.HARD_DEPTH, Board.MIN_VALUE - 1, Board.MAX_VALUE + 1);
		}
	}

	// Runs the minMax algorithm. returnCol is a boolean which means returning the selected column, rather than the value.
    // See explanation about minmax with alpha beta purning -
	// https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-4-alpha-beta-pruning/
	
	// The initial min max call to save time on checking if to return move.	
	returnMoveMinMax(depth, alpha, beta) {
		// Checking if its a leaf node (shouldn't happen).
		if ((depth === 0) || (!this.hasMoves(this.#currentPlayer))) {
			return this.getBoardValue();
		}

		// Assumes its a maximizing node -
		let result = Board.MIN_VALUE;			
            let selectedMoves = [];
            const moves = this.getMinMaxMoves();
			// No need to check if there's only one optional move.
			if ((moves.length === 1)) {
				return moves[0];
			}
            for (let i = 0; i < moves.length; i++) {
                const curMove = moves[i];
				this.doMinMaxMove(curMove);				
                const tempResult = this.minMax(depth -1, false, alpha, beta);
				
                if (tempResult > result) {
                    result = tempResult;
                    selectedMoves = [];
                    selectedMoves.push(curMove);
                }
                else if (tempResult === result) {
                    selectedMoves.push(curMove);
                }
				this.undoMinMaxMove(curMove);
				
				if (result >= alpha) {
					alpha = result;
				}
				if (beta <= alpha) {
				    //console.log("1");
					//break;
				}
                
            }
			return this.selectBetweenEqualMoves(selectedMoves);
	}
	minMax(depth, maximizingPlayer,alpha, beta) {		        
		// Checking if its a leaf node.		
		if ((depth === 0) || (!this.hasMoves(this.#currentPlayer))) {
			return this.getBoardValue();
		}		        
        if (maximizingPlayer) {			
            let result = Board.MIN_VALUE;			            
            const moves = this.getMinMaxMoves();			
            for (let i = 0; i < moves.length; i++) {
				
                const curMove = moves[i];
				this.doMinMaxMove(curMove);				
                const tempResult = this.minMax(depth -1, false, alpha, beta);
				
                if (tempResult > result) {
                    result = tempResult;
                    
                }                
				this.undoMinMaxMove(curMove);
				
				if (result >= alpha) {
					alpha = result;
				}
				if (beta < alpha) {
				    //console.log("2");
					//break;
				}
                
            }

            return result;
        }

        // For human we don't need the move
		if (!maximizingPlayer) {
			
            let result = Board.MAX_VALUE;
            
            const moves = this.getMinMaxMoves();
            for (let i = 0; i < moves.length; i++) {
                const curMove = moves[i];
				this.doMinMaxMove(curMove);				
                const tempResult = this.minMax(depth -1, true, alpha, beta);
                if (tempResult < result) {
                    result = tempResult;
				}
                this.undoMinMaxMove(curMove);    
				
				// Max will never choose this way.
				if (result < beta) {
					beta = result;
				}
				if (beta < alpha) {
				    //console.log("3");
					//break;
				}
            }
            
            return result;
        }
    }
	// %10 to select randomly, 90% to select the move that will minimize square differences on the board.
	// This is done to chase the player when the game nears ending.
	selectBetweenEqualMoves(moves) {		
		const chance = Math.random();
		// Random
		if (chance < 0.1) {
			return moves[Math.floor(Math.random()*moves.length)];
		}

		// Minimizes the difference between the pieces to create action.
		let resultMove = null;
		let resultDiff = Board.MAX_VALUE;
		for (let i = 0; i < moves.length; i++) {			
			this.doMinMaxMove(moves[i]);
			const diff = this.getBoardDistance();
			
			if (diff < resultDiff) {
				resultMove = moves[i];
				resultDiff = diff;
			}
			this.undoMinMaxMove(moves[i]);
		}
		return resultMove;
		
	}

	// returns the distance between all pieces on the board. This is used to decide which move to do if
	// all moves are equal.
	getBoardDistance() {
		const p1Pieces = this.#player1.piecesOnBoard;
		const p2Pieces = this.#player2.piecesOnBoard;
		let result = 0;
		for (let i = 0; i < p1Pieces.length; i++) {
			for (let j = 0; j < p2Pieces.length;j ++) {
				const p1 = p1Pieces[i];
				const p2 = p2Pieces[j];
				let diff =this.distanceBetweenPieces(p1, p2);
				if (p1.isKing || p2.isKing) {
					diff = diff * 3;
				}
				result += diff
			}
		}
		
		return result;
	}
	// Math formua to determine moves between pieces.
	distanceBetweenPieces(piece1, piece2) {
		return Math.sqrt(this.squareDiff(piece1.row, piece2.row) + this.squareDiff(piece1.row, piece2.row));
	}
	squareDiff(num1, num2) {
		return Math.pow(num1 - num2, 2);
	}
	getMinMaxMoves() {
		const result = [];
		
		let eatingMoves = this.getPlayerEatingMoves(this.#currentPlayer);
		if (eatingMoves.length === 0) {
			return this.getPlayerNoEatingMoves(this.#currentPlayer);			
		}
				
		while (eatingMoves.length > 0) {
			const curMove = eatingMoves.pop();
			const expandedMoves = this.getExpandedMoves(curMove);
			if (expandedMoves.length === 0) {
				result.push(curMove);
			} else {
				eatingMoves = eatingMoves.concat(expandedMoves);
			}			
		}

		return result;
	}

	
	getExpandedMoves(move) {
		if (move.isPromotingToKing) {
			return [];
		}
		const direction = move.movingPiece.player.direction;
		let result = [];
		this.addExpandedMoveIfNotNull(result, move, this.checkEatingMove(move.movingPiece, move.finishRow + 2* direction, move.finishCol + 2, move.finishRow + direction, move.finishCol +1));
		// Check if left is open
		this.addExpandedMoveIfNotNull(result, move, this.checkEatingMove(move.movingPiece, move.finishRow + 2* direction, move.finishCol - 2, move.finishRow + direction, move.finishCol  -1));

		if (move.movingPiece.isKing) {
			// Check if right is open -		
		this.addExpandedMoveIfNotNull(result, move, this.checkEatingMove(move.movingPiece, move.finishRow - 2* direction, move.finishCol + 2, move.finishRow - direction, move.finishCol +1));
		// Check if left is open
		this.addExpandedMoveIfNotNull(result, move, this.checkEatingMove(move.movingPiece, move.finishRow - 2* direction, move.finishCol - 2, move.finishRow - direction, move.finishCol  -1));
		}
		
		return result;
	}

	addExpandedMoveIfNotNull (result, move, expandMove) {
		if (expandMove === null) {
			return;
		}

		// Checking that we don't "eat" a piece already eaten.
		for (let i = 0; i < move.eatenPieces.length; i++) {
			for (let j = 0; j < expandMove.eatenPieces.length; j++) {
				const curPiece = move.eatenPieces[i];
				const newPiece = expandMove.eatenPieces[j];
				
				if (curPiece.index === newPiece.index) {
					return;
				}
			}
		}
		let newMove = move.getCopy();
		
		newMove.addPosition(expandMove.finishRow, expandMove.finishCol);
		newMove.addEatenPieces(expandMove.eatenPieces);
		newMove.updateIsPromoting(expandMove.isPromotingToKing);
		
		result.push(newMove);
	}
	
	doMinMaxMove(move) {
		
		// Update position of moving piece.
		this.updatePiecePositionDict(move.movingPiece, move.finishRow, move.finishCol);
		// clear Eaten Positions.
		for (let i = 0; i < move.eatenPieces.length; i++) {						
			this.clearPosition(move.eatenPieces[i].row, move.eatenPieces[i].col);
		}
		// Mark pieces as eaten.
		// Move piece to final position.
		// Promote to king if needed.
		move.doMove();
		this.swapTurns();		
	}

	undoMinMaxMove(move) {
		// Update position of moving piece.
		this.updatePiecePositionDict(move.movingPiece, move.firstRow, move.firstCol);
		// Reset Eaten Positions.
		for (let i = 0; i < move.eatenPieces.length; i++) {						
			this.#piecesPositionDict[this.getIndex(move.eatenPieces[i].row, move.eatenPieces[i].col)] = move.eatenPieces[i];
		}

		move.undoMove();
		this.swapTurns();		
		
	}
	pieceTouched(pieceIndex) {
		if (this.#inMiddleOfMove) {
			return;
		}
		const curPiece = this.getPiece(pieceIndex);
		
		if (!curPiece) {
			this.#runtime.callFunction("setError","Can't find piece");
			return;
		}

		if (curPiece.player !== this.#currentPlayer) {
			this.#runtime.callFunction("setError","Wrong player");
			
			return;
		}
		

		this.getMovesForPiece(curPiece, false);
		this.#runtime.callFunction("cleanError");
		
		if (this.#movingPiece != null) {
			this.setMovingPieceFrame( false);
		}
		this.#movingPiece = curPiece;
		this.setMovingPieceFrame(true);
	}
	

	backgroundTouched(backgorundIndex) {		
		if (this.#piecesPositionDict[backgorundIndex] !== Board.PositionValues.Empty) {
			
			return;
		}
		if (this.#movingPiece == null) {
			this.#runtime.callFunction("setError","Select moving piece first");
			return;
		}

		const finishCol = this.getCol(backgorundIndex);
		const finishRow = this.getRow(backgorundIndex);

		const moves = this.getMovesForPiece(this.#movingPiece, false);
		
		
		let eatingMovePossible = false;
		let curMove = null;
		for (let i = 0; i < moves.length; i++) {
			const tempMove = moves[i];
			const tempLastRow = tempMove.finishRow;
			const tempLastCol = tempMove.finishCol;
			if ((finishCol == tempLastCol) && (finishRow == tempLastRow)) {
				curMove = tempMove;			
			}
			if (tempMove.isEatingMove) {
				eatingMovePossible = true;
			}
		}

		if (curMove == null) {
			this.#runtime.callFunction("setError","ilegal move - " + finishRow + "," + finishCol);
			return;
		}

		if ((!curMove.isEatingMove)) {
			if (eatingMovePossible) {
				this.#runtime.callFunction("setError","Must make an eating move");
				return;
			}
			
			// Going over other pieces of this player -
			const pieces = this.#currentPlayer.pieces;
			for (let i = 0; i < pieces.length; i++) {
				const tempPiece = pieces[i];
				if (!tempPiece.isOnBoard) {					
					continue;
				}

				const pieceMoves = this.getMovesForPiece(tempPiece, false);
				for (let j = 0; j <pieceMoves.length; j++) {
					const tempMove = pieceMoves[j];
					if (tempMove.isEatingMove) {
						this.#runtime.callFunction("setError","Other piece can make eating move");
						return;
					}
				}
			}

			// We made a no eating move -
			this.#noEatCounter += 1;
		} else {
			this.#noEatCounter = 0;
		}

		

		// Now we do the move and change turns:
		this.applyMoveOnBoard(this.#movingPiece, curMove);
		curMove.doMove();
		if (this.canMakeAnotherEatingMove(curMove)) {
			
			this.#inMiddleOfMove = true;
			this.setMovingPieceFrame(true);
			this.setNextTurn();
			this.highLightMoves(this.#movingPiece.index);
			return;				
		}
		
		// If we got here, not in middle of move.
		this.turnFinished();
	}
	// Get the value of the board. Assumes player1 is the computer, and player2 is the computer.
	// Computer maximizes.

	getBoardValue() {
		// Current player has no moves.
		
		if (!this.hasMoves(this.#currentPlayer)) {
			if (this.#currentPlayer.isHuman) {
				return Board.MAX_VALUE;
			} else {
				return Board.MIN_VALUE;
			}
		}
		
		return this.#player2.heuristicValue - this.#player1.heuristicValue;
	}
	turnFinished() {
		this.#inMiddleOfMove = false;
		this.#movingPiece = null;		
		this.swapTurns();
		
		this.#runtime.callFunction("FinishedTurn");
		this.setNextTurn();
	}

	 canMakeAnotherEatingMove(curMove) {
		
		if ((curMove.isEatingMove) && (!curMove.isPromotingToKing)) {
			// Need to check if its possible to make another turn.
			const nextMoves = this.getMovesForPiece(this.#movingPiece, false);
			for (let i = 0; i < nextMoves.length; i++) {
				const tempMove = nextMoves[i];
				if (tempMove.isEatingMove) {
					
					return true;					
				}
			}
		}
		return false;
	}
	getRandomMove(moves) {
		return moves[Math.floor(Math.random()*moves.length)];
	}

	// Returns only the eating moves from the array.
	getEatingMoves(moves) {
		let result = [];
		for (let i = 0; i < moves.length; i++) {
			let curMove = moves[i];
			if (curMove.isEatingMove) {
				result.push(curMove);
			}
		}
		return result;
	}
	
	checkIfPieceIsKing(pieceIndex) {  
	
	const piece = this.getPiece(pieceIndex);
	
	if(piece.isKing)
		{
			return true; 
		}
	
	
	}
	
	 setNextTurn() {		
		if (this.#inMiddleOfMove) {
			this.#runtime.callFunction("setMessage",this.#currentPlayer.color.name + " player turn again - can eat more.")	
			
			if (!this.#currentPlayer.isHuman) {
				
				this.#runtime.callFunction("startComputerTurn");	
				
			}
			
			return;
		}
		//Need to check if the same player can make another move -
		if (!this.hasPiecesOnBoard(this.#currentPlayer)) {
			this.#runtime.callFunction("gameOver",this.#nextPlayer.color.name);
			return;
		}
		// Check for game over -
		if (!this.hasMoves(this.#currentPlayer)) {
			this.#runtime.callFunction("gameOver",this.#nextPlayer.color.name);
			return;
		}
		
		if (this.#noEatCounter >= this.#noEatDraw) {
			this.#runtime.callFunction("gameOver","Draw");
			return;
		}

		this.#runtime.callFunction("setMessage",this.#currentPlayer.color.name + " player turn.")

		if (!this.#currentPlayer.isHuman) {
			this.#runtime.callFunction("startComputerTurn");
		}
	}
	hasPiecesOnBoard(player) {
		const piecesOnBoard = player.piecesOnBoard;
		
		return (piecesOnBoard.length > 0);
	}
	hasMoves(player) {
		const piecesOnBoard = player.piecesOnBoard;
		if (piecesOnBoard.length === 0) {
			return false;
		}

		for (let i = 0; i < piecesOnBoard.length; i++ ) {
			const curPiece = piecesOnBoard[i];
			const pieceMoves = this.getMovesForPiece(curPiece, false);
			if (pieceMoves.length > 0){
				
				return true;
			}
		}

		return false;
	}
	
	possibleMoves() { 
    let piecesOnBoard = this.getPlayer.piecesOnBoard;
	if(this.#inMiddleOfMove){
		piecesOnBoard = this.#movingPiece;
	}
		
	let canEat = false;

    if (piecesOnBoard.length === 0) {
        return false;
    }

    for (let i = 0; i < piecesOnBoard.length; i++) {
        const tempPiece = piecesOnBoard[i];
        if (!tempPiece.isOnBoard) {					
            continue;
        }

        const pieceMoves = this.getMovesForPiece(tempPiece, false);
        for (let j = 0; j < pieceMoves.length; j++) {
            const tempMove = pieceMoves[j];
            if (tempMove.isEatingMove) {
                canEat = true;
            }
        }
	}
		for (let i = 0; i < piecesOnBoard.length; i++) {
		const tempPiece = piecesOnBoard[i];
		const pieceMoves = this.getMovesForPiece(tempPiece, false);
        if ((pieceMoves.length > 0) && (!canEat)) {
            this.#runtime.callFunction("setPieceFrame", this.getPieceBackgroundIndex(tempPiece), true);
            continue;
        }
        if (pieceMoves.length > 0) {
            // check if there's an eating move -
            for (let j = 0; j < pieceMoves.length; j++) {
                const tempMove = pieceMoves[j];
                if (tempMove.isEatingMove) {
                    this.#runtime.callFunction("setPieceFrame", this.getPieceBackgroundIndex(tempPiece), true);
                    break;
                }
            }
        }
    }
}


	
	
	getPlayerMoves(player) {
		let result = [];
		const piecesOnBoard = player.piecesOnBoard;	
		for (let i = 0; i < piecesOnBoard.length; i++ ) {
			const curPiece = piecesOnBoard[i];
			const pieceMoves = this.getMovesForPiece(curPiece);
			result = result.concat(pieceMoves);
		}

		return result;
	}
	getPlayerEatingMoves(player) {
		let result = [];
		const piecesOnBoard = player.piecesOnBoard;	
		for (let i = 0; i < piecesOnBoard.length; i++ ) {
			const curPiece = piecesOnBoard[i];
			const pieceMoves = this.getEatingMovesForPiece(curPiece);
			result = result.concat(pieceMoves);
		}

		return result;		
	}

	getPlayerNoEatingMoves(player) {
		let result = [];
		const piecesOnBoard = player.piecesOnBoard;	
		for (let i = 0; i < piecesOnBoard.length; i++ ) {
			const curPiece = piecesOnBoard[i];
			const pieceMoves = this.getNoEatingMoivesForPiece(curPiece);
			result = result.concat(pieceMoves);
		}

		return result;		
	}
	
	#currentlyMovingPiece;
	#currentMove;
	#currentStepInMove;
	applyMoveOnBoard(piece, move) {
		this.setMovingPieceFrame(false);		
		if (!move.isEatingMove) {
			this.pieceMoveToPosition(piece, move.finishRow, move.finishCol);
			// Check if we need to make the piece a king.
			if (move.isPromotingToKing) {
				this.#runtime.callFunction("makePieceKing", piece.index);				
			}
			return;
		}

		this.#currentlyMovingPiece = piece;
		this.#currentMove = move;
		this.#currentStepInMove = 0;		
		
		this.updatePiecePositionDict(piece, move.finishRow, move.finishCol);
		
		this.nextStepOfMove();
		
		
		/*if (move.isEatingMove) {
			for (let i = 0; i < move.eatenPieces.length; i++) {
				const eatenPiece = move.eatenPieces[i];
				this.pieceEaten(eatenPiece);				
			}
		}
		this.pieceMoveToPosition(piece, move.finishRow, move.finishCol);

		// Check if we need to make the piece a king.
		if (move.isPromotingToKing) {
			this.#runtime.callFunction("makePieceKing", piece.index);
		}*/
	}
	
	
	nextStepOfMove() {		
		if (this.#currentStepInMove >= (this.#currentMove.moveCols.length -1) ) {
			// Only here we end computer turn.
			return;
		}

		const moveToCol = this.#currentMove.moveCols[this.#currentStepInMove + 1];
		const moveToRow = this.#currentMove.moveRows[this.#currentStepInMove + 1];
		const eatenPice = this.#currentMove.eatenPieces[this.#currentStepInMove];		
		this.clearPosition(eatenPice.row, eatenPice.col);		
		const pieceY = this.#y - this.#height * moveToRow;        
        const pieceX = this.#x +  moveToCol * this.#width;		
	
		let promote = ((this.#currentMove.isPromotingToKing) && ((this.#currentStepInMove + 2) === this.#currentMove.moveCols.length ));
		this.#currentStepInMove = this.#currentStepInMove + 1;
		this.#runtime.callFunction("moveAndEatPiece", this.#currentlyMovingPiece.index, pieceX, 	pieceY, eatenPice.index,promote);				
	}
	
/*	
	nextStepOfMove() {
    // Check if the current step is within the range of moveCols and if the piece is not in the middle of another move
    if (this.#currentStepInMove <= (this.#currentMove.moveCols.length - 1) && !this.#inMiddleOfMove) {
        const moveToCol = this.#currentMove.moveCols[this.#currentStepInMove + 1];
        const moveToRow = this.#currentMove.moveRows[this.#currentStepInMove + 1];
        const eatenPice = this.#currentMove.eatenPieces[this.#currentStepInMove];

        if (eatenPice) {
            this.clearPosition(eatenPice.row, eatenPice.col);
            const pieceY = this.#y - this.#height * moveToRow;
            const pieceX = this.#x + moveToCol * this.#width;

            let promote = ((this.#currentMove.isPromotingToKing) && ((this.#currentStepInMove + 2) === this.#currentMove.moveCols.length));
            this.#currentStepInMove = this.#currentStepInMove + 1;
            this.#runtime.callFunction("moveAndEatPiece", this.#currentlyMovingPiece.index, pieceX, pieceY, eatenPice.index, promote);
        } else {
            console.warn(`No eaten piece found for step: ${this.#currentStepInMove}`);
        }
    } else {
        // End computer turn if the current step is out of range or if the piece is in the middle of another move
        return;
    }
}*/


	
	
	

	pieceEaten(piece) {
		this.#runtime.callFunction("eatPiece",piece.index);
		this.clearPosition(piece.row, piece.col);		
	}
	pieceMoveToPosition(piece, moveToRow, moveToCol) {
		this.updatePiecePositionDict(piece, moveToRow, moveToCol);		
		const pieceY = this.#y - this.#height * moveToRow;        
        const pieceX = this.#x +  moveToCol * this.#width;
		this.#runtime.callFunction("movePiece", piece.index, pieceX, pieceY)
	}
	updatePiecePositionDict(piece, moveToRow, moveToCol) {
		this.clearPosition(piece.row, piece.col);
		this.#piecesPositionDict[this.getIndex(moveToRow, moveToCol)] = piece;
	}
	clearPosition(row, col) {
		this.#piecesPositionDict[this.getIndex(row, col)] = Board.PositionValues.Empty;
	}
	// Returns a piece based on its index.
	getPiece(pieceIndex) {
		if (pieceIndex < this.#player2.initalIndex) {
			return this.#player1.piecesDict[pieceIndex];
		}
		return this.#player2.piecesDict[pieceIndex];
	}



	getPieceBackgroundIndex(piece) {
		return this.getIndex(piece.row, piece.col);
	}

	// Shows a frame around the piece the player clicked.
	setMovingPieceFrame(showFrame) {
		this.setPieceFrame(this.#movingPiece, showFrame);
	}
	setPieceFrame(piece, showFrame) {
		this.#runtime.callFunction("setPieceFrame", this.getPieceBackgroundIndex(piece), showFrame);
	}
	
	highLightMoves(pieceIndex) {
	
	const piece = this.getPiece(pieceIndex);
	const moves = this.getMovesForPiece(piece);
	if(piece.player === this.#currentPlayer){
    
	
    for (let i = 0; i < moves.length; i++) {
	    const backgroundIndex = this.getIndex(moves[i].finishRow,moves[i].finishCol);
	    if(!this.isEatingMoveAvailable())
        this.#runtime.callFunction("HighLightMove", backgroundIndex);
		else if(moves[i].isEatingMove)
		this.#runtime.callFunction("HighLightMove", backgroundIndex);
		
		
    			
			}
	 //else{
	// const backgroundIndex = this.getIndex(this.isEatingMoveAvailable().finishRow,this.isEatingMoveAvailable().finishCol);
	 
	// this.#runtime.callFunction("HighLightMove", backgroundIndex);		}
		}
	}

    isEatingMoveAvailable(){ // herree!
	const pieces = this.#currentPlayer.pieces;
			for (let i = 0; i < pieces.length; i++) {
				const tempPiece = pieces[i];
				if (!tempPiece.isOnBoard) {					
					continue;
				}

				const pieceMoves = this.getMovesForPiece(tempPiece, false);
				for (let j = 0; j <pieceMoves.length; j++) {
					const tempMove = pieceMoves[j];
					if (tempMove.isEatingMove) {
						return true;
					}
				}
				
	}
	return false;
	}

	getMovesForPiece(piece) {
		
		let result = [];
		// The direction the piece is going to.
		const direction = piece.player.direction;
		result = result.concat(this.getNoEatingMoivesForPiece(piece));		
		// Build all eating moves.
		this.addEatingMoves(result, piece, direction);
		return result;
	}
	
	PieceHasMoves(piece) {
		
		let result = [];
		// The direction the piece is going to.
		const direction = piece.player.direction;
		if(!this.isEatingMoveAvailable())
			result = result.concat(this.getNoEatingMoivesForPiece(piece));		
		// Build all eating moves.
		this.addEatingMoves(result, piece, direction);
		if(result.length > 0 )
			return true;
		else return false
	}
	

	getNoEatingMoivesForPiece(piece) {
		let result = [];
		// The direction the piece is going to.
		const direction = piece.player.direction;
		
		// Check if right is open -		
		this.addToResultIfNotNull(result, this.checkNoEatingMove(piece, piece.row + direction, piece.col + 1));
		// Check if left is open
		this.addToResultIfNotNull(result, this.checkNoEatingMove(piece, piece.row + direction, piece.col - 1));

		if (piece.isKing) {
			// Check if right is open -		
		this.addToResultIfNotNull(result, this.checkNoEatingMove(piece, piece.row - direction, piece.col + 1));
		// Check if left is open
		this.addToResultIfNotNull(result, this.checkNoEatingMove(piece, piece.row - direction, piece.col - 1));
		}
		return result;
	}

	getEatingMovesForPiece(piece) {
		let result = [];
		// The direction the piece is going to.
		const direction = piece.player.direction;		
		// Build all eating moves.
		this.addEatingMoves(result, piece, direction);
		
		return result;
	}

	
	// Recursively adds all eating moves.
	addEatingMoves(result, piece, direction) {
		let eatMoves = [];
		// Check if right is open -		
		this.addToResultIfNotNull(eatMoves, this.checkEatingMove(piece, piece.row + 2* direction, piece.col + 2, piece.row + direction, piece.col +1));
		// Check if left is open
		this.addToResultIfNotNull(eatMoves, this.checkEatingMove(piece, piece.row + 2* direction, piece.col - 2, piece.row + direction, piece.col  -1));

		if (piece.isKing) {
			// Check if right is open -		
		this.addToResultIfNotNull(eatMoves, this.checkEatingMove(piece, piece.row - 2* direction, piece.col + 2, piece.row - direction, piece.col +1));
		// Check if left is open
		this.addToResultIfNotNull(eatMoves, this.checkEatingMove(piece, piece.row - 2* direction, piece.col - 2, piece.row - direction, piece.col  -1));
		}
		
		for (let i = 0; i < eatMoves.length; i++ ){
			result.push(eatMoves[i]);
		}			
	}
	checkEatingMove(piece, newRow, newCol, eatRow, eatCol) {
		// Verify position is legal.
		if (!this.isLegalPosition(newRow, newCol)) {			
			return null;			
		}
		// Verify final step is empty.
		if (this.#piecesPositionDict[this.getIndex(newRow, newCol)] !== Board.PositionValues.Empty) {
			return null;
		}
		// Verify in the middle its the opponent.
		if (this.#piecesPositionDict[this.getIndex(eatRow, eatCol)].player !== this.#nextPlayer) {
			return null;
		}

		return this.buildEatMove(piece, newRow, newCol, eatRow, eatCol);

	}

	checkNoEatingMove(piece, newRow, newCol) {		
		
		if (!this.isLegalPosition(newRow, newCol)) {			
			return null;
			
		}

		if (this.#piecesPositionDict[this.getIndex(newRow, newCol)] === Board.PositionValues.Empty) {
			return this.buildNoEatingMove(piece, newRow, newCol);		
		}
	}

	buildEatMove(piece, newRow, newCol, eatRow, eatCol) {
		let moveRows = [];
		moveRows.push(piece.row);
		moveRows.push(newRow);

		let moveCols = [];
		moveCols.push(piece.col);
		moveCols.push(newCol);

		// Check if its a promotion -
		let promotion = false;
		if (!piece.isKing) {
			if (newRow === piece.player.color.promoteRow) {
				promotion = true;
			}
		}

		let eatPieces = [];
		// get the eatan pieces -
		const eatPiece = this.#piecesPositionDict[this.getIndex(eatRow, eatCol)];
		eatPieces.push(eatPiece);

		return new Move(piece, moveRows, moveCols, eatPieces, promotion);		
	}
	buildNoEatingMove(piece, newRow, newCol) {
		let moveRows = [];
		moveRows.push(piece.row);
		moveRows.push(newRow);

		let moveCols = [];
		moveCols.push(piece.col);
		moveCols.push(newCol);

		// Check if its a promotion -
		let promotion = false;
		if (!piece.isKing) {
			if (newRow === piece.player.color.promoteRow) {
				promotion = true;
			}
		}

		return new Move(piece, moveRows, moveCols, [], promotion);
	}
	addToResultIfNotNull(result, move) {
		if (move != null) {
			result.push(move);
		}
	}
	
	drawBackground() {
		
		for (let i = 0; i < Board.GAME_ROWS; i++) {
			for (let j = 0; j < Board.GAME_COLS; j++) {
				const isEven = (((j + i) % 2) === 0);
				this.#runtime.callFunction("drawBackgroundItem",isEven, this.#x + this.#width*j, this.#y - this.#height*i, this.getIndex(i, j));
			}
		}
	}
	
	
	get noEatMovesToDraw() {
		return this.#noEatDraw;
	}
	drawPieces() {
		this.#player1.drawPieces(this.#runtime, this.#x, this.#y, this.#width, this.#height);
		this.#player2.drawPieces(this.#runtime, this.#x, this.#y, this.#width, this.#height);
	}

	
	isLegalPosition(row, col) {
		return (this.isLegalRow(row) && this.isLegalCol(col));
	}

	isLegalIndex(index) {
		return ((index >= 0) && (index <= Board.GAME_COLS * Board.GAME_ROWS));
	}

	isLegalRow(row) {
		return ((row >= 0) && (row < Board.GAME_ROWS));
	}

	isLegalCol(col) {
		return ((col >= 0) && (col < Board.GAME_COLS));
	}
	
	getRow(index) {
		return Math.floor(index / Board.GAME_COLS);
	}
	
	getCol(index) {
		return index % Board.GAME_COLS;
	}

    getIndex(row, col) {
        return row * Board.GAME_COLS + col;
    }
}

function waitForMillisecond(ms) { return new Promise(res => setTimeout(res, ms)); }


const scriptsInEvents = {

	async Gamees_Event27_Act2(runtime, localVars)
	{
		let board = new Board(runtime,runtime.globalVars.NoMoveDraw,runtime.globalVars.playingVsComputer, runtime.globalVars.level, true);
		runtime.globalVars.board = board;
	},

	async Gamees_Event64_Act2(runtime, localVars)
	{
		runtime.globalVars.board.swapTurns();
	},

	async Gamees_Event65_Act3(runtime, localVars)
	{
		runtime.globalVars.board.possibleMoves();
	},

	async Gamees_Event66_Act2(runtime, localVars)
	{
		runtime.globalVars.board.possibleMoves();
	},

	async Gamees_Event75_Act1(runtime, localVars)
	{
		runtime.globalVars.board.drawBackground();
	},

	async Gamees_Event76_Act1(runtime, localVars)
	{
		runtime.globalVars.board.setDrawing( localVars.x, localVars.y, localVars.width, localVars.height);
	},

	async Gamees_Event78_Act5(runtime, localVars)
	{
		// console.log("In drawpiece event sheet -" + localVars.x + ","+ localVars.y);
	},

	async Gamees_Event93_Act1(runtime, localVars)
	{
		runtime.globalVars.board.drawPieces();
	},

	async Gamees_Event97_Act1(runtime, localVars)
	{
		localVars.IsKing = runtime.globalVars.board.checkIfPieceIsKing(localVars.pieceIndex);
	},

	async Gamees_Event121_Act1(runtime, localVars)
	{
		localVars.IsKing = runtime.globalVars.board.checkIfPieceIsKing(localVars.movingPiece);
	},

	async Gamees_Event128_Act2(runtime, localVars)
	{
		runtime.globalVars.board.nextStepOfMove();
	},

	async Gamees_Event129_Act1(runtime, localVars)
	{
		runtime.globalVars.board.possibleMoves();
	},

	async Gamees_Event132_Act1(runtime, localVars)
	{
		runtime.globalVars.MovesPossible =  runtime.globalVars.board.PieceHasMoves(runtime.globalVars.board.getPiece(localVars.pieceIndex));
	},

	async Gamees_Event133_Act1(runtime, localVars)
	{
		runtime.globalVars.board.pieceTouched( localVars.pieceIndex);
	},

	async Gamees_Event133_Act2(runtime, localVars)
	{
		runtime.globalVars.board.highLightMoves( localVars.pieceIndex);
	},

	async Gamees_Event138_Act1(runtime, localVars)
	{
		runtime.globalVars.board.backgroundTouched(localVars.backgroundIndex);
	},

	async Gamees_Event185_Act3(runtime, localVars)
	{
		runtime.globalVars.board.initBoard();
	},

	async Gamees_Event185_Act6(runtime, localVars)
	{
		runtime.globalVars.board.startGame();
	},

	async Gamees_Event200_Act3(runtime, localVars)
	{
		runtime.globalVars.board.playComputerTurn();
	},

	async Gamees_Event210_Act1(runtime, localVars)
	{
		runtime.globalVars.board.possibleMoves();
	},

	async Gamees_Event225_Act1(runtime, localVars)
	{
		runtime.globalVars.board.makeRandomMove();
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

