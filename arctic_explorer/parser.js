var parse = function(command){
  //document.getElementById("response").innerHTML = "<p>Command noted.</p>";
  
  var response = document.getElementById("response");
  var inputValid = true;
  command = command.toLowerCase();
  //document.getElementById("debug").innerHTML += document.getElementById("response").innerHTML;
  
  if (game.played && command != "y" && command != "n"){
    command = "";
  }
  
  if (game.firstTurn){
    game.firstTurn = false;
  }
  
  switch (command){
    
	case "y":
	  if (!game.played){
		inputValid = false;
	  } else {
	    initializeGame();
	  }
	break;
	  
	case "n":
	  if (!game.played){
	    inputValid = false;
	  } else {
	    response.innerHTML = "Goodbye!";
		document.getElementById("inputField").style.display = "none";
		document.getElementById("cursor").style.display = "none";
	  }
	break;  
	
	case "s":
	  //document.getElementById("debug").innerHTML += player.health;
	  if (Math.random()	< player.health/(Math.abs(player.health) + 1) && player.slept === 0){
        response.innerHTML = "<p>Dreams of rescue gain you 1 health.</p>";
	    player.health += 1;
	    player.slept = 1;
	  } 
	  else {
	    response.innerHTML = "<p>You sleep for several days and almost freeze!</p>";
	    var sleepDays = Math.floor( Math.random()*7.0 ) + 1;
	    player.health -= 1;
	    environment.days += sleepDays;
	  }
	break;
	
	case "f":
	  var rand = Math.random();
	  if (rand < 0.8){
	    response.innerHTML = "<p>You manage to find some pitiful lichen from which you gain 1 health.</p>";
	    player.health += 1;
	  } 
	  else {
	    response.innerHTML = "<p>All day you plod through the snow, finding nothing. You lose 2 health.</p>";
		player.health -= 2;	    			  
	  }
	break;
	
	case "h":
	  if (environment.temp < -50){
	    response.innerHTML = "<p>It is too cold to hunt.</p>";
	  } 
	  else {
	    var rand = Math.random();
	    if (rand > 0.5){
	    	response.innerHTML = "<p>Your failed to catch anything. Your fruitless exertions cost 1 health.</p>";
	        player.health -= 1;
	    } else if (rand > 0.3){
	    	response.innerHTML = "<p>You caught a snowshoe hare! You gain 1 health.</p>";
	        player.health += 1;
	    } else if (rand > 0.2){
	    	response.innerHTML = "<p>You caught a plump ptarmigan! You gain 2 health!<p>";
		    player.health += 2;	    		    	  
	    } else if (rand > 0.05){
	    	response.innerHTML = "<p>You caught an elk! You gain 3 health!</p>";
		    player.health += 3;	    		    	  
	    } else {
	    	response.innerHTML = "<p>As you pursue your quarry, you slip and are badly injured. You lose 3 health.</p>";
		    player.health -= 3;
	    }
	  }
	  break;
	  
	case "e":
	  var rand = Math.random();
	  if (rand > 0.9){
	      response.innerHTML = "<p>You encounter an Inuit party! You gain 20 ethnography points!</p>";
	      environment.bonus += 20;
	      var rand2 = Math.random();
	    if (rand2 > 0.7){
	        response.innerHTML += "<p>They attack you and you lose 2 health.</p>";
	        player.health -= 2;
	      } else if (rand2 > 0.4){
	    	  response.innerHTML +=  "<p>They make off at your approach.</p>";
	      } else if (player.health <= 5){
	    	  response.innerHTML += "<p>Seeing your condition, they take pity on you and nurse you back to health, " +
	    				  		"then leave.</p>";
	    	  player.health = player.maxHealth;
	    	  environment.days += 14;
	        } 
		else {
	    	response.innerHTML += "<p>You exchange pleasantries.</p>";
	      }
	    } else if (rand > 0.6) {
	    	response.innerHTML = "<p>You lose your way. A day of fruitless wandering in the icy wastes"
	    			  		+ " costs you 1 health.</p>";
	    	player.health -= 1;
	    } else if (rand > 0.3){
	    	response.innerHTML = "<p>You manage to explore one square km of the surroundings.</p>";
	        environment.explored += 1;
	    } else if (rand > 0.2){
	        response.innerHTML ="<p>You manage to crawl to the summit of a nearby hill and plant your national flag on it!</p>";
	    	environment.explored += 1;
	    } else if (rand > 0.1){
	    	response.innerHTML = "<p>You come across the rotting carcass of a seal!</p>";
	    	if (player.health <= 9){
	    		response.innerHTML += "<p>You eagerly wolf it down and gain one health.</p>";
	    	    player.health += 1;
		    } else {
		    	response.innerHTML += "<p>Even in your sorry condition, "
		    			 		+ "you cannot bring yourself to touch the foul thing.</p>"; 
		    }
	    	environment.explored += 1;
	    } else {
	        response.innerHTML = "<p>A blizzard springs up and you lose your way and 1 health.</p>";
	    	player.health -= 1;
		}
	break;
	
	default:
	  inputValid = false;
  };
  //document.getElementById("debug").innerHTML = response.innerHTML;

  /* Update game state, but don't do anything if a valid command was not entered */
  
  if (!inputValid){
    response.innerHTML = "<p>Please enter valid input.</p>";
  }
  
  if (inputValid && !game.played && !game.firstTurn){
    //document.getElementById("debug").innerHTML += player.health;
	//document.getElementById("debug").innerHTML += response.innerHTML;
  
    if (command != "s"){ 
    // reset sleep counter
	  player.slept = 0;
    }
	      
    environment.days += 1;
    if (Math.random() > 0.8){
	  environment.temp += 1;
    } else {
	  environment.temp -= 1;
    }
	      
    if (environment.temp < -2 * player.health){
	  response.innerHTML += "<p>The bitter cold costs you 1 health.</p>";
	  player.health -=1;
    }
    if (player.health >= player.maxHealth){
	  player.health = player.maxHealth;
	  response.innerHTML += "<p>You gain 10 survival points for having maximum"
	    	  		+ " health! Perhaps one day you will escape this white"
	    	  		+ " hell.</p>";
	  environment.bonus += 10;
    }
	
	if (player.health <= 0){
	  player.health = 0;
	}
	
    response.innerHTML += "<p>Your health is " + player.health + ". Temperature is " +
    environment.temp + ". Ordeal has lasted " + environment.days + " days. You have explored " + environment.explored + 
    " square km.</p>";
    response.innerHTML += "<p>You may hunt (h), sleep (s), forage (f) or explore (e)</p>";  
	
    if (player.health <= 0){
	  response.innerHTML += "<p>*** You have died in the icy wastes ***</p>";
	  response.innerHTML += "<p>You survived " + environment.days +  " days. "
      + "You explored " + environment.explored +  " square km of the arctic.</p>";
		  
      // score and ranking
      var rank = "Nothing";
      var score = environment.bonus + 10*environment.explored + environment.days;
      if (score > 50) rank = "A small rock";
	  if (score > 100) rank = "A species of lichen";
	  if (score > 150) rank = "A species of whale";
      if (score > 200) rank = "An ice shelf";
	  if (score > 300) rank = "An island";
	  if (score > 400) rank = "A peninsula";
	  if (score > 500) rank = "A continent";
		 
	  response.innerHTML += "<p>Your final score is " + score +
				  ". " + rank + " is later named after you. Do you wish to play again (y/n)?</p>"; 
	  game.played = true;			  
	}
  }
  
};