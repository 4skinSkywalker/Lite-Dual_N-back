var optionsTrg 		= "navigation",
	trainerTrg		= "site-wrap",
	gridTrg			= "grid",
	resultsTrg		= "results",
	playStopTrg		= "engine-button",
	playChar		= "Play",
	stopChar		= "Stop",
	running			= false,
	blockCounter 	= -1,
	enable 			= [0, 0],
	userScoreTemp 	= [0, 0, 0, 0, 0, 0],
	loadedSounds 	= [],
	engine 			= {};
	
engine.left 		= { "target":"left", "value":0};
engine.time 		= { "type":"range", "target":"stimulus-time", "text":"Stimulus:", "value":3000, "min":1500, "step":100, "MAX":6000, "char":"s"};
engine.blocks 		= { "type":"range", "target":"matching-blocks", "text":"Matching:", "value":6, "min":3, "step":1, "MAX":9};
engine.n 			= { "type":"range", "target":"n-back", "text":"N-back", "value":2, "min":1, "step":1, "MAX":9, "char":""};
engine.threshold 	= { "type":"range", "target":"success-threshold", "text":"Threshold:", "value":0.8, "min":0.7, "step":0.05, "MAX":1.0, "char":"%", "change":function(x) {return x*100}};
engine.feedback 	= { "type":"range", "target":"feedback", "text":"Feedback:", "value":1, "min":0, "step":1, "MAX":1, "change":function(x) {return (x == 1) ? "on" : "off"}};
engine.rotation		= { "type":"range", "target":"rotation-duration", "text":"Rotation:", "value":60, "min":30, "step":10, "MAX":120, "char":"s", "direction":function() {return (Math.floor(Math.random() * 2) == 0) ? "-clockwise" : "-anticlockwise"}};
engine.audio		= { "type":"selector", "target":"audio-symbols", "text":"Audio:", "value":"Natural Numbers",
						"symbols": {
							"Natural Numbers":[1,2,3,4,5,6,7,8],
							"Prime Numbers":[2,3,5,7,11,13,17,19]
						}
					};

function getLayoutHTML() {
	var s = "";
	s += '<ul class="' + optionsTrg + '"></ul>';
	s += '<input type="checkbox" id="nav-trigger" class="nav-trigger"/>';
	s += '<label for="nav-trigger"></label>';
	s += '<div class="' + trainerTrg + '"></div>';
	return s;
}

function populateOptionsHTML() {
	var s = "",
		obj = engine;
	s += '<li class="nav-item">';
	s += '<p id="level">N = ' + engine.n["value"] + '</p>';
	s += '</li>';
	for(var key in obj) {
		if(obj.hasOwnProperty(key)) {
			if(obj[key]["type"] == "range") {
				var spanChar = (obj[key]["char"]) ? obj[key]["char"] : "";
					spanText = (obj[key]["change"]) ? obj[key]["change"](obj[key]["value"]) + spanChar : obj[key]["value"] + spanChar;
				s += '<li class="nav-item">';
				s += 	'<span class="range-label">' + obj[key]["text"] + ' </span><span id="' + obj[key]["target"] + '-span" class="range-label">' + spanText +'</span>';
				s +=	'<input type="range" class="slider" id="' + obj[key]["target"] + '" min="' + obj[key]["min"] + '" max="' + obj[key]["MAX"] + '" step="' + obj[key]["step"] + '" value="' + obj[key]["value"] + '">';
				s += '</li>';
			} else if(obj[key]["type"] == "selector") {
				s += '<li class="nav-item">';
				s += 	'<label for="' + obj[key]["target"] + '">' + obj[key]["text"] + '</label>';
				s +=	'<select class="option" id="' + obj[key]["target"] + '">';
				for(var subkey in obj[key]["symbols"])
					s +=	'<option>' + subkey + '</option>';
				s +=	'</select>';
				s += '</li>';
			}
			$("." + optionsTrg).append(s);
			$("#" + obj[key]["target"]).on("change", onchangeCallback(obj, key));
		}
		s = "";
	}
	s += '<li class="nav-item">';
	s += 	'<p>Controls:<br>"A" key for visual<br>"L" key for audio.</p>';
	s += '</li>';
	$("." + optionsTrg).append(s);
}

