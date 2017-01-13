function Engine(name) {

    this.name = name;
    this.optionsTrg = "navigation";
    this.trainerTrg = "site-wrap";
    this.gridTrg = "grid";
    this.resultsTrg = "results";
    this.chartistTrg = "chart";
    this.btnTrg = "engine-button";
    this.playSymbol = "Play";
    this.stopSymbol = "Stop";

    this.results = new Pop(this.name + ".results", this.resultsTrg);
    this.progress = new Progress("progress", "1vh", "transparent", "#fff");
    this.runs = 0;

    this.chartist = new Pop(this.name + ".chartist", this.chartistTrg);
    this.hist = {};

    this.left = {
        target: "left",
        value: 0
    };
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
        value: 6,
        min: 3,
        step: 1,
        MAX: 9
    };
    this.n = {
        type: "range",
        target: "n-back",
        text: "N-back:",
        value: 2,
        min: 1,
        step: 1,
        MAX: 9
    };
    this.threshold = {
        type: "range",
        target: "success-threshold",
        text: "Threshold:",
        value: 0.8,
        min: 0.7,
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
        value: 60,
        min: 30,
        step: 10,
        MAX: 120,
        char: "s",
        direction: function () {
            return (Math.floor(Math.random() * 2) === 0) ? "-clockwise" : "-anticlockwise";
        }
    };
    this.audio = {
        type: "selector",
        target: "audio-selection",
        text: "Audio:",
        value: "Natural Numbers",
        selection: {
            "Natural Numbers": [1, 2, 3, 4, 5, 6, 7, 8],
            "Prime Numbers": [2, 3, 5, 7, 11, 13, 17, 19]
        }
    };
    this.loadedSounds = [];
}

Engine.prototype.drawChart = function () {
    var that = this;
    var MAXS = [];
    var avgs = [];
    var mins = [];

    $.each(this.hist, function (key, value) {
        if (that.MAX(value) !== undefined) {
            MAXS.push(that.MAX(value));
        }
    });
    $.each(this.hist, function (key, value) {
        if (that.avg(value) !== undefined) {
            avgs.push(that.avg(value));
        }
    });
    $.each(this.hist, function (key, value) {
        if (that.min(value) !== undefined) {
            mins.push(that.min(value));
        }
    });
    if (avgs.length === 0) {
        setTimeout(function () {
            alert("No data");
        }, 400);
    } else {
        this.chartist.yes();
    }


    return new Chartist.Line("#" + this.chartistTrg, {
        labels: Object.keys(this.hist),
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
    }, [
        ["screen and (min-width: 481px) and (max-width: 1200px)", {
            axisX: {
                labelInterpolationFnc: function (value) {
                    return value;
                }
            }
        }],
        ["screen and (max-width: 480px)", {
            axisX: {
                labelInterpolationFnc: function (value) {
                    return value.substring(0, 2);
                }
            }
        }]
    ]);
};

Engine.prototype.getLayoutHTML = function () {
    var s = "";
    s += "<ul class=" + this.optionsTrg + "></ul>";
    s += "<input type=\"checkbox\" id=\"nav-trigger\" class=\"nav-trigger\"/>";
    s += "<label for=\"nav-trigger\"></label>";
    s += "<div class=" + this.trainerTrg + "></div>";
    return s;
};

Engine.prototype.populateOptionsHTML = function () {
    var s = "";
    s += "<li class=\"nav-item\">";
    s += "<p id=\"level\">N = " + this.n.value + "</p>";
    s += "</li>";
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
                $("." + this.optionsTrg).append(s);
                this.onSettingChange(this, key);
            }
        }
        s = "";
    }
    s += "<li class=\"nav-item\">";
    s += "<p>Controls:<br>\"A\" key for visual<br>\"L\" key for audio.</p>";
    s += "</li>";
    $("." + this.optionsTrg).append(s);
};

Engine.prototype.onSettingChange = function (obj, key) {
    var that = this;
    var el = "#" + obj[key].target;

    if (obj[key].type === "range") {
        this.onChangeAttacher(el, function () {
            obj[key].value = Number($("#" + obj[key].target).val());
        });
        if ($("#" + obj[key].target + "-span")) {
            this.onChangeAttacher(el, function () {
                $("#" + obj[key].target + "-span").text(obj[key].value);
            });
        }
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
            var grid = $("#" + that.gridTrg);
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
    }
};

