// global variables
const SHADE = "#dddddd"; 
const CELL_COLOUR = "#e8d5b7";

// global
var state = { // object describing the game state
    rowSelection : [0,0,0,0,0,0,0,0,0], // selected rows
    colSelection : [0,0,0,0,0,0,0,0,0], // selected columns
    roll : [], // current roll (can be for player or opponent)
    board : init_board(), // board state
    player : "purple", // which colour the player is
    onMove : "brown", // whose move it is
    pushedOff : ["","","","","","","",""], // which pieces have been pushed off
    winner : ""
}

document.getElementById("roll-button").onclick = function(){processRoll(state);};
document.getElementById("confirm-button").onclick = function(){confirmSelection(state);};
document.getElementById("opponent-turn").onclick = function(){handleOpponentTurn(state);};
document.getElementById("confirm-opponent-turn").onclick = function(){confirmOpponentTurn(state);};


var drawBoard = function(state){
    for (var i=1; i<10; i++){
        for (var j=1; j<10; j++){
            var cell = document.getElementById(String(i) + ":" + String(j));
            cell.innerHTML = state.board[i-1][j-1];
        }
    }
}

// draw initial board
drawBoard(state);

var checkSelectionValid = function(selection, roll){
    /* check whether the current selection of rows/columns is one of the valid
    selections defined by the current roll 
    
    selection : one of rowSelection or columnSelection
    roll : a roll of three dice
    */
    var s = "";
    for (var i=1; i<9; i++){
        for (var t=0; t < selection[i]; t++){
            s += String(i);
        }
    }
    // s is a string with selected columns in order
    out = false;
    legalMoves = getLegalMoves(roll);
    for (var i=0; i<legalMoves.length; i++){
        q = "";
        for (var t=0; t < legalMoves[i].length; t++){
            q += String(legalMoves[i][t]);
        }
        console.log(q)
        if (s == q) out = true;
    }
    return out;
}

var select_row = function(i){
    // do nothing if in between games
    if (state.roll.length == 0) return false;
    
    console.log("select_row called with argument")
    console.log(i)
    var counter = document.getElementById(String(9-i) + ":0");
    if (state.rowSelection[i] >= 3){
        counter.innerHTML = "";
        for (var j=1; j < 9; j++){
            document.getElementById(String(9-i) + ":" + String(j)).style.backgroundColor = CELL_COLOUR;
            state.rowSelection[i] = 0;
        }
    } else {
        state.rowSelection[i] += 1;
        counter.innerHTML = String(state.rowSelection[i]) + "x";
        for (var j=1; j < 9; j++){
            document.getElementById(String(9-i) + ":" + String(j)).style.backgroundColor = SHADE;
        }
    }
    if (checkSelectionValid(state.rowSelection, state.roll)){
        document.getElementById("confirm-button").disabled = false;
    } else {
        // if you click too many times, button should be disabled
        document.getElementById("confirm-button").disabled = true;
    }
};

var select_col = function(j){
    // do nothing if in between games
    if (state.roll.length == 0) return false;
        
    var counter = document.getElementById("0:" + String(j));
    if (state.colSelection[j] >= 3){
        counter.innerHTML = "";
        for (var i=1; i < 9; i++){
            document.getElementById(String(i) + ":" + String(j)).style.backgroundColor = CELL_COLOUR;
        }    
        state.colSelection[j] = 0;
    } else {
        state.colSelection[j] += 1;
        counter.innerHTML = String(state.colSelection[j]) + "x";
        for (var i=1; i < 9; i++){
            document.getElementById(String(i) + ":" + String(j)).style.backgroundColor = SHADE;
        }
    }
    if (checkSelectionValid(state.colSelection, state.roll)){
        document.getElementById("confirm-button").disabled = false;
    } else {
        document.getElementById("confirm-button").disabled = true;
    }
};

// add code for clicking buttons to roll dice and confirm selection
var processRoll = function(state){
    var r = rollDice();
    state.roll = r;

    document.getElementById("roll-result").innerHTML = r;
    document.getElementById("roll-button").disabled = true; // disable until confirm
    document.getElementById("confirm-button").disabled = true; 

    return state;
};