function onchangeCallback(obj, key) {
	return function() {
		if(obj[key]["type"] == "range") {
			obj[key]["value"] = Number($("#" + obj[key]["target"]).val());
			if($("#" +  obj[key]["target"] + "-span"))
				$("#" +  obj[key]["target"] + "-span").text(obj[key]["value"]);
		} else if(obj[key]["type"] == "selector") {
			obj[key]["value"] = $("#" + obj[key]["target"]).val();
		}
		
		if(obj[key]["change"] || obj[key]["char"]) {
			var spanChar = (obj[key]["char"]) ? obj[key]["char"] : "";
				spanText = (obj[key]["change"]) ? obj[key]["change"](obj[key]["value"]) + spanChar : obj[key]["value"] + spanChar;
			$("#" +  obj[key]["target"] + "-span").text(spanText);
		}

		if(key == "time" || key == "blocks" || key == "n") {
			calculateStimuli(engine.blocks["value"], engine.n["value"]);
		} else if(key == "rotation") {
			var grid = $("#" + gridTrg);
			grid.attr("style", "animation: rotating" + obj[key]["direction"]() + " " + obj[key]["value"] + "s linear infinite;");
			if(obj[key]["value"] == obj[key]["min"]) {
				$("#" + obj[key]["target"] + "-span").text("off");
				grid.removeClass("rotational-grid");
				grid.attr("style", "");
			} else if(!grid.hasClass("rotational-grid")){
				grid.addClass("rotational-grid");
				grid.attr("style", "animation: rotating" + obj[key]["direction"]() + " " + obj[key]["value"] + "s linear infinite;");
			}
		} else if(key == "audio") {
			var sel = obj[key]["value"];
			howlerizer(sel, obj[key]["symbols"][sel]);
		}
	}
}

function populateTrainerHTML() {
    var s = "";
	s += '<div id="status-bar">';
	s += 	'<div id="' + engine.left["target"] + '">' + engine.left["value"] + '</div>';
	s += '</div>';	
	s += '<button type="button" id="' + playStopTrg + '" class="btn-standard"></button>';
	s += '<table id="' + gridTrg + '" class="rotational-grid" style="animation: rotating' + engine.rotation["direction"]() + ' ' + engine.rotation["value"] + 's linear infinite;">';
	for(var i = 0; i < 3; i++) {
		s += '<tr>';
		for(var j = 0; j < 3; j++)
			s += '<td><div class="tile"></div></td>';
		s += '</tr>';
	}
	s += '</table>';
	s += '<div id="eye"></div>';
	s += '<div id="ear"></div>';
    $("." + trainerTrg).append(s);
}

function functionizer(e, f, t) {
	$(e).prop("onclick", null).attr("onclick", f);
	$(e).text(t);
}

function update(n) {
	if(n) {
		$("#" + engine.n["target"]).val(n);
		$("#" + engine.n["target"] + "-span").text(n);
		$("#level").html("N = " + n);
	}
	$("#" + engine.left["target"]).html(engine.left["value"]);
}

function howlerizer(dir, a) {
	loadedSounds = [];
	a.forEach(function(el) {
		loadedSounds.push(new Howl({src: ["snd/" + dir.replace(/ /g, '-') + "/" + el +".wav"]}));
	});
}

function wow(s, c, t) {
	$(s).addClass(c);
	setTimeout(function() {
		$(s).removeClass(c)
	}, t);
}

function markupInitializer() {
	
	$("body").append(getLayoutHTML());
	populateTrainerHTML();
	populateOptionsHTML();
	
	calculateStimuli(engine.blocks["value"], engine.n["value"]);
	functionizer("#" + playStopTrg, "start()", playChar);
	
	results = new Pop("results", resultsTrg);
	$("body").append(results.getPopHTML());
}