Engine.prototype.onChangeAttacher = function (el, foo) {
    $(el).on("change", foo);
};

Engine.prototype.populateTrainerHTML = function () {
    var s = "";
    s += "<div id=\"status-bar\">";
    s += "<div id=" + this.left.target + ">" + this.left.value + "</div>";
    s += "</div>";
    s += "<button type=\"button\" id=" + this.btnTrg + " class=\"btn-standard\"></button>";
    s += "<table id=" + this.gridTrg + " class=\"rotational-grid\" style=\"animation: rotating" + this.rotation.direction() + " " + this.rotation.value + "s linear infinite;\">";
    for (var i = 0; i < 3; i++) {
        s += "<tr>";
        for (var j = 0; j < 3; j++) {
            s += "<td><div class=\"tile\"></div></td>";
        }
        s += "</tr>";
    }
    s += "</table>";
    s += "<div id=\"eye\"></div>";
    s += "<div id=\"ear\"></div>";
    $("." + this.trainerTrg).append(s);
};

Date.prototype.ddmm = function () {
    var dd = this.getDate();
    var mm = this.getMonth() + 1;

    return [
        (dd > 9 ? "" : "0") + dd,
        (mm > 9 ? "" : "0") + mm
    ].join("/");
};

Engine.prototype.functionizer = function (e, f, t) {
    $(e).prop("onclick", null).attr("onclick", f);
    $(e).text(t);
};

Engine.prototype.load = function () {
    this.hist = JSON.parse(localStorage["andrey-pozdnyakov-lrdn"]);
};

Engine.prototype.save = function () {
    localStorage["andrey-pozdnyakov-lrdn"] = JSON.stringify(this.hist);
};

Engine.prototype.historicize = function (date, n) {
    if (this.hist[date] !== undefined) {
        this.hist[date].push(n);
    } else {
        this.hist[date] = [];
        this.hist[date].push(n);
    }
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
        $("#level").html("N = " + n);
    }
    $("#" + this.left.target).html(this.left.value);
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
    $(s).addClass(c);
    setTimeout(function () {
        $(s).removeClass(c);
    }, t);
};

Engine.prototype.savedataInitializer = function () {

    if (!localStorage["andrey-pozdnyakov-lrdn"]) {
        this.save();
    } else {
        this.load();
    }
};

Engine.prototype.markupInitializer = function () {

    var body = $("body");

    body.append(this.getLayoutHTML(), this.results.getPopHTML(), this.chartist.getPopHTML());
    $("." + this.trainerTrg).append("<button onclick=" + this.name + ".drawChart() style=\"z-index:50\" class=\"btn-popup reflected\">★</button>");
    $("#" + this.results.id).append(this.progress.getProgressHTML());
    this.populateTrainerHTML();
    this.populateOptionsHTML();

    this.calculateStimuli(this.blocks.value, this.n.value);
    this.functionizer("#" + this.btnTrg, this.name + ".start()", this.playSymbol);
};

Engine.prototype.eventsInitializer = function () {
    var that = this;

    var sel = this.audio.value;
    this.howlerizer(sel, this.audio.selection[sel]);

    this.reset();

    var keyAllowed = {};
    $(document).keydown(function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (keyAllowed[e.which] === false) {
            return;
        }
        keyAllowed[e.which] = false;

        var keyCode = e.keyCode || e.which;
        switch (keyCode) {
        case 65:
            that.checkBlock.apply(that, "visual");
            break;
        case 76:
            that.checkBlock.apply(that, "audio");
            break;
        default:
            return;
        }
    });
    $(document).keyup(function (e) {
        keyAllowed[e.which] = true;
    });
    $(document).focus(function (e) {
        keyAllowed = {};
    });

    document.querySelector("#eye").addEventListener("touchstart", function (e) {
        e.preventDefault();
        that.checkBlock.apply(that, "visual");
    }, false);
    document.querySelector("#eye").addEventListener("click", function (e) {
        e.preventDefault();
        that.checkBlock.apply(that, "visual");
    }, false);
    document.querySelector("#ear").addEventListener("touchstart", function (e) {
        e.preventDefault();
        that.checkBlock.apply(that, "audio");
    }, false);
    document.querySelector("#ear").addEventListener("click", function (e) {
        e.preventDefault();
        that.checkBlock.apply(that, "audio");
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
        that.createBlock.apply(that);
        that.playBlock.apply(that);
    }, this.time.value / 4);

    this.functionizer("#" + this.btnTrg, this.name + ".stop()", this.stopSymbol);
};

