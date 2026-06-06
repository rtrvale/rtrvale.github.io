var move_animated = function(arr){
    var pushing = 0;
    var N = arr.length;
    var out = arr.slice();
    for (var i = 0; i < N; i++){
        out[i] = 0;
    }
    var movedFrom = new Array(N).fill(null);

    for (var i = 0; i < (N-1); i++){
        if (arr[i] == 1){
            pushing = 1;
            out[i+1] = 1;
            movedFrom[i+1] = i;
        }
        if ((arr[i] == 2) & pushing){
            out[i+1] = 2;
            movedFrom[i+1] = i;
        }
        if ((arr[i] == 2) & !pushing){
            out[i] = 2;
            movedFrom[i] = i;
        }
        if (arr[i] == 0){
            pushing = 0;
        }
    }
    if ((arr[N-1] == 1) & !pushing){
        out[N-1] = 0;
        pushing = 1;
    }
    if ((arr[N-1] == 2) & !pushing){
        out[N-1] = 2;
        movedFrom[N-1] = N-1;
    }
    var off = 0;
    var offFrom = null;
    if (pushing & ((arr[N-1] == 1) | (arr[N-1] == 2))){
        off = arr[N-1];
        offFrom = N-1;
    }
    return {out: out, off: off, offFrom: offFrom, movedFrom: movedFrom};
};