function eventsInitializer() {
	
	var sel = engine.audio["value"];
	howlerizer(sel, engine.audio["symbols"][sel]);
	
	var keyAllowed = {};
	$(document).keydown(function(e) {
		e.preventDefault();
		e.stopPropagation();
		
		if(keyAllowed[e.which] == false) return;
		keyAllowed[e.which] = false;
		
		var keyCode = e.keyCode || e.which;
		switch(keyCode) {
			case 65:
				checkBlock("visual");
				break;
			case 76:			
				checkBlock("audio");
				break;
			default:
				return;
		}
	});
	$(document).keyup(function(e) {keyAllowed[e.which] = true;});
	$(document).focus(function(e) {keyAllowed = {};});
	
	document.querySelector("#eye").addEventListener("touchstart", function(e) {
		e.preventDefault();
		checkBlock("visual");
	}, false);
	document.querySelector("#ear").addEventListener("touchstart", function(e) {
		e.preventDefault();
		checkBlock("audio");
	}, false);
}

function start() {

	playing = setTimeout(function() {
		running = true;
		createBlock();
		playBlock();
	}, engine.time["value"]/4);

	functionizer("#" + playStopTrg, "stop()", stopChar);
}

function stop(n) {

	n = n || engine.n["value"];
	
	running = false;
	clearTimeout(playing);
	
	blockCounter = -1;
	enable = [0, 0];
	userScoreTemp 	= [0, 0, 0, 0, 0, 0];
	
	calculateStimuli(engine.blocks["value"], n);
	functionizer("#" + playStopTrg, "start()", playChar);
}

function calculateStimuli(blocks, n) {
	engine.left["value"] = blocks*(n + 1);
	update(n);
}

function prepareBlock(n, left, blocks) {

	var thisBlock = [];
	
	for(var i = 0; i < left; i++)
		thisBlock.push([0, 0]);
	
	var blockLength = thisBlock.length,
		vis = 0,
		aud = 0;

	while(vis < blocks) {
		var visTarg = Math.floor(Math.random() * blockLength);
		if(thisBlock[visTarg + n]) {
			if(thisBlock[visTarg][0] == 0 && thisBlock[visTarg + n][0] == 0) {
				thisBlock[visTarg][0] = 1 + Math.floor(Math.random() * 8);
				thisBlock[visTarg + n][0] = thisBlock[visTarg][0];
				vis++;
			} else if(thisBlock[visTarg][0] != 0 && thisBlock[visTarg + n][0] == 0) {
				thisBlock[visTarg + n][0] = thisBlock[visTarg][0];
				vis++;
			} else if(thisBlock[visTarg][0] == 0 && thisBlock[visTarg + n][0] != 0) {
				thisBlock[visTarg][0] = thisBlock[visTarg + n][0];
				vis++;
			} else {
				continue;
			}
		} else {
			continue;
		}
	}
	while(aud < blocks) {
		var audTarg = Math.floor(Math.random() * blockLength);
		if(thisBlock[audTarg + n]) {
			if(thisBlock[audTarg][1] == 0 && thisBlock[audTarg + n][1] == 0) {
				thisBlock[audTarg][1] = 1 + Math.floor(Math.random() * 8);
				thisBlock[audTarg + n][1] = thisBlock[audTarg][1];
				aud++;
			} else if(thisBlock[audTarg][1] != 0 && thisBlock[audTarg + n][1] == 0) {
				thisBlock[audTarg + n][1] = thisBlock[audTarg][1];
				aud++;
			} else if(thisBlock[audTarg][1] == 0 && thisBlock[audTarg + n][1] != 0) {
				thisBlock[audTarg][1] = thisBlock[audTarg + n][1];
				aud++;
			} else {
				continue;
			}
		} else {
			continue;
		}
	}
	for(var x = 0; x < blockLength; x++) {
		if(thisBlock[x][0] == 0) {
			thisBlock[x][0] = 1 + Math.floor(Math.random() * 8);
			if(thisBlock[x - n] && thisBlock[x][0] == thisBlock[x - n][0]) {
				(thisBlock[x][0] < 8) ? thisBlock[x][0] += 1 : thisBlock[x][0] -= 1;
			} else if(thisBlock[x + n] && thisBlock[x][0] == thisBlock[x + n][0]) {
				(thisBlock[x][0] < 8) ? thisBlock[x][0] += 1 : thisBlock[x][0] -= 1;
			}
		}
		if(thisBlock[x][1] == 0) {
			thisBlock[x][1] = 1 + Math.floor(Math.random() * 8);
			if(thisBlock[x - n] && thisBlock[x][1] == thisBlock[x - n][1]) {
				(thisBlock[x][1] < 8) ? thisBlock[x][1] += 1 : thisBlock[x][1] -= 1;
			} else if(thisBlock[x + n] && thisBlock[x][1] == thisBlock[x + n][1]) {
				(thisBlock[x][1] < 8) ? thisBlock[x][1] += 1 : thisBlock[x][1] -= 1;
			}
		}
	}
	return thisBlock;
}