Engine.prototype.stop = function (n) {

    n = n || this.n.value;

    clearTimeout(this.playing);
    this.reset();

    this.blockCounter = -1;
    this.enable = [0, 0];
    this.userScore = [0, 0, 0, 0, 0, 0];

    this.calculateStimuli(this.blocks.value, n);
    this.functionizer("#" + this.btnTrg, this.name + ".start()", this.playSymbol);
};

Engine.prototype.calculateStimuli = function (blocks, n) {
    this.left.value = blocks * (n + 1);
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
    var e = (c === "visual") ? "#eye" : "#ear";
    var r = (c === "visual") ? 0 : 3;
    var w = (c === "visual") ? 2 : 5;

    if (this.enable[p] !== 1 && this.running) {
        this.enable[p] = 1;
        if (this.blockCounter + 1 > this.n.value && this.currBlock[this.blockCounter]) {
            if (this.currBlock[this.blockCounter][p] === this.currBlock[this.blockCounter - this.n.value][p]) {
                console.log("%c right " + c, "color: blue");
                if (this.feedback.value) {
                    this.wow(e, "right", this.time.value / 6);
                }
                this.userScore[r] += 1;
            } else {
                console.log("%c wrong " + c, "color: red");
                if (this.feedback.value) {
                    this.wow(e, "wrong", this.time.value / 6);
                }
                this.userScore[w] += 1;
            }
        }
    }
};

Engine.prototype.createBlock = function () {

    var blockEval = this.evaluateBlock(this.currBlock, this.n.value);

    this.currBlock = this.prepareBlock(this.n.value, this.left.value, this.blocks.value);

    while (blockEval[0] !== this.blocks.value || blockEval[1] !== this.blocks.value) {
        this.currBlock = this.prepareBlock(this.n.value, this.left.value, this.blocks.value);
        blockEval = this.evaluateBlock(this.currBlock, this.n.value);
    }

    this.currBlockLen = this.currBlock.length;

    console.log(this.currBlock);
    console.log("%c matching blocks: " + blockEval, "color: blue");
};

