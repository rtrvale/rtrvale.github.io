// recording key presses
var KEYSDOWN = []; 
document.onkeydown = function(e){
  KEYSDOWN[e.keyCode] = true;
  //console.log(e.keyCode);
}
document.onkeyup = function(e){
  KEYSDOWN[e.keyCode] = false;
  //console.log(e.keyCode);
}

// trying to get rid of antialiasing
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

var enemies = [];
var enemySpawnRate = 0.02;
var enemyMaxSize = canvas.height/2;

var score = 0;
var GROWTH_FACTOR = 0.01;
var GULP_FRAMES = 0;
var PLAYER_SPRITE_LEFT = new Image();
PLAYER_SPRITE_LEFT.src = "squid3.bmp";
var PLAYER_SPRITE_RIGHT = new Image();
PLAYER_SPRITE_RIGHT.src = "squid4.bmp";
var PLAYER_SPRITE_5 = new Image();
PLAYER_SPRITE_5.src = "squid5.bmp";
var PLAYER_SPRITE_6 = new Image();
PLAYER_SPRITE_6.src = "squid6.bmp";
var ENEMY_SPRITE_LEFT = new Image();
ENEMY_SPRITE_LEFT.src = "bluesquid1.png";
var ENEMY_SPRITE_RIGHT = new Image();
ENEMY_SPRITE_RIGHT.src = "bluesquid2.png";

var GAME_STATE = "title";

// rendering loop
var renderCanvas = function(){
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	player.move();
	player.draw();
	
	GULP_FRAMES -= 1;
	if (GULP_FRAMES === 0) player.colour = "black";
	
	for (i=0; i < enemies.length; i++){
		enemies[i].update();
		enemies[i].draw();
		if (detectPlayerAte(player, enemies[i])){
			enemies[i].remove = true;
			eat(player, enemies[i], GROWTH_FACTOR);
			player.colour = "orange";
			GULP_FRAMES = 5;
			console.log("ate");
			//console.log(score);
			//cleanUpEnemies();
		} else if (detectPlayerGotEaten(player, enemies[i])){
			console.log("eaten");
			endGame("eaten");
		}
	}
	
	cleanUpEnemies();
	
	if (Math.random() < enemySpawnRate){
		addEnemy();
	}
	//console.log(enemies.length);
};

var drawTitleScreen = function(){
	var block = document.getElementById("text-canvas");
	block.style.display = "inline-block";
	block.style.border = "";//"1px solid black";
	block.style.height = "300px";
	block.style.width = "500px";
	canvas.style.display = "none";
	block.innerHTML = "<h1>";//"<h1>SQUIDDY</h1>";
	var str = "SQUIDDY";
	for (i=0; i < str.length; i++){
		block.innerHTML += "<div style=\'color: " + (i % 2 == 0 ? "blue" : "red") + "; display: inline;" +
		"font-size : 30px;\'>" + str[i] + "</div>";
	}
	block.innerHTML += "</h1><br><br>";
	block.innerHTML += "Eat as much as you can without being eaten.";
	block.innerHTML += " Use arrow keys to move and space for jet propulsion.";
	block.innerHTML += " Bonus points are to be had for daring moves!";
	block.innerHTML += " Can you make it into the Hall of Legends?";	
	block.innerHTML += "<br><br>Press space to begin!";	
};

var endGame = function(condition){
	for (i=0; i < KEYSDOWN.length; i++) KEYSDOWN[i] = false;
	
	var block = document.getElementById("text-canvas");
	block.style.display = "inline-block";
	block.style.border = "";//"1px solid black";
	block.style.height = "300px";
	block.style.width = "500px";
	if (condition === "eaten"){
	   block.innerHTML = "Oh no! You were eaten! Your final score is " + score;
	} else {
	   block.innerHTML = "You ate everything!! Your final score is " + score;		
	}
	canvas.style.display = "none";
	document.getElementById("score-box").innerHTML="&nbsp;";
	block.innerHTML += "<br>Refresh page to restart";
	GAME_STATE = "over";
    var scores = [];
    for (i=0; i < HS.length; i++){
       scores.push(HS[i].score);
    }
    scores.sort((a,b) => b-a);
    console.log(scores);
    //var name = document.getElementById("name").value;
    if (scores.length >= 10){
	    var minScore = +(scores[9]);
     } else {
	     minScore = -1;
     }
     console.log(minScore);
     if (+(score) > minScore){
        block.innerHTML +="<br><br>You have earned a place in the Hall of Legends!" +
		"<br><br>Please type your name and then click the Submit button" +
		"<input type=\'text\' id=\'name\' maxlength=\'18\'></input><button id=\'submit' onclick=\'addScore();\'>Submit</button>" +
		"<div id=\'table\'></div>";
	        timer = setInterval(function(){if (KEYSDOWN[13]){addScore();}}, 20);
	 } else {
		 block.innerHTML += "<div id=\'table\'></div>";
		 printHallofFame(HS);
	 }
};

var restart = function(){
	if (KEYSDOWN[32]){
	  var block = document.getElementById("text-canvas");
	  block.style.display = "none";
      canvas.style.display = "block";	
      GAME_STATE = "playing";  
	  KEYSDOWN[32] = false;
	  enemies = [];
	  player.position = { x : canvas.width/2, y : canvas.height/2 };
	  player.size = 10;
	  player.facing = -1;
	  player.width = 40;
	  player.height = 10;
	  score = 0;
	}
};

var mainLoop = function(){
  if (GAME_STATE === "title"){
	  drawTitleScreen();
	  restart();
  } else if (GAME_STATE === "playing"){
	  renderCanvas();
  } else if (GAME_STATE === "over"){
      clearInterval(TIMER);
  }
};

// adding a high score
var addScore = function(){
	 var name = document.getElementById("name").value;
	 console.log(name);
	 document.getElementById("text-canvas").innerHTML = "<div id=\'table\'></div>";
	 document.getElementById("table").innerHTML = "Loading...";
	 var p = new db.highscoretable({'name':name, 'score': score});
	 p.save();
	 var x = db.highscoretable.find(query, {}, function(err, productlist){
	     document.getElementById("table").innerHTML = "";
         HS=productlist;
		 HS.sort(sortFn);
	     /*for (i=0; i < Math.min(10, HS.length);i++){
		    document.getElementById("table").innerHTML += HS[i].name + " " + HS[i].score + "<br>";
		 }*/
		 printHallofFame(HS);
     });
	 if (HS.length >=10){
	  console.log("deleting");
	  for (i=10; i < HS.length; i++){
	    console.log(i);
	    console.log(HS[i]["_id"]);
		db.highscoretable.getById(HS[i]["_id"], function(err, res){
            var z = new db.highscoretable(res);
            z.delete();
        });
	  }
	 }
};

var printHallofFame = function(HS){
	var table = document.getElementById("table");
	var str = "";
	str += "<h1 style=\'color : red;\'>HALL OF LEGENDS</h1>";
	str += "<center><table>";
	     for (i=0; i < Math.min(10, HS.length);i++){
		    str += "<tr><td>" + HS[i].name + "</td><td class=\'col2\'>" + HS[i].score + "</td></tr>";
		 }	
	str += "</table></center>";
	table.innerHTML = str;
};
