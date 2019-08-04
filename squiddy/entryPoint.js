// before play begins, load the high score table
var sortFn = function(x, y){
   var x = (x.score);
   var y = (y.score);   
   if (y == undefined){
      return -1
   }
   if (x == undefined){
      return 1
	}
   x = +(x);
   y = +(y);
   if (x===y){
      return 0;
   }
   if (x > y){
      return -1;
   }
   if (x < y){
     return 1;
   }
};

var HS = {};
var db = new restdb("5d456d0d58a35b31adeba395");
var query = {}; // all
var hint = {}; // first 10 only
var x = db.highscoretable.find(query, hint, function(err, scores){
    HS=scores;
	HS.sort(sortFn);
	console.log(HS);
});



var TIMER = setInterval(mainLoop, 20);