Engine.prototype.playBlock = function () {
    var that = this;

    if (++this.blockCounter < this.currBlockLen) {
        if (this.blockCounter > this.n.value) {
            if (this.currBlock[this.blockCounter - 1][0] === this.currBlock[this.blockCounter - this.n.value - 1][0] && this.currBlock[this.blockCounter - 1][1] === this.currBlock[this.blockCounter - this.n.value - 1][1]) {
                if (this.enable[0] < 1 && this.enable[1] < 1) {
                    console.log("%c both cues missed", "color: orange");
                    if (this.feedback.value) {
                        this.wow("#eye", "missed", this.time.value / 6);
                        this.wow("#ear", "missed", this.time.value / 6);
                    }
                    this.userScore[1] += 1;
                    this.userScore[4] += 1;
                }
            } else if (this.currBlock[this.blockCounter - 1][0] === this.currBlock[this.blockCounter - this.n.value - 1][0]) {
                if (this.enable[0] < 1) {
                    console.log("%c visual cue missed", "color: orange");
                    if (this.feedback.value) {
                        this.wow("#eye", "missed", this.time.value / 6);
                    }
                    this.userScore[1] += 1;
                }
            } else if (this.currBlock[this.blockCounter - 1][1] === this.currBlock[this.blockCounter - this.n.value - 1][1]) {
                if (this.enable[1] < 1) {
                    console.log("%c audio cue missed", "color: orange");
                    if (this.feedback.value) {
                        this.wow("#ear", "missed", this.time.value / 6);
                    }
                    this.userScore[4] += 1;
                }
            }
        }
        if (this.currBlock[this.blockCounter]) {
            var blockLight = (this.currBlock[this.blockCounter][0] < 5) ? this.currBlock[this.blockCounter][0] - 1 : this.currBlock[this.blockCounter][0];
            this.wow(".tile:eq(" + blockLight + ")", "on", this.time.value / 6);
            this.loadedSounds[this.currBlock[this.blockCounter][1] - 1].play();
        }

        console.log("%c id : #" + this.blockCounter, "color: black");
        console.log("%c value : " + this.currBlock[this.blockCounter], "color: black");
        console.log("%c keypresses : " + this.enable, "color: green");
        console.log("%c score : " + this.userScore, "color: green");

        this.left.value--;
        this.update();

        this.playing = setTimeout(that.playBlock.bind(that), that.time.value);
        this.enable = [0, 0];
    } else {
        var date = new Date();

        this.userScore[1] = this.blocks.value - this.userScore[0];
        this.userScore[4] = this.blocks.value - this.userScore[3];

        var s = "";
        s += "<table class=\"results-icons\">";
        s += "<tr><td colspan=\"2\">Visual</td><td colspan=\"2\">Audio</td></tr>";
        s += "<tr><td>☑</td><td>" + this.userScore[0] + "</td><td>☑</td><td>" + this.userScore[3] + "</td></tr>";
        s += "<tr><td>☐</td><td>" + this.userScore[1] + "</td><td>☐</td><td>" + this.userScore[4] + "</td></tr>";
        s += "<tr><td>☒</td><td>" + this.userScore[2] + "</td><td>☒</td><td>" + this.userScore[5] + "</td></tr>";
        s += "</table>";

        $("#" + this.resultsTrg).html(s);

        var incorrectVis = this.userScore[1] + this.userScore[2];
        var incorrectAud = this.userScore[4] + this.userScore[5];
        var threshold = this.blocks.value * (1 - this.threshold.value);
        var upperThreshold = Math.ceil(threshold);
        var lowerThreshold = Math.floor(threshold);

        if (incorrectVis <= lowerThreshold && incorrectAud <= lowerThreshold) {
            this.historicize(date.ddmm(), this.n.value);
            $("#" + this.resultsTrg).append("<p class=\"results-text\">N is now:<br>" + ++this.n.value + "</p>");
        } else if (incorrectVis > upperThreshold || incorrectAud > upperThreshold) {
            if (this.n.value !== 1) {
                $("#" + this.resultsTrg).append("<p class=\"results-text\">N is now:<br>" + --this.n.value + "</p>");
            } else {
                $("#" + this.resultsTrg).append("<p class=\"results-text\">N stays: 1<br>Keep trying</p>");
            }
        } else {
            this.historicize(date.ddmm(), this.n.value);
            $("#" + this.resultsTrg).append("<p class=\"results-text\">N stays: " + this.n.value + "<br>Keep trying</p>");
        }

        this.save();
        this.stop(this.n.value);
        this.runs++;
        this.progress.move(this.runs / 20 * 100);
        setTimeout(function () {
            that.results.yes();
        }, 400);
    }
};

function Pop(name, innerId) {
    this.name = name;
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
};

Pop.prototype.no = function () {
    var el = document.getElementById(this.id);
    el.style.opacity = 0;
    el.style.height = 0;
    el.style.width = 0;
    var cont = document.getElementById(this.innerId);
    cont.style.display = "none";
    cont.innerHTML = "";
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
    this.progressId = this.name + "-outer";
    this.barId = this.name + "-inner";
    this.height = height;
    this.background = background;
    this.color = color;
    this.stored = 0;
}

Progress.prototype.getProgressHTML = function () {
    var s = "";
    s += "<div id=" + this.progressId + " style=\"position:absolute; z-index:40; width:100%; height:" + this.height + "; top:0; left:0; background-color:" + this.background + "\">";
    s += "<div id=" + this.barId + " style=\"position:absolute; width:0; height:100%; background-color:" + this.color + "\"></div>";
    s += "</div>";
    return s;
};

Progress.prototype.move = function (curr) {
    this.current = curr;
    this.el = document.getElementById(this.barId);

    this.advance = function () {
        if (this.stored >= this.current) {
            clearInterval(this.interval);
        } else {
            this.stored++;
            this.el.style.width = this.stored + "%";
        }
    }
    this.interval = setInterval(this.advance.bind(this), 10);
};
