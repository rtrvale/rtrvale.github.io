/* logic for computer opponent */
var baseEval = function(state){
    if (state.winner == "p") return -10000;
    if (state.winner == "b") return  10000;

    var purple_score = 0;
    for (let i=0; i<9; i++){
        for (let j=0; j<9; j++){
            if (state.board[i][j] == "p"){
                purple_score += -((8-j)**2) - 0.5*((8-i)**2); //(1 + (6-i)**2)*((i+1)**2+(j+1)**2)**0.5;
            }
        }
    }
    var brown_score = 0;
    var tboard = transpose(state.board);
    for (let i=0; i<9; i++){
        for (let j=0; j<9; j++){
            if (tboard[i][j] == "b"){
                brown_score += -((8-j)**2)- 0.5*((8-i)**2); //(1 + (6-i)**2)*((i+1)**2+(j+1)**2)**0.5;
            }
        }
    }
    return brown_score - purple_score;
}

var applyCandidate = function(state, candidate){
    // Apply a candidate move (list of dice values) to a deep copy of state.
    // Dice value d -> row (8-d) for purple, column (d-1) for brown.
    var stateCopy = JSON.parse(JSON.stringify(state));
    if (state.onMove == "purple"){
        for (let j=0; j < candidate.length; j++){
            stateCopy = update_row(stateCopy, 8 - candidate[j]);
        }
    } else {
        for (let j=0; j < candidate.length; j++){
            stateCopy = update_col(stateCopy, candidate[j] - 1);
        }
    }
    // Detect win/loss so baseEval can return the correct terminal score.
    stateCopy = checkVictory(stateCopy);
    return stateCopy;
}

var selectMoveUsingBaseEval = function(state, candidates){
    var scorelist = [];
    for (let i=0; i < candidates.length; i++){
        var stateCopy = applyCandidate(state, candidates[i]);
        scorelist.push(baseEval(stateCopy));
    }

    // purple minimises, brown maximises; start from first candidate as baseline
    var choice = 0;
    if (state.onMove == "purple"){
        for (let i=1; i < scorelist.length; i++){
            if (scorelist[i] < scorelist[choice]) choice = i;
        }
    } else {
        for (let i=1; i < scorelist.length; i++){
            if (scorelist[i] > scorelist[choice]) choice = i;
        }
    }
    return {move: candidates[choice], score: scorelist[choice]};
}

var evalAllMoves = function(state){
    /* Average best-response score over all possible dice rolls */
    var total_score = 0;
    for (let i=1; i<7; i++){
        for (let j=1; j<7; j++){
            for (let k=1; k<7; k++){
                var candidates = getLegalMoves([i,j,k]);
                total_score += selectMoveUsingBaseEval(state, candidates).score;
            }
        }
    }
    return total_score / 216;
}

var chooseMove = function(state){
    console.log('chooseMove called, onMove =', state.onMove);
    var candidates = getLegalMoves(state.roll);
    var scores = [];
    for (let i=0; i < candidates.length; i++){
        var stateCopy = applyCandidate(state, candidates[i]);
        stateCopy.onMove = (state.onMove == "purple") ? "brown" : "purple";
        scores.push(evalAllMoves(stateCopy));
    }

    // pick best score, starting from first candidate as baseline
    var choice = 0;
    if (state.onMove == "purple"){
        for (let i=1; i < scores.length; i++){
            if (scores[i] < scores[choice]) choice = i;
        }
    } else {
        for (let i=1; i < scores.length; i++){
            if (scores[i] > scores[choice]) choice = i;
        }
    }
    return candidates[choice];
}