function evaluateBlock(block, n) {

	var v = 0,
		a = 0;
	
	for(var i = 0; i < block.length; i++)
		if(block[i - n]) {
			if(block[i][0] == block[i - n][0])
				v += 1;
			if(block[i][1] == block[i - n][1])
				a += 1;
		}

	return [v, a];
}

function checkBlock(c) {

	var p = (c == "visual") ? 0 : 1,
		e = (c == "visual") ? "#eye" : "#ear",
		r = (c == "visual") ? 0 : 3,
		w = (c == "visual") ? 2 : 5;

	if(enable[p] != 1 && running) {
		enable[p] = 1;
		if(blockCounter + 1 > engine.n["value"] && currentBlock[blockCounter]) {
			if(currentBlock[blockCounter][p] == currentBlock[blockCounter - engine.n["value"]][p]) {
				console.log('%c right ' + c, 'color: blue');
				if(engine.feedback["value"])
					wow(e, "right", engine.time["value"]/6);
				userScoreTemp[r] += 1;
			} else {
				console.log('%c wrong ' + c, 'color: red');
				if(engine.feedback["value"])
					wow(e, "wrong", engine.time["value"]/6);
				userScoreTemp[w] += 1;
			}
		}
	}
}

function createBlock() {
	
	currentBlock = prepareBlock(engine.n["value"], engine.left["value"], engine.blocks["value"]);
	blockEval = evaluateBlock(currentBlock, engine.n["value"]);
	
	while(blockEval[0] != engine.blocks["value"] || blockEval[1] != engine.blocks["value"]) {
		currentBlock = prepareBlock(engine.n["value"], engine.left["value"], engine.blocks["value"]);
		blockEval = evaluateBlock(currentBlock, engine.n["value"]);
	}
	
	thisBlockLength = currentBlock.length;
	
	console.log(currentBlock);
	console.log('%c matching blocks: ' + blockEval, 'color: blue');
}

