// global
//var pushedOff = ["","","","","","","",""];

var move = function(arr){
    // this function takes an array containing 0, 1, 2 as entries
    // it moves each 1 by 1 step, pushing other symbols in front of it
    var pushing = 0;
    var N = arr.length;
    // fill output with zeroes
    var out = arr.slice();
    for (var i = 0; i < N; i++){
        out[i] = 0;
    }
    for (var i = 0; i < (N-1); i++){
        if (arr[i] == 1){
            pushing = 1;
            out[i+1] = 1;
        }        
        if ((arr[i] == 2) & pushing){
            out[i+1] = 2;
        }
        if ((arr[i] == 2) & !pushing){
            out[i] = 2;
        }
        if (arr[i] == 0){
            pushing = 0;
        }
    }
    if ((arr[N-1] == 1) & !pushing){
        // if pushing is true then arr[N-1] was already set
        out[N-1] = 0;
        pushing = 1;
    }
    if ((arr[N-1] == 2) & !pushing){
        out[N-1] = 2;
    }
    var off = 0;
    if (pushing & ((arr[N-1] == 1) | (arr[N-1] == 2))){
        off = arr[N-1];
    } // off is one of 0, 1, 2
    return {'out' : out, 'off' : off};
};

var update_row = function(state, rownum){
    // board will be a 9 x 9 array of entries, so an array of arrays defined row-wise
    var board = state.board;
    var row = board[rownum].slice();
    var a = new Array();
    for (var i=row.length-1; i>=0; i--){
        if (row[i] == "p"){
            a.push(1);
        } else if (row[i] == "b"){
            a.push(2);
        } else {
            a.push(0);
        }
    }
    console.log(a);
    var m = move(a);
    var a_new = m.out;
    var off = m.off;
    if (off != 0){
        state.pushedOff[rownum] += (off == 1) ? "p" : "b";
    }
    console.log(a_new);
    var row_new = new Array();
        for (var i=a_new.length-1; i>=0; i--){
        if (a_new[i] == 1){
            row_new.push("p");
        } else if (a_new[i] == 2){
            row_new.push("b");
        } else {
            row_new.push("");
        }
    }
    var out = board.slice();
    out[rownum] = row_new;
    state.board = out;
    return state;
};

var transpose = function(board){
    var out = new Array();
    for (var i=0; i<board.length; i++){
        var row = new Array();
        for (var j=0; j<board.length; j++){
            row.push(board[j][i]);
        }
        out.push(row);
    }
    return out ;
};

var update_col = function(state, colnum){
    // board will be a 9 x 9 array of entries, so an array of arrays defined row-wise
    var board = state.board;
    var tboard = transpose(board);
    var row = tboard[colnum].slice();
    var a = new Array();
    for (var i=row.length-1; i>=0; i--){
        if (row[i] == "p"){
            a.push(2);
        } else if (row[i] == "b"){
            a.push(1);
        } else {
            a.push(0);
        }
    }
    console.log(a);
    var m = move(a);
    var a_new = m.out;
    var off = m.off;
    if (off != 0){
        state.pushedOff[colnum] += (off == 1) ? "b" : "p";
    }
    console.log(a_new);
    var row_new = new Array();
        for (var i=a_new.length-1; i>=0; i--){
        if (a_new[i] == 1){
            row_new.push("b");
        } else if (a_new[i] == 2){
            row_new.push("p");
        } else {
            row_new.push("");
        }
    }
    tboard[colnum] = row_new;
    state.board = transpose(tboard);
    return state;
}

var print_board = function(board){
    for (var i=0; i < board.length; i++){
        var str = "";
        for (var j=0; j < board.length; j++){
            str += (board[i][j] == "") ? "x" : board[i][j];
        }
        console.log(str + "\n");
    }
}

var init_board = function(){
    var board = new Array();
    for (var i=0; i < 8; i++){
        var row = new Array();
        for (var j=0; j < 8; j++){
            row.push("");
        }
        row.push("p");
        board.push(row);
    }
    var row = new Array();
    for (var j=0; j < 8; j++){
        row.push("b");
    }   
    row.push("");
    board.push(row);
    return board; 
}

var rollDice = function(){
    var res = new Array();
    for (var i=0; i < 3; i++){
        res.push(1 + Math.floor(Math.random() * 6));
    }
    res.sort();
    return res;
}

var getLegalMoves = function(res){
    // res = result of rolling three dice, sorted in order
    var out = new Array();
    out.push(res);
    if (res[0] + res[1] <= 8){
        out.push([res[0] + res[1], res[2]]);
    }
    if (res[0] + res[2] <= 8){
        out.push([res[0] + res[2], res[1]]);
    }
    if (res[1] + res[2] <= 8){
        out.push([res[1] + res[2], res[0]]);
    }
    if (res[0] + res[1] + res[2] <= 8){
        out.push([res[0] + res[1] + res[2]]);
    }
    var uniqueArray = Array.from(
        new Set(out.map(item => JSON.stringify(item))),
        JSON.parse
    );
    for (var i=0; i < uniqueArray.length; i++){
        uniqueArray[i].sort();
    }
    return uniqueArray;
}
