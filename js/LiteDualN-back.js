function DNB() {
	_this = this;
	
	this.optionsTrg 	= "navigation";
	this.trainerTrg		= "site-wrap";
	this.gridTrg		= "grid";
	this.resultTrg		= "results";
	this.playStopTrg	= "play-stop-button";
	this.playChar		= "Play";
	this.stopChar		= "Stop";
	this.equalChar		= "=";
	
	this.running		= false;
	this.userScoreTemp 	= [0, 0, 0, 0, 0, 0];
	this.loadedSounds 	= [];
	
	this.engine 			= {};
	this.engine.left 		= { "target":"left", "value":0};
	this.engine.time 		= { "type":"range", "target":"stimulus-time", "text":"Stimulus:", "value":3000, "min":1500, "step":100, "MAX":6000, "char":"s"};
	this.engine.blocks 		= { "type":"range", "target":"matching-blocks", "text":"Matching:", "value":6, "min":3, "step":1, "MAX":9};
	this.engine.n 			= { "type":"range", "target":"n-back", "text":"N-back", "value":2, "min":1, "step":1, "MAX":9, "char":""};
	this.engine.threshold 	= { "type":"range", "target":"success-threshold", "text":"Threshold:", "value":0.8, "min":0.7, "step":0.05, "MAX":1.0, "char":"%", "change":function(x) {return x*100}};
	this.engine.rotation	= { "type":"range", "target":"rotation-duration", "text":"Rotation:", "value":60, "min":30, "step":10, "MAX":120, "char":"s", "direction":function() {return (Math.floor(Math.random() * 2) == 0) ? "-clockwise" : "-anticlockwise"}};
	this.engine.audio		= { "type":"selector", "target":"audio-symbols", "text":"Audio:", "value":"Prime Numbers",
								"symbols": {
									"Prime Numbers":[2,3,5,7,11,13,17,19], 
									"Natural Numbers":[1,2,3,4,5,6,7,8],
									"Consonant Letters":["c", "h", "k", "l", "q", "r", "s", "t"]
								}
							};
}
	
DNB.prototype.global = this;

DNB.prototype.getVarName = function () {
    for(var name in this.global) 
		if(this.global[name] == this) 
			return name; 
};

DNB.prototype.getLayoutHTML = function() {
	var s = "";
	s += '<ul class="' + this.optionsTrg + '"></ul>';
	s += '<input type="checkbox" id="nav-trigger" class="nav-trigger"/>';
	s += '<label for="nav-trigger"></label>';
	s += '<div class="' + this.trainerTrg + '"></div>';
	return s;
};

DNB.prototype.onchangeCallback= function(obj, key) {
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
			_this.remainedStimuli(_this.engine.blocks["value"], _this.engine.n["value"]);
		} else if(key == "rotation") {
			var grid = $("#" + _this.gridTrg);
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
			var selected = obj[key]["value"];
			_this.loadNewAudio(selected, obj[key]["symbols"][selected]);
		}
	}
};

DNB.prototype.populateTrainerHTML = function() {
    var s = "";
	s += '<div id="status-bar">';
	s += 	'<div id="' + this.engine.left["target"] + '">' + this.engine.left["value"] + '</div>';
	s += '</div>';	
	s += '<button id="' + this.playStopTrg + '" class="btn-standard"></button>';
	s += '<table id="' + this.gridTrg + '" class="rotational-grid" style="animation: rotating' + this.engine.rotation["direction"]() + ' ' + this.engine.rotation["value"] + 's linear infinite;">';
	for(var i = 0; i < 3; i++) {
		s += '<tr>';
		for(var j = 0; j < 3; j++) {
			s += '<td><div class="tile"></div></td>';
		}
		s += '</tr>';
	}
	s += '</table>';
	s += '<div id="eye"></div>';
	s += '<div id="ear"></div>';
    $("." + this.trainerTrg).append(s);
};

DNB.prototype.populateOptionsHTML = function() {
	var s = "",
		obj = this.engine;
	s += '<li class="nav-item">';
	s += '<p id="level">N' + this.equalChar + this.engine.n["value"] + '</p>';
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
			$("." + this.optionsTrg).append(s);
			$("#" + obj[key]["target"]).on("change", this.onchangeCallback(obj, key));
		}
		s = "";
	}
	s += '<li class="nav-item">';
	s += 	'<p>Controls:<br>"A" key for visual<br>"L" key for audio.<br><span style="color:#FFD700">Given to you by Fred</span></p>';
	s += '</li>';
	$("." + this.optionsTrg).append(s);
};

