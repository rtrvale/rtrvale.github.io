  var game = 
  {
    played : false,
    firstTurn : false
  };
  
  var environment =
  {
    temp : -10,
	days : 0,
	bonus : 0,
	explored : 0
  };
  
  var player = 
  {
    health : 2,
	slept : 0,
	maxHealth : 20
  };
  
var initializeGame = function(){
   
  game.played = false;
  game.firstTurn = true;
  
  environment.temp = -10;
  environment.days = 0;
  environment.bonus = 0;
  environment.explored = 0;

  player.health = 10;
  player.slept = 0;
  player.maxHealth = 20;  
  
  document.getElementById("response").innerHTML = "<p>You are an explorer stranded in the arctic.<br>";
  document.getElementById("response").innerHTML += "Your health is " + player.health + ". Temperature is " +
  environment.temp + ". Ordeal has lasted " + environment.days + " days. You have explored " + environment.explored + 
  " square km.</p>";
  document.getElementById("response").innerHTML += "<p>You may hunt (h), sleep (s), forage (f) or explore (e)</p>";
};