function playBlock() {

	if(++blockCounter < thisBlockLength) {
		if(blockCounter > engine.n["value"]) {
			if(currentBlock[blockCounter - 1][0] == currentBlock[blockCounter - engine.n["value"] - 1][0] && currentBlock[blockCounter - 1][1] == currentBlock[blockCounter - engine.n["value"] - 1][1]) {
				if(enable[0] < 1 && enable[1] < 1) {
					console.log('%c both cues missed', 'color: orange');
					if(engine.feedback["value"]) {
						wow("#eye", "missed", engine.time["value"]/6);
						wow("#ear", "missed", engine.time["value"]/6);
					}
					userScoreTemp[1] += 1;
					userScoreTemp[4] += 1;
				}
			} else if(currentBlock[blockCounter - 1][0] == currentBlock[blockCounter - engine.n["value"] - 1][0]) {
				if(enable[0] < 1) {
					console.log('%c visual cue missed', 'color: orange');
					if(engine.feedback["value"])
						wow("#eye", "missed", engine.time["value"]/6);
					userScoreTemp[1] += 1;
				}
			} else if(currentBlock[blockCounter - 1][1] == currentBlock[blockCounter - engine.n["value"] - 1][1]) {
				if(enable[1] < 1) {
					console.log('%c audio cue missed', 'color: orange');
					if(engine.feedback["value"])
						wow("#ear", "missed", engine.time["value"]/6);
					userScoreTemp[4] += 1;
				}
			}
		}
		if(currentBlock[blockCounter]) {
			var blockLight = (currentBlock[blockCounter][0] < 5) ? currentBlock[blockCounter][0]  - 1 : currentBlock[blockCounter][0] ;
			wow(".tile:eq(" + blockLight + ")", "on", engine.time["value"]/6);
			loadedSounds[currentBlock[blockCounter][1] - 1].play();
		}
		
		console.log('%c round		: #' + blockCounter, 'color: black')
		console.log('%c block		: ' + currentBlock[blockCounter], 'color: black')
		console.log('%c keypresses	: ' + enable, 'color: green');
		console.log('%c score		: ' + userScoreTemp, 'color: green');
		
		engine.left["value"]--;
		update();
		
		playing = setTimeout(playBlock, engine.time["value"]);
		enable = [0, 0];
	} else {
		userScoreTemp[1] = engine.blocks["value"] - userScoreTemp[0];
		userScoreTemp[4] = engine.blocks["value"] - userScoreTemp[3];
		
		var s = "";
		s += '<table class="results-icons">';
		s += '<tr><td colspan="2">Visual</td><td colspan="2">Audio</td></tr>';
		s += '<tr><td>☑</td><td>' + userScoreTemp[0] + '</td><td>☑</td><td>' + userScoreTemp[3] + '</td></tr>';
		s += '<tr><td>☐</td><td>' + userScoreTemp[1] + '</td><td>☐</td><td>' + userScoreTemp[4] + '</td></tr>';
		s += '<tr><td>☒</td><td>' + userScoreTemp[2] + '</td><td>☒</td><td>' + userScoreTemp[5] + '</td></tr>';
		s += '</table>'
		
		$("#" + resultsTrg).html(s);
		
		var incorrectVis = userScoreTemp[1] + userScoreTemp[2],
			incorrectAud = userScoreTemp[4] + userScoreTemp[5],
			threshold = engine.blocks["value"]*(1 - engine.threshold["value"]),
			upperThreshold = Math.ceil(threshold),
			lowerThreshold = Math.floor(threshold);
		
		if(incorrectVis <= lowerThreshold && incorrectAud <= lowerThreshold) {
			$("#" + resultsTrg).append('<p class="results-text">N is now:<br>' + ++engine.n["value"] + '</p>');
		} else if(incorrectVis > upperThreshold || incorrectAud > upperThreshold) {
			if(engine.n["value"] != 1) {
				$("#" + resultsTrg).append('<p class="results-text">N is now:<br>' + --engine.n["value"] + '</p>');
			} else {
				$("#" + resultsTrg).append('<p class="results-text">N stays: 1<br>Keep trying</p>');
			}
		} else {
			$("#" + resultsTrg).append('<p class="results-text">N stays: ' + engine.n["value"] + '<br>Keep trying</p>');
		}

		stop(engine.n["value"]);
		setTimeout(results.yes(), 400);
	}
}

function Pop(name, innerId) {
	this.name = name;
    this.id = this.name + "-popup";
	this.innerId = innerId;
}

Pop.prototype.yes = function() {
    var pop = document.getElementById(this.id);
    pop.style.opacity = 1;
	pop.style.height = 100 + "vh";
	pop.style.width = 100 + "vw";
};

Pop.prototype.no = function() {
    var pop = document.getElementById(this.id);
    pop.style.opacity = 0;
	pop.style.height = 0;
	pop.style.width = 0;
	document.getElementById(this.innerId).innerHTML = "";
};

Pop.prototype.getPopHTML = function(inStr) {
    var s = '';
    s += '<div id="' + this.id + '" class="pop" style="opacity:0; height:0; width:0">';
	s += 	'<div id="' + this.innerId + '">';
    if(inStr) s += 	inStr;
	s += 	'</div>';
    s += 	'<button onclick="' + this.name + '.no()" style="z-index:40" class="btn-popup">✖</button>';
	s += '</div>';
    return s;
};