DNB.prototype.assignFunction = function(el, foo, txt) {

	$(el).prop("onclick", null).attr("onclick", foo);
	$(el).text(txt);
};

DNB.prototype.wow = function(selector, _class, time) {
	
	$(selector).addClass(_class);
	setTimeout(function() {
			$(selector).removeClass(_class)
		}
	, time);
};

DNB.prototype.updateN = function(n) {

	if(n) {
		$("#" + this.engine.n["target"]).val(n);
		$("#" + this.engine.n["target"] + "-span").text(n);
		$("#level").html("N" + this.equalChar + n);
	}
	
	$("#" + this.engine.left["target"]).html(this.engine.left["value"]);
};

DNB.prototype.remainedStimuli = function(blocks, n) {
	
	this.engine.left["value"] = blocks*(n + 1);
	this.updateN(n);
};

DNB.prototype.loadNewAudio = function(dir, a) {
	
	this.loadedSounds = [];
	
	var netDir = dir.replace(/ /g, '-');
	a.forEach(function(el) {
		_this.loadedSounds.push(new Howl({src: ["snd/" + netDir + "/" + el +".wav"]}));
	});
};

DNB.prototype.init = function() {

	this.name = this.getVarName();
	
	$("body").append(this.getLayoutHTML());
	this.populateTrainerHTML();
	this.populateOptionsHTML();
	
	this.pop = new Pop(this.name, this.resultTrg);
	$("body").append(this.pop.getPopHTML());

	this.assignFunction("#" + this.playStopTrg, this.name + ".start()", this.playChar);
	this.remainedStimuli(this.engine.blocks["value"], this.engine.n["value"]);
	var selected = this.engine.audio["value"];
	this.loadNewAudio(selected, this.engine.audio["symbols"][selected]);
};

DNB.prototype.start = function() {

	this.playing = setTimeout(function() {

		_this.playBlock();
		_this.running = true;
		
	}, _this.engine.time["value"]/2);

	this.assignFunction("#" + this.playStopTrg, this.name + ".stop()", this.stopChar);
};

DNB.prototype.stop = function(n) {

	n = n || this.engine.n["value"];
	
	// START PATCH: FINISHED GAME INPUT
	$(".tile").each(function() {
		_this.wow(this, "reset", _this.engine.time["value"]/6);
	});
	// END PATCH: FINISHED GAME INPUT
	
	this.running = false;
	clearTimeout(this.playing);
	this.userScoreTemp 	= [0, 0, 0, 0, 0, 0];
	this.remainedStimuli(this.engine.blocks["value"], n);
	
	this.assignFunction("#" + this.playStopTrg, this.name + ".start()", this.playChar);
};

