function Engine(name) {
    this.name = name;
    this.results = new Pop(this.name + ".results", "results");
    this.progress = new Progress("progress", "1vh", "rgba(0, 0, 0, 0.33)", "#fff");
    this.chartist = new Pop(this.name + ".chartist", "chart");
	this.version = "DNB_1.0.0.0";
	this.dataContainer = {};
	this.today = (new Date).ddmmyy();
    this.left = 0;
    this.time = {
        type: "range",
        target: "stimulus-time",
        text: "Stimulus:",
        value: 3000,
        min: 1500,
        step: 250,
        MAX: 4500,
        char: "ms"
    };
    this.blocks = {
        type: "range",
        target: "matching-blocks",
        text: "Matching:",
        value: 8,
        min: 4,
        step: 1,
        MAX: 12
    };
    this.n = {
        type: "range",
        target: "n-back",
        text: "N-back:",
        value: 2,
        min: 1,
        step: 1,
        MAX: 10
    };
    this.threshold = {
        type: "range",
        target: "success-threshold",
        text: "Threshold:",
        value: 0.8,
        min: 0.6,
        step: 0.05,
        MAX: 1.0,
        char: "%",
        change: function (x) {
            return x * 100;
        }
    };
    this.feedback = {
        type: "range",
        target: "feedback",
        text: "Feedback:",
        value: 1,
        min: 0,
        step: 1,
        MAX: 1,
        change: function (x) {
            return (x === 1) ? "on" : "off";
        }
    };
    this.rotation = {
        type: "range",
        target: "rotation-duration",
        text: "Rotation:",
        value: 5,
        min: 5,
        step: 5,
        MAX: 90,
        char: "s",
        direction: function () {
            return (Math.floor(Math.random() * 2) === 0) ? "-clockwise" : "-anticlockwise";
        }
    };
	this.kaleidoscope = {
        type: "range",
        target: "kaleidoscope",
        text: "Kaleidos:",
        value: 0,
        min: 0,
        step: 1,
        MAX: 1,
        change: function (x) {
            return (x === 1) ? "on" : "off";
        }
    };
	this.focusPoint = {
        type: "range",
        target: "focus-point",
        text: "Focus Point:",
        value: 0,
        min: 0,
        step: 1,
        MAX: 1,
        change: function (x) {
            return (x === 1) ? "on" : "off";
        }
    };
    this.invertColor = {
        type: "range",
        target: "invert-color",
        text: "Invert Color:",
        value: 0,
        min: 0,
        step: 1,
        MAX: 1,
        change: function (x) {
            return (x === 1) ? "on" : "off";
        }
    };
    this.audio = {
        type: "selector",
        target: "audio-selection",
        text: "Audio:",
        value: "Numbers",
        selection: {
            "Numbers": [1, 2, 3, 4, 5, 6, 7, 8],
            "Letters": ["c", "h", "k", "l", "q", "r", "s", "t"],
            "Piano": ["A4", "B4", "C4", "C5", "D4", "E4", "F4", "G4"]
        }
    };
    this.colorMap = ["white", "green", "red", "aqua", "black", "orange", "yellow", "blue"]
    this.loadedSounds = [];
}
Engine.prototype.drawChart = function () {
    var that = this;
	this.progress.move(this.dataContainer[this.today].runs / 20 * 100);
    var MAXS = [];
    var avgs = [];
    var mins = [];
    $.each(this.dataContainer, function (key, value) {
        if (that.MAX(value.data) !== undefined) {
            MAXS.push(that.MAX(value.data));
        }
    });
    $.each(this.dataContainer, function (key, value) {
        if (that.avg(value.data) !== undefined) {
            avgs.push(that.avg(value.data));
        }
    });
    $.each(this.dataContainer, function (key, value) {
        if (that.min(value.data) !== undefined) {
            mins.push(that.min(value.data));
        }
    });
    if (avgs.length === 0) {
        setTimeout(function () {
            alert("There are insufficient data to construct the graph.");
        }, 400);
    } else {
        this.chartist.yes();
    }
    return new Chartist.Line("#chart", {
        series: [MAXS, avgs, mins]
    }, {
        fullWidth: true,
        axisX: {
            onlyInteger: true
        },
        axisY: {
            onlyInteger: true,
            high: 9,
            low: 1,
            ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        chartPadding: {
            top: 40,
            right: 40
        }
    });
};
Engine.prototype.getLayoutHTML = function () {
    var s = "";
    s += "<ul id=\"navigation\"></ul>";
    s += "<input type=\"checkbox\" id=\"nav-trigger\"/>";
    s += "<label for=\"nav-trigger\"></label>";
    s += "<div id=\"site-wrap\">";
	s += "<div class=\"kale-ntainer\"><section class=\"sect-1\"></section><section class=\"sect-2\"></section><section class=\"sect-3\"></section><section class=\"sect-4\"></section><section class=\"sect-5\"></section><section class=\"sect-6\"></section><section class=\"sect-7\"></section><section class=\"sect-8\"></section><section class=\"sect-9\"></section><section class=\"sect-10\"></section><section class=\"sect-11\"></section><section class=\"sect-12\"></section></div>";
	s += "</div>";
    return s;
};
Engine.prototype.populateNavigation = function () {
    var s = "";
    s += "<li class=\"nav-item\">";
    s += "<p id=\"N-level\">N = " + this.n.value + "</p>";
    s += "</li>";
    $("#navigation").append(s);
    for (var key in this) {
        if (this.hasOwnProperty(key)) {
            if (this[key].type === "range" || this[key].type === "selector") {
                if (this[key].type === "range") {
                    var ch = (this[key].char) ? this[key].char : "";
                    var txt = (this[key].change) ? this[key].change(this[key].value) + ch : this[key].value + ch;
                    s += "<li class=\"nav-item\">";
                    s += "<span class=\"range-label\">" + this[key].text + " </span><span id=" + this[key].target + "-span class=\"range-label\">" + txt + "</span>";
                    s += "<input type=\"range\" class=\"slider\" id=" + this[key].target + " min=" + this[key].min + " max=" + this[key].MAX + " step=" + this[key].step + " value=" + this[key].value + ">";
                    s += "</li>";
                } else if (this[key].type === "selector") {
                    s += "<li class=\"nav-item\">";
                    s += "<label for=" + this[key].target + ">" + this[key].text + "</label>";
                    s += "<select class=\"option\" id=" + this[key].target + ">";
                    for (var subkey in this[key].selection) {
                        s += "<option>" + subkey + "</option>";
                    }
                    s += "</select>";
                    s += "</li>";
                }
                $("#navigation").append(s);
                this.onSettingChange(this, key);
            }
        }
        s = "";
    }
    s += "<li class=\"nav-item\">";
    s += "<p><span style=\"color: #ffd700\">Controls:</span><br>\"A\" for visual<br>\"L\" for audio</br>\"S\" to start/stop</br></br></p>";
    s += "</li>";
    $("#navigation").append(s);
};
Engine.prototype.onSettingChange = function (obj, key) {
    var that = this;
    var el = "#" + obj[key].target;
    if (obj[key].type === "range") {
        this.onChangeAttacher(el, function () {
            obj[key].value = Number($("#" + obj[key].target).val());
            $("#" + obj[key].target + "-span").text(obj[key].value);
        });
    } else if (obj[key].type === "selector") {
        this.onChangeAttacher(el, function () {
            obj[key].value = $("#" + obj[key].target).val();
        });
    }
    if (obj[key].change || obj[key].char) {
        this.onChangeAttacher(el, function () {
            var ch = (obj[key].char) ? obj[key].char : "";
            var txt = (obj[key].change) ? obj[key].change(obj[key].value) + ch : obj[key].value + ch;
            $("#" + obj[key].target + "-span").text(txt);
        });
    }
    if (key === "blocks" || key === "n") {
        this.onChangeAttacher(el, function () {
            if (that.running) {
                that.stop();
            } else {
                that.calculateStimuli(that.blocks.value, that.n.value);
            }
        });
    } else if (key === "rotation") {
        this.onChangeAttacher(el, function () {
            var grid = $("#grid");
            grid.attr("style", "animation: rotating" + obj[key].direction() + " " + obj[key].value + "s linear infinite;");
            if (obj[key].value === obj[key].min) {
                $("#" + obj[key].target + "-span").text("off");
                grid.removeClass("rotational-grid");
                grid.attr("style", "");
            } else if (!grid.hasClass("rotational-grid")) {
                grid.addClass("rotational-grid");
                grid.attr("style", "animation: rotating" + obj[key].direction() + " " + obj[key].value + "s linear infinite;");
            }
        });
    } else if (key === "audio") {
        this.onChangeAttacher(el, function () {
            var sel = obj[key].value;
            that.howlerizer(sel, obj[key].selection[sel]);
        });
    } else if (key === "focusPoint") {
		this.onChangeAttacher(el, function () {
			(obj[key].value === 1) ? $(".tile:eq(4)").append("<div class=\"dot\"></div>") : $(".tile:eq(4)").empty();
        });
	} else if (key === "kaleidoscope") {
		this.onChangeAttacher(el, function () {
			if (obj[key].value === 1) {
				var rnd = Math.ceil(Math.random() * 3);
				$("section").css('background-image', 'url("img/' + rnd + '.jpg")');
			} else {
				$("section").css('background-image', '');
			}
        });
	} else if (key === "invertColor") {
		this.onChangeAttacher(el, function () {
			if (obj[key].value === 1) {
				$("#site-wrap").addClass('invert');
				$('label[for="nav-trigger"]').css('background-image', "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' x='0px' y='0px' width='30px' height='30px' viewBox='0 0 30 30' enable-background='new 0 0 30 30' xml:space='preserve'><rect fill='rgba(0, 0, 0, 0.75)' width='30' height='6'/><rect fill='rgba(0, 0, 0, 0.75)' y='24' width='30' height='6'/><rect fill='rgba(0, 0, 0, 0.75)' y='12' width='30' height='6'/></svg>\")");
			} else {
				$("#site-wrap").removeClass('invert');
				$('label[for="nav-trigger"]').css('background-image', "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' x='0px' y='0px' width='30px' height='30px' viewBox='0 0 30 30' enable-background='new 0 0 30 30' xml:space='preserve'><rect fill='rgba(255, 255, 255, 0.75)' width='30' height='6'/><rect fill='rgba(255, 255, 255, 0.75)' y='24' width='30' height='6'/><rect fill='rgba(255, 255, 255, 0.75)' y='12' width='30' height='6'/></svg>\")");
			}
        });
	}
};
Engine.prototype.onChangeAttacher = function (el, foo) {
    $(el).on("change", foo);
};
Engine.prototype.populateSiteWrap = function () {
    var s = "";
    s += "<div id=\"status-bar\">";
    s += "<div id=\"left-stimuli\">" + this.left + "</div>";
    s += "</div>";
    s += "<button type=\"button\" id=\"engine-button\" class=\"btn-standard\"></button>";
    s += "<table id=\"grid\">";
    for (var i = 0; i < 3; i++) {
        s += "<tr>";
        for (var j = 0; j < 3; j++) {
            s += "<td><div class=\"tile\"></div></td>";
        }
        s += "</tr>";
    }
    s += "</table>";
    s += "<div id=\"eye-btn\"></div>";
    s += "<div id=\"ear-btn\"></div>";
    $("#site-wrap").append(s);
};
Date.prototype.ddmmyy = function () {
    var dd = this.getDate();
    var mm = this.getMonth() + 1;
    return [
        (dd > 9 ? "" : "0") + dd, (mm > 9 ? "" : "0") + mm, this.getFullYear()
    ].join("/");
};
Engine.prototype.functionizer = function (e, f, t) {
    $(e).prop("onclick", null).attr("onclick", f);
    $(e).text(t);
};
Engine.prototype.load = function () {
    this.dataContainer = JSON.parse(localStorage[this.version]);
};
Engine.prototype.save = function () {
    localStorage[this.version] = JSON.stringify(this.dataContainer);
};
Engine.prototype.initData = function (date) {
	if (this.dataContainer[date] === undefined) {
		this.dataContainer[date] = {"runs": 0, "data": []};
	}
	this.save();
};
Engine.prototype.updateData = function (go_to, n) {
	this.dataContainer[this.today].runs = go_to;
	if (n !== undefined) {
		this.dataContainer[this.today].data.push(n);
	}
	this.save();
};
Engine.prototype.MAX = function (array) {
    if (array.length >= 2) {
        return array.reduce(function (a, b) {
            return (a > b ? a : b);
        });
    } else if (array[0] !== undefined) {
        return array[0];
    }
};
Engine.prototype.avg = function (array) {
    if (array.length >= 2) {
        return array.reduce(function (a, b) {
            return a + b;
        }) / array.length;
    } else if (array[0] !== undefined) {
        return array[0];
    }
};
Engine.prototype.min = function (array) {
    if (array.length >= 2) {
        return array.reduce(function (a, b) {
            return (a < b ? a : b);
        });
    } else if (array[0] !== undefined) {
        return array[0];
    }
};
Engine.prototype.update = function (n) {
    if (n) {
        $("#" + this.n.target).val(n);
        $("#" + this.n.target + "-span").text(n);
        $("#N-level").html("N = " + n);
    }
    $("#left-stimuli").html(this.left);
};
Engine.prototype.howlerizer = function (dir, a) {
    var that = this;
    this.loadedSounds = [];
    a.forEach(function (el) {
        that.loadedSounds.push(new Howl({
            src: ["snd/" + dir.replace(/\s/g, "-") + "/" + el + ".wav"]
        }));
    });
};
Engine.prototype.wow = function (s, c, t) {
    if(c.indexOf("_") !== false) {
      $(s).css("background", c.replace("_", ""));
      setTimeout(function () {
          $(s).removeAttr("style");
      }, t);
    } else {
      $(s).addClass(c);
      setTimeout(function () {
          $(s).removeClass(c);
      }, t);
    }
};
Engine.prototype.savedataInit = function () {
    if (!localStorage[this.version]) {
		this.initData(this.today);
    } else {
        this.load();
		this.initData(this.today);
    }
};
Engine.prototype.markupInit = function () {
    $("body").append(this.getLayoutHTML(), this.results.getPopHTML(), this.chartist.getPopHTML());
    $("#site-wrap").append("<button onclick=" + this.name + ".drawChart() style=\"z-index:50\" class=\"btn-popup reflected\">★</button>");
    $("#" + this.results.id).append(this.progress.getProgressHTML());
	$("#" + this.chartist.id).append(this.progress.getProgressHTML());
    this.populateSiteWrap();
    this.populateNavigation();
    this.calculateStimuli(this.blocks.value, this.n.value);
    this.functionizer("#engine-button", this.name + ".start()", "Play");
};
Engine.prototype.eventsInit = function () {
    var that = this;
	$("#" + this.rotation.target).trigger("change");
    var sel = this.audio.value;
    this.howlerizer(sel, this.audio.selection[sel]);
    this.reset();
    var keyAllowed = {};
    $(document).keydown(function (e) {
        e.stopPropagation();
        if (keyAllowed[e.which] === false) {
            return;
        }
        keyAllowed[e.which] = false;
        var keyCode = e.keyCode || e.which;
        switch (keyCode) {
        case 65:
            that.checkBlock.call(that, "visual");
            break;
        case 76:
            that.checkBlock.call(that, "audio");
            break;
		case 83:
			if (that.results.isOpened) {
				that.results.no();
			}
			if (that.chartist.isOpened) {
				that.chartist.no();
			}
            $("#engine-button").click();
            break;
        default:
            return;
        }
    });
    $(document).keyup(function (e) {
        keyAllowed[e.which] = true;
    });
    document.querySelector("#eye-btn").addEventListener("touchstart", function (e) {
        e.preventDefault();
        that.checkBlock.call(that, "visual");
    }, false);
    document.querySelector("#eye-btn").addEventListener("click", function (e) {
        e.preventDefault();
        that.checkBlock.call(that, "visual");
    }, false);
    document.querySelector("#ear-btn").addEventListener("touchstart", function (e) {
        e.preventDefault();
        that.checkBlock.call(that, "audio");
    }, false);
    document.querySelector("#ear-btn").addEventListener("click", function (e) {
        e.preventDefault();
        that.checkBlock.call(that, "audio");
    }, false);
};
Engine.prototype.reset = function () {
    this.running = false;
    this.currBlock = [];
    this.currBlockLen = 0;
    this.blockCounter = -1;
    this.enable = [0, 0];
    this.userScore = [0, 0, 0, 0, 0, 0];
};
Engine.prototype.start = function () {
    var that = this;
    this.running = true;
    this.playing = setTimeout(function () {
        that.createBlock.call(that);
        that.playBlock.call(that);
    }, this.time.value / 4);
    this.functionizer("#engine-button", this.name + ".stop()", "Stop");
};
Engine.prototype.stop = function (n) {
    n = n || this.n.value;
    clearTimeout(this.playing);
    this.reset();
    this.calculateStimuli(this.blocks.value, n);
    this.functionizer("#engine-button", this.name + ".start()", "Play");
};
Engine.prototype.calculateStimuli = function (blocks, n) {
    this.left = blocks * (n + 1);
    this.update(n);
};
Engine.prototype.prepareBlock = function (n, left, blocks) {
    var thisBlock = [];
    for (var i = 0; i < left; i++) {
        thisBlock.push([0, 0]);
    }
    var blockLength = thisBlock.length;
    var vis = 0;
    var aud = 0;
    var visTarg;
    var audTarg;
    while (vis < blocks) {
        visTarg = Math.floor(Math.random() * blockLength);
        if (thisBlock[visTarg + n]) {
            if (thisBlock[visTarg][0] === 0 && thisBlock[visTarg + n][0] === 0) {
                thisBlock[visTarg][0] = 1 + Math.floor(Math.random() * 8);
                thisBlock[visTarg + n][0] = thisBlock[visTarg][0];
                vis++;
            } else if (thisBlock[visTarg][0] !== 0 && thisBlock[visTarg + n][0] === 0) {
                thisBlock[visTarg + n][0] = thisBlock[visTarg][0];
                vis++;
            } else if (thisBlock[visTarg][0] === 0 && thisBlock[visTarg + n][0] !== 0) {
                thisBlock[visTarg][0] = thisBlock[visTarg + n][0];
                vis++;
            } else {
                continue;
            }
        } else {
            continue;
        }
    }
    while (aud < blocks) {
        audTarg = Math.floor(Math.random() * blockLength);
        if (thisBlock[audTarg + n]) {
            if (thisBlock[audTarg][1] === 0 && thisBlock[audTarg + n][1] === 0) {
                thisBlock[audTarg][1] = 1 + Math.floor(Math.random() * 8);
                thisBlock[audTarg + n][1] = thisBlock[audTarg][1];
                aud++;
            } else if (thisBlock[audTarg][1] !== 0 && thisBlock[audTarg + n][1] === 0) {
                thisBlock[audTarg + n][1] = thisBlock[audTarg][1];
                aud++;
            } else if (thisBlock[audTarg][1] === 0 && thisBlock[audTarg + n][1] !== 0) {
                thisBlock[audTarg][1] = thisBlock[audTarg + n][1];
                aud++;
            } else {
                continue;
            }
        } else {
            continue;
        }
    }
    for (var x = 0; x < blockLength; x++) {
        if (thisBlock[x][0] === 0) {
            thisBlock[x][0] = 1 + Math.floor(Math.random() * 8);
            if (thisBlock[x - n] && thisBlock[x][0] === thisBlock[x - n][0]) {
                (thisBlock[x][0] < 8) ? thisBlock[x][0] += 1: thisBlock[x][0] -= 1;
            } else if (thisBlock[x + n] && thisBlock[x][0] === thisBlock[x + n][0]) {
                (thisBlock[x][0] < 8) ? thisBlock[x][0] += 1: thisBlock[x][0] -= 1;
            }
        }
        if (thisBlock[x][1] === 0) {
            thisBlock[x][1] = 1 + Math.floor(Math.random() * 8);
            if (thisBlock[x - n] && thisBlock[x][1] === thisBlock[x - n][1]) {
                (thisBlock[x][1] < 8) ? thisBlock[x][1] += 1: thisBlock[x][1] -= 1;
            } else if (thisBlock[x + n] && thisBlock[x][1] === thisBlock[x + n][1]) {
                (thisBlock[x][1] < 8) ? thisBlock[x][1] += 1: thisBlock[x][1] -= 1;
            }
        }
    }
    return thisBlock;
};
Engine.prototype.evaluateBlock = function (block, n) {
    var v = 0;
    var a = 0;
    for (var i = 0; i < block.length; i++) {
        if (block[i - n]) {
            if (block[i][0] === block[i - n][0]) {
                v += 1;
            }
            if (block[i][1] === block[i - n][1]) {
                a += 1;
            }
        }
    }
    return [v, a];
};
Engine.prototype.checkBlock = function (c) {
    var p = (c === "visual") ? 0 : 1;
    var e = (c === "visual") ? "#eye-btn" : "#ear-btn";
    var r = (c === "visual") ? 0 : 3;
    var w = (c === "visual") ? 2 : 5;
    if (this.enable[p] !== 1 && this.running) {
        this.enable[p] = 1;
        if (this.blockCounter + 1 > this.n.value && this.currBlock[this.blockCounter]) {
            if (this.currBlock[this.blockCounter][p] === this.currBlock[this.blockCounter - this.n.value][p]) {
                console.log("%c right " + c, "color: blue");
                if (this.feedback.value) {
					if (this.invertColor.value) {
						this.wow(e, "right-inverted", this.time.value / 6);
					} else {
						this.wow(e, "right", this.time.value / 6);
					}
                }
                this.userScore[r] += 1;
            } else {
                console.log("%c wrong " + c, "color: red");
                if (this.feedback.value) {
					if (this.invertColor.value) {
						this.wow(e, "wrong-inverted", this.time.value / 6);
					} else {
						this.wow(e, "wrong", this.time.value / 6);
					}
                }
                this.userScore[w] += 1;
            }
        }
    }
};
Engine.prototype.createBlock = function () {
    var blockEval = this.evaluateBlock(this.currBlock, this.n.value);
    this.currBlock = this.prepareBlock(this.n.value, this.left, this.blocks.value);
    while (blockEval[0] !== this.blocks.value || blockEval[1] !== this.blocks.value) {
        this.currBlock = this.prepareBlock(this.n.value, this.left, this.blocks.value);
        blockEval = this.evaluateBlock(this.currBlock, this.n.value);
    }
    this.currBlockLen = this.currBlock.length;
    console.log(this.currBlock);
    console.log("%c matching blocks: " + blockEval, "color: blue");
};
Engine.prototype.playBlock = function () {
    if (++this.blockCounter < this.currBlockLen) {
        if (this.blockCounter > this.n.value) {
            if (this.currBlock[this.blockCounter - 1][0] === this.currBlock[this.blockCounter - this.n.value - 1][0] && this.currBlock[this.blockCounter - 1][1] === this.currBlock[this.blockCounter - this.n.value - 1][1]) {
                if (this.enable[0] < 1 && this.enable[1] < 1) {
                    console.log("%c both cues missed", "color: orange");
                    if (this.feedback.value) {
						if (this.invertColor.value) {
							this.wow("#eye-btn", "missed-inverted", this.time.value / 6);
							this.wow("#ear-btn", "missed-inverted", this.time.value / 6);
						} else {
							this.wow("#eye-btn", "missed", this.time.value / 6);
							this.wow("#ear-btn", "missed", this.time.value / 6);
						}
                    }
                    this.userScore[1] += 1;
                    this.userScore[4] += 1;
                }
            } else if (this.currBlock[this.blockCounter - 1][0] === this.currBlock[this.blockCounter - this.n.value - 1][0]) {
                if (this.enable[0] < 1) {
                    console.log("%c visual cue missed", "color: orange");
                    if (this.feedback.value) {
                        if (this.invertColor.value) {
							this.wow("#eye-btn", "missed-inverted", this.time.value / 6);
						} else {
							this.wow("#eye-btn", "missed", this.time.value / 6);
						}
                    }
                    this.userScore[1] += 1;
                }
            } else if (this.currBlock[this.blockCounter - 1][1] === this.currBlock[this.blockCounter - this.n.value - 1][1]) {
                if (this.enable[1] < 1) {
                    console.log("%c audio cue missed", "color: orange");
                    if (this.feedback.value) {
                        if (this.invertColor.value) {
							this.wow("#ear-btn", "missed-inverted", this.time.value / 6);
						} else {
							this.wow("#ear-btn", "missed", this.time.value / 6);
						}
                    }
                    this.userScore[4] += 1;
                }
            }
        }
        if (this.currBlock[this.blockCounter]) {
            var blockLight = (this.currBlock[this.blockCounter][0] < 5) ? this.currBlock[this.blockCounter][0] - 1 : this.currBlock[this.blockCounter][0];
            this.wow(".tile:eq(" + blockLight + ")", "_" + this.colorMap[this.currBlock[this.blockCounter][1] - 1], this.time.value / 6);
            this.loadedSounds[this.currBlock[this.blockCounter][1] - 1].play();
        }
        console.log("%c id : #" + this.blockCounter, "color: black");
        console.log("%c value : " + this.currBlock[this.blockCounter], "color: black");
        console.log("%c keypresses : " + this.enable, "color: green");
        console.log("%c score : " + this.userScore, "color: green");
        this.left--;
        this.update();
        this.playing = setTimeout(this.playBlock.bind(this), this.time.value);
        this.enable = [0, 0];
    } else {
        this.userScore[1] = this.blocks.value - this.userScore[0];
        this.userScore[4] = this.blocks.value - this.userScore[3];
        var s = "";
        s += "<table class=\"results-icons\">";
        s += "<tr><td colspan=\"2\">Visual</td><td colspan=\"2\">Audio</td></tr>";
        s += "<tr><td>☑</td><td>" + this.userScore[0] + "</td><td>☑</td><td>" + this.userScore[3] + "</td></tr>";
        s += "<tr><td>☐</td><td>" + this.userScore[1] + "</td><td>☐</td><td>" + this.userScore[4] + "</td></tr>";
        s += "<tr><td>☒</td><td>" + this.userScore[2] + "</td><td>☒</td><td>" + this.userScore[5] + "</td></tr>";
        s += "</table>";
        $("#results").html(s);
        var incorrectVis = this.userScore[1] + this.userScore[2];
        var incorrectAud = this.userScore[4] + this.userScore[5];
        var threshold = this.blocks.value * (1 - this.threshold.value);
        var upperThreshold = Math.ceil(threshold);
        var lowerThreshold = Math.floor(threshold);
		var old_runs = this.dataContainer[this.today].runs;
        if (incorrectVis <= lowerThreshold && incorrectAud <= lowerThreshold) {
			this.updateData(++old_runs, this.n.value);
            $("#results").append("<p class=\"results-text\">N is now: " + ++this.n.value + "</p>");
        } else if (incorrectVis <= upperThreshold || incorrectAud <= upperThreshold) {
			this.updateData(++old_runs, this.n.value);
            $("#results").append("<p class=\"results-text\">N stays: " + this.n.value + "<br>Keep trying</p>");
        } else {
			this.updateData(++old_runs);
            if (this.n.value !== 1) {
                $("#results").append("<p class=\"results-text\">N is now: " + --this.n.value + "<br>N won't be indexed</p>");
            } else {
                $("#results").append("<p class=\"results-text\">N stays: 1<br>N won't be indexed<br>Keep trying</p>");
            }
        }
        this.stop(this.n.value);
        this.results.yes();
        this.progress.move(this.dataContainer[this.today].runs / 20 * 100);
    }
};

function Pop(name, innerId) {
    this.name = name;
	this.isOpened = 0;
    this.id = (this.name + "-popup").replace(/\./g, "-");
    this.innerId = innerId;
}
Pop.prototype.yes = function () {
    var el = document.getElementById(this.id);
    el.style.opacity = 1;
    el.style.height = 100 + "vh";
    el.style.width = 100 + "vw";
    var cont = document.getElementById(this.innerId);
    cont.style.display = "block";
	this.isOpened = 1;
};
Pop.prototype.no = function () {
    var el = document.getElementById(this.id);
    el.style.opacity = 0;
    el.style.height = 0;
    el.style.width = 0;
    var cont = document.getElementById(this.innerId);
    cont.style.display = "none";
    cont.innerHTML = "";
	this.isOpened = 0;
};
Pop.prototype.getPopHTML = function (inStr) {
    var s = "";
    s += "<div id=" + this.id + " class=\"pop\" style=\"opacity:0; height:0; width:0\">";
    s += "<div id=" + this.innerId + ">";
    if (inStr) {
        s += inStr;
    }
    s += "</div>";
    s += "<button onclick=" + this.name + ".no() style=\"z-index:50\" class=\"btn-popup normal\">✖</button>";
    s += "</div>";
    return s;
};

function Progress(name, height, background, color) {
    this.name = name;
    this.progressClass = this.name + "-outer";
    this.barClass= this.name + "-inner";
    this.height = height;
    this.background = background;
    this.color = color;
    this.stored = 0;
}
Progress.prototype.getProgressHTML = function () {
    var s = "";
    s += "<div class=" + this.progressClass + " style=\"position:absolute; z-index:40; width:100%; height:" + this.height + "; top:0; left:0; background-color:" + this.background + "\">";
    s += "<div class=" + this.barClass + " style=\"position:absolute; width:0; height:100%; background-color:" + this.color + "\"></div>";
    s += "</div>";
    return s;
};
Progress.prototype.move = function (curr) {
    this.current = curr;
	that = this;
	Array.prototype.forEach.call(document.getElementsByClassName(this.barClass), function (item, index) {
		that.advance = function () {
			if (that.stored >= that.current) {
				clearInterval(that.interval);
			} else {
				that.stored++;
				item.style.width = that.stored + "%";
			}
		}
		that.interval = setInterval(that.advance.bind(that), 10);
	});
};
