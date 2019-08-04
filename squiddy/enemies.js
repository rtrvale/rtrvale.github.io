
var detectPlayerAte = function(player, enemy){
	var dx = Math.abs(player.position.x - enemy.x);
	var dy = Math.abs(player.position.y - enemy.y);
	if (player.size >= enemy.size && dy < player.height/2 && dx < player.width/2) return true;
	return false;
};

var detectPlayerGotEaten = function(player, enemy){
	var dx = Math.abs(player.position.x - enemy.x);
	var dy = Math.abs(player.position.y - enemy.y);
	if (player.size < enemy.size && dy < enemy.height/2 && dx < enemy.width/2) return true;
	return false;
};

var cleanUpEnemies = function(){
	for (i=0; i < enemies.length; i++){
		if ((enemies[i].x < -10*canvas.width && enemies[i].facing === -1) || 
		    (enemies[i].x >  10*canvas.width && enemies[i].facing ===  1)){
			enemies[i].remove = true;
		}
	}
	enemies = enemies.filter(x => !x.remove);
};

var addEnemy = function(){
	var enemy = {}; 
	enemy.x = canvas.width/2 + (Math.random()-0.5)*3*canvas.width;
	if (enemy.x > 0 & enemy.x < canvas.width){
		if (Math.random() < 0.5){
			enemy.x = - canvas.width;
		} else {
			enemy.x = 2*canvas.width;
		}
	}
	enemy.facing = (enemy.x < 0 ? 1 : -1);
	enemy.y = canvas.height*Math.random();
	enemy.size = 5 + (Math.min(enemyMaxSize, 2*player.size) - 5
	)*Math.random();
	enemy.remove = false;
	enemy.height = enemy.size;
	enemy.width = 4*enemy.size;
	enemy.speed = enemy.facing*Math.random()*3 + 0.2*enemy.facing;
	enemy.draw = function(){
		var pic = enemy.facing === -1 ? ENEMY_SPRITE_LEFT : ENEMY_SPRITE_RIGHT;
		ctx.drawImage(pic, enemy.x - enemy.width/2, enemy.y - enemy.height/2, enemy.width, enemy.height);
	};
	enemy.update = function(){
		enemy.x += enemy.speed;
	}
	enemies.push(enemy);
};

var eat = function(player, enemy, growthFactor){
	var diff = Math.abs(player.size - enemy.size);
	var growth = growthFactor*Math.pow(enemy.size, 1/2); //1/3
	score += Math.max(Math.floor(10000*growth)*100, 100);
	console.log(score);
	score += Math.floor(enemy.speed)*100; // speed bonus
	console.log(score);
	score += 100*Math.floor(Math.exp(-diff/10)*10); // danger bonus
	score += Math.floor(10*Math.exp(-Math.abs(player.position.x - 0)))*100;
	score += Math.floor(10*Math.exp(-Math.abs(player.position.x - canvas.width)))*100;
	player.size *= (1+growth);
	if (player.size > player.maxSize){
		player.size = player.maxSize;
		endGame("victory");
	}
	player.height = player.size;
	player.width = player.size*4;
	document.getElementById("score-box").innerHTML = "Score: " + score;
};