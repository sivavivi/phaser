var game = new Phaser.Game(800,600,Phaser.CANVAS,'test',{preload: preload, create: create, render: render, update: update});
var userArea;
var c0,c1;
var main_deck_cards_count = 10;
var user_card_slots_count = 6;
var min_match_seq = 3;
var main_deck_cards = []
var user_card_slots = [];
var usr_cards = Array(user_card_slots_count).fill('');
var debug = true;
var exp_card_seqs = [
		['c0','c1','c2','c3','c4','c5','c6','c7','c8','c9'],
		['c0','c2','c4','c6','c8'],
		['c1','c3','c5','c7','c9'],
		['c2','c1','c0']
		];
	

function log(msg){
	if (debug){
		console.log(msg);
	}
}

log('pre game dec');
function preload(){
	for (var i = 0; i <= 9; i++){
		game.load.image('c'+i,'images/card'+i+'.png')
	}
	game.load.image('con0','images/con0.png')
}

function create(){
	log('create game');
	game.stage.backgroundColor = '338833';
	var user_card_slot_y = 200;
	var user_card_slot_x = 20;
	var user_card_slot_width = 105;
	for (var i = 0; i < main_deck_cards_count; i++){
		main_deck_cards[i] = game.add.sprite(10,10,'c'+i);
	}
	for (var i = 0; i < user_card_slots_count; i++){
		var x = (i * user_card_slot_width) + 10;
		var y = user_card_slot_y;
//		console.log('x: ' + x + ' y: ' + y); 
		user_card_slots[i] = game.add.sprite(x,y,'con0');
	}
	//con0.alpha = 0.1;

	bgLayer = game.add.group();
	bgLayer.depth = 1;
	crdLayer = game.add.group();
	crdLayer.depth = 2;
	for (var i = 0; i < main_deck_cards_count; i++){
		crdLayer.add(main_deck_cards[i]);
		main_deck_cards[i].inputEnabled = true;
		main_deck_cards[i].input.enableDrag();
		main_deck_cards[i].events.onDragStop.add(dragStopped,this);
		main_deck_cards[i].events.onDragStart.add(dragStarted,this);
	}
	game.input.mouse.capture = true;
}

function render(){
}

function update(){
}

function dragStarted(sprite,pointer){
	log("dragStarted for: " + sprite.key);
	var overlap = false;
	for (var i = 0; i < user_card_slots_count; i++){
		if (Phaser.Rectangle.intersects(sprite.getBounds(),user_card_slots[i].getBounds())){
			usr_cards[i] = "";
		}
	}
}

function dragStopped(sprite,pointer){
	log("dragStopped for: " + sprite.key);
	var overlap = false;
	for (var i = 0; i < user_card_slots_count; i++){
		if (Phaser.Rectangle.intersects(sprite.getBounds(),user_card_slots[i].getBounds())){
			for (var j = 0; j < main_deck_cards_count; j++){
				if (main_deck_cards[j] == sprite){
					//log("me: " + sprite.key);
					continue;
				}
				if (Phaser.Rectangle.intersects(main_deck_cards[j].getBounds(),user_card_slots[i].getBounds())){
//					console.log("already overlap: " + main_deck_cards[j].key + " and " + user_card_slots[i].key);
					overlap = true;
					break;
				}
			}
			if (overlap){
				continue;
			}
			if (game.input.activePointer.leftButton.isUp){
				//console.log("overlap con" + i + " " + sprite.key + ' pos: ' + pointer.x + ',' + pointer.y);
				sprite.alignIn(user_card_slots[i]);
				sprite.bringToTop();
				usr_cards[i] = sprite.key;
				checkMatch();
				break;
			}
		}else{
			sprite.x = 10;
			sprite.y = 10;
			sprite.bringToTop();
//			console.log('reset');
		}
	}
}

function checkMatch(){
	for (i=0; i<usr_cards.length; i++){
		if (usr_cards[i] == ""){
			return false;
		}
	}

	start_index = 0;
	let chk_cards = usr_cards.concat();
	if (checkSequence(chk_cards.splice(start_index,min_match_seq))){
		log("Match Success");
	}
	if (checkSequence(chk_cards.splice(start_index,min_match_seq))){
		log("Match Success");
	}
}

function checkSequence(chk_cards){
	if (chk_cards.length != min_match_seq){
		log("Small set of user cards");
		return false;
	}
	log('----');
	chk_cards.forEach(function(chk_card,i){log(i + " " + chk_card)});
	log('----');

	var matched;
	for (i = 0; i < exp_card_seqs.length; i++){
		exp_cards = exp_card_seqs[i];

		found_index = exp_cards.indexOf(chk_cards[0]);
		log("found " + chk_cards[0] + " at " + found_index + " in " + exp_cards);

		if (found_index < 0){
			log("not found in: " + exp_cards)
			continue;
		}

		if ((found_index + min_match_seq) > exp_cards.length){
			log("out of bounds " + found_index + " + " + min_match_seq + " > " + exp_cards.length)
			continue;
		}

		for (j = 0, k = found_index; j < chk_cards.length && k < exp_cards.length; j++, k++){
			if (chk_cards[j] == exp_cards[k]){
				log("chk_card: "+ j + " : " + chk_cards[j] + " <>  exp_card: " + k + " : " + exp_cards[k]);
				matched = true;
			}else{
				log("chk_card: "+ j + " : " + chk_cards[j] + " )(  exp_card: " + k + " : " + exp_cards[k]);
				matched = false;
				break;
			}
		}
		log("out of inner loop: matched: " + matched);
		if (matched){
			break;
		}
	}
	log("out of outer loop: matched: " + matched);
	return matched;
}
/*
			chk_card = chk_cards[j];
			if (found_index >= 0){
				log("exp_card_seq: "+ i + "found_index: " + found_index + " for usr seq: " + j);
				exp_i = found_index;
				usr_i = j;
				matches = 0;
				//console.log("exp_i: " + exp_i + " usr_i: " + usr_i);
				//console.log("exp_card_seq.length: " + exp_card_seq.length + " chk_card.length: " + usr_cards.length);
				while ((exp_i < exp_card_seq.length) && (usr_i < usr_cards.length)){
				//	console.log("WHILE exp_i: " + exp_i + " usr_i: " + usr_i);
					if (exp_card_seq[exp_i] == usr_cards[usr_i]){
						matches++;
						console.log("exp_i: " + exp_i + " usr_i: " + usr_i + " matches: " + matches);
					}
					exp_i++;
					usr_i++;
					if (matches >= min_match_seq){
						matched = true;
						chk_card_start = usr_i
						console.log("M  A  T  C  H  E  D " + chk_card_start);
						break;
					}
					if (exp_i == exp_card_seq.length){
				//		console.log("exp_card_seq boundary");
						continue;
					}
					if (usr_i == chk_card.length){
				//		console.log("usr_card_seq boundary");
						continue;
					}
				}
			}
		}
		if (matched){
			matched = false;
			log("outer break");
			//break;
		}
*/
log('post game dec');