var confirmSelection = function(state){
    document.getElementById("confirm-button").disabled = true;
    document.getElementById("roll-button").disabled = false; 

    if (state.player == "purple"){
        // update board
        for (let i=1; i<9; i++){
            for (let t=0; t < state.rowSelection[i]; t++){
                state = update_row(state, 8-i);
                console.log(state.board);
                print_board(state.board);
            }
        }
        // check for win or loss
    } else {
        // update board
        for (var j=1; j<9; j++){
            for (var t=0; t < state.colSelection[j]; t++){
                state = update_col(state, j-1);
            }
        }
        // check for win or loss        
    }

    state.winner = checkVictory(state).winner;

    if (state.winner != ""){
        document.getElementById("winner").innerHTML = ((state.winner == "p") ? "Purple" : "Brown") + " wins!";
        resetGameState();
    } else {

        // reset selections
        for (let i=0; i<9; i++){
            state.rowSelection[i] = 0;
            state.colSelection[i] = 0;
        }
        // reset cell colours and selection multiplicity indicators
        for (let i=1; i < 9; i++){
            for (let j=1; j < 9; j++){
                var cell = document.getElementById(String(i) + ":" + String(j));
                cell.style.backgroundColor = CELL_COLOUR;
            }
            var cell = document.getElementById(String(i) + ":0");
            cell.innerHTML = "";
            var cell = document.getElementById("0:" + String(i));
            cell.innerHTML = "";
        }
        
        // draw board
        drawBoard(state);

        // do opponent's turn
        document.getElementById("roll-button").disabled = true;
        document.getElementById("confirm-button").disabled = true;
        document.getElementById("opponent-turn").disabled = false;

        // change onMove
        state.onMove = (state.onMove == "purple") ? "brown" : "purple";

    }

    return state;
};

var handleOpponentTurn = function(state){
    var opponentRoll = rollDice();
    document.getElementById("opponent-turn-description").innerHTML = "Opponent rolls " + opponentRoll;

    state.roll = opponentRoll;

    // select columns or rows in which opponent moves
    var opponentMove = chooseMove(state);
    if (state.player == "purple"){
        for (let i=0; i < opponentMove.length; i++){
            select_col(opponentMove[i]);
        }
    } else {
        for (let i=0; i < opponentMove.length; i++){
            select_row(opponentMove[i]);
        }       
    }
    document.getElementById("roll-button").disabled = true;
    document.getElementById("confirm-button").disabled = true;
    document.getElementById("opponent-turn").disabled = true;
    document.getElementById("confirm-opponent-turn").disabled = false;
}

var confirmOpponentTurn = function(state){
    document.getElementById("confirm-button").disabled = true;
    document.getElementById("roll-button").disabled = false; 

    if (state.player == "purple"){
        // update board
        for (let i=1; i<9; i++){
            for (let t=0; t < state.colSelection[i]; t++){
                state = update_col(state, i-1);
                console.log(state.board);
                print_board(state.board);
            }
        }
    } else {
        // update board
        for (var j=1; j<9; j++){
            for (var t=0; t < state.rowSelection[j]; t++){
                state = update_row(state, 8-j);
            }
        }
        // check for win or loss   
        // the check needs to come before the board is updated     
    }

    
    // draw board
    drawBoard(state);

    state.winner = checkVictory(state).winner;

    if (state.winner != ""){
        document.getElementById("winner").innerHTML = ((state.winner == "p") ? "Purple" : "Brown") + " wins!";
        resetGameState();
    } else {

        // reset selections
        // this needs to be done after it is confirmed whether the game ended
        for (let i=0; i<9; i++){
            state.rowSelection[i] = 0;
            state.colSelection[i] = 0;
        }
        // reset cell colours and selection multiplicity indicators
        for (let i=1; i < 9; i++){
            for (let j=1; j < 9; j++){
                var cell = document.getElementById(String(i) + ":" + String(j));
                cell.style.backgroundColor = CELL_COLOUR;
            }
            var cell = document.getElementById(String(i) + ":0");
            cell.innerHTML = "";
            var cell = document.getElementById("0:" + String(i));
            cell.innerHTML = "";
        }

        // reset buttons
        document.getElementById("opponent-turn").disabled = true;
        document.getElementById("roll-button").disabled = false;
        document.getElementById("confirm-button").disabled = true;
        document.getElementById("confirm-opponent-turn").disabled = true;

        // change onMove
        state.onMove = (state.onMove == "purple") ? "brown" : "purple";

    }
}