// Returns updated state plus a moves array: [{fromRow, fromCol, toRow, toCol}]
// and offPiece: {row, col, type} or null
var update_row_animated = function(state, rownum){
    var board = state.board;
    var row = board[rownum].slice();
    var N = row.length;
    var a = new Array();
    for (var i = row.length-1; i >= 0; i--){
        if (row[i] == "p"){
            a.push(1);
        } else if (row[i] == "b"){
            a.push(2);
        } else {
            a.push(0);
        }
    }

    var m = move_animated(a);
    var a_new = m.out;
    var off = m.off;
    var offFrom = m.offFrom;
    var movedFrom = m.movedFrom;

    if (off != 0){
        state.pushedOff[rownum] += (off == 1) ? "p" : "b";
    }

    // convert movedFrom (encoded indices) to board column moves
    // encoded index enc -> board column (N-1-enc)
    var moves = [];
    for (var enc_j = 0; enc_j < N; enc_j++){
        var enc_i = movedFrom[enc_j];
        if (enc_i === null) continue;
        if (enc_i === enc_j) continue; // didn't move
        moves.push({
            fromRow: rownum,
            fromCol: N-1-enc_i,
            toRow:   rownum,
            toCol:   N-1-enc_j
        });
    }

    // piece pushed off: encoded index offFrom -> board column (N-1-offFrom)
    var offPiece = null;
    if (offFrom !== null){
        offPiece = {
            row:  rownum,
            col:  N-1-offFrom,
            type: (off == 1) ? "p" : "b"
        };
    }

    // build new row
    var row_new = new Array();
    for (var i = a_new.length-1; i >= 0; i--){
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

    return {state: state, moves: moves, offPiece: offPiece};
};

// Returns updated state plus moves and offPiece, same structure as update_row_animated
var update_col_animated = function(state, colnum){
    var board = state.board;
    var tboard = transpose(board);
    var row = tboard[colnum].slice();
    var N = row.length;
    var a = new Array();
    for (var i = row.length-1; i >= 0; i--){
        if (row[i] == "p"){
            a.push(2);
        } else if (row[i] == "b"){
            a.push(1);
        } else {
            a.push(0);
        }
    }

    var m = move_animated(a);
    var a_new = m.out;
    var off = m.off;
    var offFrom = m.offFrom;
    var movedFrom = m.movedFrom;

    if (off != 0){
        state.pushedOff[colnum] += (off == 1) ? "b" : "p";
    }

    // encoded index enc -> board row (N-1-enc)
    var moves = [];
    for (var enc_j = 0; enc_j < N; enc_j++){
        var enc_i = movedFrom[enc_j];
        if (enc_i === null) continue;
        if (enc_i === enc_j) continue;
        moves.push({
            fromRow: N-1-enc_i,
            fromCol: colnum,
            toRow:   N-1-enc_j,
            toCol:   colnum
        });
    }

    var offPiece = null;
    if (offFrom !== null){
        offPiece = {
            row:  N-1-offFrom,
            col:  colnum,
            type: (off == 1) ? "b" : "p"
        };
    }

    var row_new = new Array();
    for (var i = a_new.length-1; i >= 0; i--){
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

    return {state: state, moves: moves, offPiece: offPiece};
};

var ANIM_DURATION = 300; // ms

// Animates a single board step.
// Must be called AFTER drawBoard so pieces are already at their new positions.
// moves: [{fromRow, fromCol, toRow, toCol}]
// offPiece: {row, col, type} or null
// direction: 'left' for row updates, 'up' for column updates
// callback: called when animation completes
var makePieceOverlay = function(content, rect){
    var overlay = document.createElement('div');
    overlay.innerHTML            = content;
    overlay.style.position       = 'fixed';
    overlay.style.left           = rect.left   + 'px';
    overlay.style.top            = rect.top    + 'px';
    overlay.style.width          = rect.width  + 'px';
    overlay.style.height         = rect.height + 'px';
    overlay.style.margin         = '0';
    overlay.style.display        = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems     = 'center';
    overlay.style.fontFamily     = 'sans-serif';
    overlay.style.fontWeight     = 'bold';
    overlay.style.zIndex         = '1000';
    overlay.style.pointerEvents  = 'none';
    return overlay;
};

var animateStep = function(moves, offPiece, direction, callback){
    console.log('animateStep: ' + moves.length + ' moves, direction=' + direction);
    moves.forEach(function(move){
        var fromCell = document.getElementById(String(move.fromRow+1) + ":" + String(move.fromCol+1));
        var toCell   = document.getElementById(String(move.toRow+1)   + ":" + String(move.toCol+1));

        var fromRect = fromCell.getBoundingClientRect();
        var toRect   = toCell.getBoundingClientRect();

        var pieceContent = toCell.innerHTML;
        if (!pieceContent) return;

        var dx = fromRect.left - toRect.left;
        var dy = fromRect.top  - toRect.top;
        console.log('animating piece "' + pieceContent + '" dx=' + dx + ' dy=' + dy);

        // hide the piece in the destination cell while overlay animates over it
        toCell.style.fontSize = '0';

        // overlay starts at from-position, slides to to-position
        var overlay = makePieceOverlay(pieceContent, toRect);
        overlay.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
        document.body.appendChild(overlay);

        requestAnimationFrame(function(){
            requestAnimationFrame(function(){
                overlay.style.transition = 'transform ' + ANIM_DURATION + 'ms ease';
                overlay.style.transform  = '';
            });
        });

        setTimeout(function(){
            document.body.removeChild(overlay);
            toCell.style.fontSize = '';
        }, ANIM_DURATION + 50);
    });

    if (offPiece !== null){
        var offCell = document.getElementById(String(offPiece.row+1) + ":" + String(offPiece.col+1));
        var offRect = offCell.getBoundingClientRect();

        var exitDx = (direction === 'left') ? -offRect.width  : 0;
        var exitDy = (direction === 'up')   ? -offRect.height : 0;

        var overlay = makePieceOverlay(offPiece.type, offRect);
        document.body.appendChild(overlay);

        requestAnimationFrame(function(){
            requestAnimationFrame(function(){
                overlay.style.transition = 'transform ' + ANIM_DURATION + 'ms ease';
                overlay.style.transform  = 'translate(' + exitDx + 'px, ' + exitDy + 'px)';
            });
        });

        setTimeout(function(){ document.body.removeChild(overlay); }, ANIM_DURATION + 50);
    }

    setTimeout(callback || function(){}, ANIM_DURATION + 50);
};

// Plays an array of steps in sequence, calling drawBoard before each one.
// steps: [{state, moves, offPiece, direction}]
// onComplete: called after the last step finishes
var animateSteps = function(steps, index, onComplete){
    if (index >= steps.length){
        if (onComplete) onComplete();
        return;
    }
    var step = steps[index];
    drawBoard(step.state);
    animateStep(step.moves, step.offPiece, step.direction, function(){
        animateSteps(steps, index + 1, onComplete);
    });
};
