var player = {
	position : { x : canvas.width/2, y : canvas.height/2 },
	velocity : { x : 0, y : 0 },
	accel : { x: 0, y : 0},
	maxSpeed : 2,
	size : 10,
	maxSize : 2*canvas.height,
	delta_v : 1,
	drag : 0.7,
	facing : -1,
	width : 20,
	height : 10,
	smoosh : 10,
	sprite : PLAYER_SPRITE_LEFT,
	colour : "black",
	move : function(){
		if (KEYSDOWN["37"]){
			player.position.x -= player.delta_v;
			player.facing = -1;
			player.sprite = PLAYER_SPRITE_LEFT;
		}
		if (KEYSDOWN["39"]){
			player.position.x += player.delta_v;
			player.facing = 1;
			player.sprite = PLAYER_SPRITE_RIGHT;
		}
		if (KEYSDOWN["38"]){
			player.position.y -= player.delta_v;
		}
		if (KEYSDOWN["40"]){
			player.position.y += player.delta_v;
		}	
		if (KEYSDOWN["32"]){
			player.position.x -= player.facing*player.smoosh;
			if (player.facing === -1 ){
				player.sprite = PLAYER_SPRITE_5;
			} else {
				player.sprite = PLAYER_SPRITE_6;
			}
		}
			
        if (player.position.x > canvas.width) player.position.x = canvas.width;
        if (player.position.x < 0) player.position.x = 0;
        if (player.position.y > canvas.height) player.position.y = canvas.height;
        if (player.position.y < 0) player.position.y = 0;

	},
	draw : function(){
		//ctx.fillStyle = player.colour;
		//ctx.fillRect(player.position.x - player.width/2, player.position.y - player.height/2, player.size, player.size);
        ctx.drawImage(player.sprite, player.position.x - player.width/2, player.position.y - player.height/2, player.size*4, player.size);
	}
};