DNB.prototype.prepareBlock = function(n, blocks) {

	var thisBlock = [];
	
	for(var i = 0; i < this.engine.left["value"]; i++)
		thisBlock.push([0, 0]);
	
	var blockLength = thisBlock.length;

	var vis = 0;
	while(vis < blocks) {
		var visTarg = Math.floor(Math.random() * blockLength);
		if(thisBlock[visTarg + n] !== undefined) {
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
	
	var aud = 0;
	while(aud < blocks) {
		var audTarg = Math.floor(Math.random() * blockLength);
		if(thisBlock[audTarg + n] !== undefined) {
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
			if(thisBlock[x - n] !== undefined && thisBlock[x][0] == thisBlock[x - n][0]) {
				if(thisBlock[x][0] < 8)
					thisBlock[x][0] += 1;
				else
					thisBlock[x][0] -= 1;
			} else if(thisBlock[x + n] !== undefined && thisBlock[x][0] == thisBlock[x + n][0]) {
				if(thisBlock[x][0] < 8)
					thisBlock[x][0] += 1;
				else
					thisBlock[x][0] -= 1;
			}
		}
		if(thisBlock[x][1] == 0) {
			thisBlock[x][1] = 1 + Math.floor(Math.random() * 8);
			if(thisBlock[x - n] !== undefined && thisBlock[x][1] == thisBlock[x - n][1]) {
				if(thisBlock[x][1] < 8)
					thisBlock[x][1] += 1;
				else
					thisBlock[x][1] -= 1;
			} else if(thisBlock[x + n] !== undefined && thisBlock[x][1] == thisBlock[x + n][1]) {
				if(thisBlock[x][1] < 8)
					thisBlock[x][1] += 1;
				else
					thisBlock[x][1] -= 1;
			}
		}
	}
	return thisBlock;

};
// END PREPARE BLOCK FUNCTION

// EVALUATE BLOCK FUNCTION
DNB.prototype.evaluateBlock = function(block, n) {

	var vTargCount = 0;
	var aTargCount = 0;
	
	for(var i = 0; i < block.length; i++)
		if(block[i - n]) {
			if(block[i][0] == block[i - n][0])
				vTargCount += 1;
			if(block[i][1] == block[i - n][1])
				aTargCount += 1;
		}

	return [vTargCount, aTargCount];
};

// MAIN GAME FUNCTION
DNB.prototype.playBlock = function() {

	var currentBlock = this.prepareBlock(this.engine.n["value"], this.engine.blocks["value"]),
		blockEval = this.evaluateBlock(currentBlock, this.engine.n["value"]);
	
	while(blockEval[0] != this.engine.blocks["value"] && blockEval[1] != this.engine.blocks["value"]) {
		currentBlock = this.prepareBlock(this.engine.n["value"], this.engine.blocks["value"]);
		blockEval = this.evaluateBlock(currentBlock, this.engine.n["value"]);
	}
	
	console.log(currentBlock);
	console.log('%c matching blocks: ' + blockEval, 'color: blue');
	
	var blockCounter = -1,
		thisBlockLength = currentBlock.length,
		enable = [0, 0];
	
	(function playValue() {

		function isRightVisual(el) {
			if(enable[0] != 1 && _this.running) {
				enable[0] = 1;
				if(blockCounter + 1 > _this.engine.n["value"] && currentBlock[blockCounter][0]) {
					if(currentBlock[blockCounter][0] == currentBlock[blockCounter - _this.engine.n["value"]][0]) {
						console.log('%c right visual', 'color: blue');
						
						_this.wow(el, "right", _this.engine.time["value"]/6);
						_this.userScoreTemp[0] += 1;
					}
					else {
						console.log('%c wrong visual', 'color: red');
						
						_this.wow(el, "wrong", _this.engine.time["value"]/6);
						_this.userScoreTemp[2] += 1;
					}
				}
			}
		}
		
		function isRightAudio(el) {
			if(enable[1] != 1 && _this.running) {
				enable[1] = 1;
				if(blockCounter + 1 > _this.engine.n["value"] && currentBlock[blockCounter][1]) {
					if(currentBlock[blockCounter][1] == currentBlock[blockCounter - _this.engine.n["value"]][1]) {
						console.log('%c right audio', 'color: blue');
						
						_this.wow(el, "right", _this.engine.time["value"]/6);
						_this.userScoreTemp[3] += 1;
					}
					else {
						console.log('%c wrong audio', 'color: red');
						
						_this.wow(el, "wrong", _this.engine.time["value"]/6);
						_this.userScoreTemp[5] += 1;
					}
				}
			}
		}
		
		$("html").on("keydown", function(event) {
			if(event.which == 65)
				isRightVisual("#eye");
		});
		
		$("html").on("keydown", function(event) {
			if(event.which == 76)
				isRightAudio("#ear");
		});
		
		document.querySelector("#eye").addEventListener("touchstart", function() {
			isRightVisual("#eye");
		});
		
		document.querySelector("#ear").addEventListener("touchstart", function() {
			isRightAudio("#ear");
		});
		
		if(++blockCounter < thisBlockLength) {
			if(blockCounter > this.engine.n["value"]) {
				if(currentBlock[blockCounter - 1][0] == currentBlock[blockCounter - this.engine.n["value"] - 1][0] && currentBlock[blockCounter - 1][1] == currentBlock[blockCounter - this.engine.n["value"] - 1][1]) {
					if(enable[0] < 1 && enable[1] < 1) {
						console.log('%c both cues missed', 'color: orange');
						
						this.wow("#" + this.gridTrg, "missed", this.engine.time["value"]/6);
						this.userScoreTemp[1] += 1;
						this.userScoreTemp[4] += 1;
					}
				} else if(currentBlock[blockCounter - 1][0] == currentBlock[blockCounter - this.engine.n["value"] - 1][0]) {
					if(enable[0] < 1) {
						console.log('%c visual cue missed', 'color: orange');
						
						this.wow("#" + this.gridTrg, "missed", this.engine.time["value"]/6);
						this.userScoreTemp[1] += 1;
					}
				} else if(currentBlock[blockCounter - 1][1] == currentBlock[blockCounter - this.engine.n["value"] - 1][1]) {
					if(enable[1] < 1) {
						console.log('%c audio cue missed', 'color: orange');
						
						this.wow("#" + this.gridTrg, "missed", this.engine.time["value"]/6);
						this.userScoreTemp[4] += 1;
					}
				}
			}
			if(currentBlock[blockCounter]) {
				var blockLight = (currentBlock[blockCounter][0] < 5) ? currentBlock[blockCounter][0]  - 1 : currentBlock[blockCounter][0] ;
				this.wow(".tile:eq(" + blockLight + ")", "on", this.engine.time["value"]/6);
				this.loadedSounds[currentBlock[blockCounter][1] - 1].play();
			}
			
			console.log('%c block		: ' + currentBlock[blockCounter], 'color: black')
			console.log('%c keypresses	: ' + this.enable, 'color: green');
			console.log('%c score		: ' + this.userScoreTemp, 'color: green');
			
			this.engine.left["value"]--;
			this.updateN();
			
			this.playing = setTimeout(playValue.bind(this), this.engine.time["value"]);
			enable = [0, 0];
		}
		else {
			
			// PATCH
			this.userScoreTemp[1] = this.engine.blocks["value"] - this.userScoreTemp[0];
			this.userScoreTemp[4] = this.engine.blocks["value"] - this.userScoreTemp[3];
			
			if(this.userScoreTemp[1] < 0) {
				var visError = Math.abs(this.userScoreTemp[1]);
				this.userScoreTemp[0] -= visError;
				this.userScoreTemp[1] += visError;
			}
			if(this.userScoreTemp[4] < 0) {
				var audError = Math.abs(this.userScoreTemp[4]);
				this.userScoreTemp[3] -= audError;
				this.userScoreTemp[4] += audError;
			}
			// END PATCH
			
			var s = "";
			s += '<table class="results-icons">';
			s += '<tr><td colspan="2">Visual</td><td colspan="2">Audio</td></tr>';
			s += '<tr><td>☑</td><td>' + this.userScoreTemp[0] + '</td><td>☑</td><td>' + this.userScoreTemp[3] + '</td></tr>';
			s += '<tr><td>☐</td><td>' + this.userScoreTemp[1] + '</td><td>☐</td><td>' + this.userScoreTemp[4] + '</td></tr>';
			s += '<tr><td>☒</td><td>' + this.userScoreTemp[2] + '</td><td>☒</td><td>' + this.userScoreTemp[5] + '</td></tr>';
			s += '</table>'
			
			$("#" + this.resultTrg).html(s);
			
			var incorrect = this.userScoreTemp[1] + this.userScoreTemp[2],
				threshold = this.engine.blocks["value"]*(1-this.engine.threshold["value"]),
				upperThreshold = Math.ceil(threshold),
				lowerThreshold = Math.floor(threshold);
			
			if(incorrect <= lowerThreshold) {

				$("#" + this.resultTrg).append('<p class="results-text">N is now:<br>' + ++this.engine.n["value"] + '</p>');
				
			} else if(incorrect > upperThreshold) {
				
				if(this.engine.n["value"] != 1) {
					
					$("#" + this.resultTrg).append('<p class="results-text">N is now:<br>' + --this.engine.n["value"] + '</p>');
					
				} else {
					
					$("#" + this.resultTrg).append('<p class="results-text">N stays: 1<br>Keep trying</p>');
				}
			} else {
				
				$("#" + this.resultTrg).append('<p class="results-text">N stays: ' + this.engine.n["value"] + '<br>Keep trying</p>');
			}
			
			this.userScoreTemp = [0, 0, 0, 0, 0, 0];
			
			this.stop(this.engine.n["value"]);
			setTimeout(this.pop.yes(), 400);
		}
	}.bind(this))();
};

function Pop(objName, innerId) {
	this.objName = objName + ".pop";
    this.id = objName + "-popup";
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
    s += 	'<button onclick="' + this.objName + '.no()" style="z-index:40" class="btn-popup">✖</button>';
	s += '</div>';
    return s;
};