var checkVictory = function(state){
    /* uses the pushedOff array and identity of current player
    to check whether current player won or lost */
    var winner = state.winner;
    var onMove = state.onMove;
    var pushedOff = state.pushedOff;

    if (onMove == "purple"){
        for (var i=0; i<8; i++){
            if (pushedOff[i].length > 0){
                if (pushedOff[i][0] == "b"){
                    winner = "p";
                }
            }
        }
        if (winner == ""){
            for (var i=0; i<8; i++){
                if (pushedOff[i].length > 0){
                    if (pushedOff[i][0] == "p"){
                        winner = "b";
                    }
                }
            }
        }
    } else if (onMove == "brown"){
        for (var i=0; i<8; i++){
            if (pushedOff[i].length > 0){
                if (pushedOff[i][0] == "p"){
                    winner = "b";
                }
            }
        }
        if (winner == ""){
            for (var i=0; i<8; i++){
                if (pushedOff[i].length > 0){
                    if (pushedOff[i][0] == "b"){
                        winner = "p";
                    }
                }
            }
        }
    }

    state.winner = winner;
    return state;
}

var resetGameState = function(){
    document.getElementById("roll-button").disabled = true;
    document.getElementById("confirm-button").disabled = true;
    document.getElementById("opponent-turn").disabled = true;
    document.getElementById("confirm-opponent-turn").disabled = true;
    document.getElementById("start-new-game-brown").disabled = false;
    document.getElementById("start-new-game-purple").disabled = false;
    //document.getElementById("winner").innerHTML = "";
    document.getElementById("roll-result").innerHTML = "";
}

var startNewGameAsPurple = function(){
    state.rowSelection = [0,0,0,0,0,0,0,0,0]; //these have length 9
    state.colSelection = [0,0,0,0,0,0,0,0,0];
    state.roll = []; //current player dice roll
    state.pushedOff = ["","","","","","","",""];
    state.onMove = "brown";
    state.player = "purple";
    state.board = init_board();
    state.winner = "";

    drawBoard(state);

    document.getElementById("roll-result").innerHTML = "";
    document.getElementById("opponent-turn-description").innerHTML = "";
    document.getElementById("winner").innerHTML = "";

    document.getElementById("roll-button").disabled = true;
    document.getElementById("confirm-button").disabled = true;
    document.getElementById("opponent-turn").disabled = false;
    document.getElementById("confirm-opponent-turn").disabled = true;
    document.getElementById("start-new-game-brown").disabled = true;
    document.getElementById("start-new-game-purple").disabled = true;

    for (let i=1; i < 9; i++){
        for (let j=1; j < 9; j++){
            var cell = document.getElementById(String(i) + ":" + String(j));
            if (state.player == "purple"){
                cell.onclick = function(){select_row(9-i);};
            } else {
                cell.onclick = function(){select_col(j);};
            }
            cell.style.backgroundColor = CELL_COLOUR;
        }
        document.getElementById("0:" + String(i)).innerHTML = "";
        document.getElementById(String(i) + ":0").innerHTML = "";
    }
    for (let i=1; i < 9; i++){
        var cell = document.getElementById(String(i) + ":0");
        cell.innerHTML = "";
    }
}

var startNewGameAsBrown = function(){
    state.rowSelection = [0,0,0,0,0,0,0,0,0]; //these have length 9
    state.colSelection = [0,0,0,0,0,0,0,0,0];
    state.roll = []; //current player dice roll
    state.pushedOff = ["","","","","","","",""];
    state.onMove = "brown";
    state.player = "brown";
    state.board = init_board();
    state.winner = "";

    drawBoard(state);

    document.getElementById("roll-result").innerHTML = "";
    document.getElementById("opponent-turn-description").innerHTML = "";
    document.getElementById("winner").innerHTML = "";

    document.getElementById("roll-button").disabled = false;
    document.getElementById("confirm-button").disabled = true;
    document.getElementById("opponent-turn").disabled = true;
    document.getElementById("confirm-opponent-turn").disabled = true;
    document.getElementById("start-new-game-brown").disabled = true;
    document.getElementById("start-new-game-purple").disabled = true;

    for (let i=1; i < 9; i++){
        for (let j=1; j < 9; j++){
            var cell = document.getElementById(String(i) + ":" + String(j));
            if (state.player == "purple"){
                cell.onclick = function(){select_row(9-i);};
            } else {
                cell.onclick = function(){select_col(j);};
            }
            cell.style.backgroundColor = CELL_COLOUR;
        }
        document.getElementById("0:" + String(i)).innerHTML = "";
        document.getElementById(String(i) + ":0").innerHTML = "";
    }
    for (let i=1; i < 9; i++){
        var cell = document.getElementById(String(i) + ":0");
        cell.innerHTML = "";
    }
}