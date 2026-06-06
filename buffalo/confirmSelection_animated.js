// Drop-in replacement for confirmSelection in interaction.js.
// Requires animation.js to be loaded first.

// Returns true if moving rownum one step would push a "b" piece off the board.
var rowWouldPushOffB = function(board, rownum){
    var row = board[rownum];
    var a = [];
    for (var k = row.length-1; k >= 0; k--){
        if (row[k] == "p") a.push(1);
        else if (row[k] == "b") a.push(2);
        else a.push(0);
    }
    return move_animated(a).off === 2;
};

// Returns true if moving colnum one step would push a "p" piece off the board.
var colWouldPushOffP = function(board, colnum){
    var tboard = transpose(board);
    var col = tboard[colnum];
    var a = [];
    for (var k = col.length-1; k >= 0; k--){
        if (col[k] == "p") a.push(2);
        else if (col[k] == "b") a.push(1);
        else a.push(0);
    }
    return move_animated(a).off === 2;
};

// Builds a sorted steps array for row moves, push-off rows first.
var buildRowSteps = function(state, selectionArray){
    var entries = [];
    for (var i = 1; i < 9; i++){
        if (selectionArray[i] > 0)
            entries.push({rownum: 8-i, count: selectionArray[i]});
    }
    entries.sort(function(a, b){
        return (rowWouldPushOffB(state.board, b.rownum) ? 1 : 0)
             - (rowWouldPushOffB(state.board, a.rownum) ? 1 : 0);
    });
    var steps = [];
    for (var k = 0; k < entries.length; k++){
        for (var t = 0; t < entries[k].count; t++){
            var result = update_row_animated(state, entries[k].rownum);
            state = result.state;
            steps.push({state: {board: state.board}, moves: result.moves,
                        offPiece: result.offPiece, direction: 'left'});
        }
    }
    return {state: state, steps: steps};
};

// Builds a sorted steps array for col moves, push-off cols first.
var buildColSteps = function(state, selectionArray){
    var entries = [];
    for (var i = 1; i < 9; i++){
        if (selectionArray[i] > 0)
            entries.push({colnum: i-1, count: selectionArray[i]});
    }
    entries.sort(function(a, b){
        return (colWouldPushOffP(state.board, b.colnum) ? 1 : 0)
             - (colWouldPushOffP(state.board, a.colnum) ? 1 : 0);
    });
    var steps = [];
    for (var k = 0; k < entries.length; k++){
        for (var t = 0; t < entries[k].count; t++){
            var result = update_col_animated(state, entries[k].colnum);
            state = result.state;
            steps.push({state: {board: state.board}, moves: result.moves,
                        offPiece: result.offPiece, direction: 'up'});
        }
    }
    return {state: state, steps: steps};
};

// Extracted helper: everything that runs after all board updates are done.
var confirmSelectionComplete = function(state){
    state.winner = checkVictory(state).winner;

    if (state.winner != ""){
        document.getElementById("winner").innerHTML = ((state.winner == "p") ? "Purple" : "Brown") + " wins!";
        document.getElementById("winner").innerHTML +=  ((state.winner == state.player[0]) ? " Well done!" : " Unlucky!");
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
                cell.style.backgroundColor = "";
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
        document.getElementById("roll-result").innerHTML = "";

        // change onMove
        state.onMove = (state.onMove == "purple") ? "brown" : "purple";
    }
    state.roll = []; // prevent selections until next roll
};

// Extracted helper: everything that runs after confirmOpponentTurn's board updates.
var confirmOpponentTurnComplete = function(state){
    state.winner = checkVictory(state).winner;

    if (state.winner != ""){
        document.getElementById("winner").innerHTML = ((state.winner == "p") ? "Purple" : "Brown") + " wins!";
        document.getElementById("winner").innerHTML +=  ((state.winner == state.player[0]) ? " Well done!" : " Unlucky!");
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
                cell.style.backgroundColor = "";
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

        document.getElementById("opponent-turn-description").innerHTML = "";

        // change onMove
        state.onMove = (state.onMove == "purple") ? "brown" : "purple";
    }
    state.roll = []; // prevent selections until next roll
};

var confirmOpponentTurn = function(state){
    document.getElementById("confirm-button").disabled = true;
    document.getElementById("roll-button").disabled = false;

    var built;
    if (state.player == "purple"){
        // opponent (brown) moves columns — push-off cols (those that push off "p") first
        built = buildColSteps(state, state.colSelection);
    } else {
        // opponent (purple) moves rows — push-off rows (those that push off "b") first
        built = buildRowSteps(state, state.rowSelection);
    }
    state = built.state;
    animateSteps(built.steps, 0, function(){
        confirmOpponentTurnComplete(state);
    });
};

var confirmSelection = function(state){
    document.getElementById("confirm-button").disabled = true;
    document.getElementById("roll-button").disabled = false;

    var built;
    if (state.player == "purple"){
        // purple moves rows — push-off rows (those that push off "b") first
        built = buildRowSteps(state, state.rowSelection);
    } else {
        // brown moves columns — push-off cols (those that push off "p") first
        built = buildColSteps(state, state.colSelection);
    }
    state = built.state;
    animateSteps(built.steps, 0, function(){
        confirmSelectionComplete(state);
    });

    return state;
};
