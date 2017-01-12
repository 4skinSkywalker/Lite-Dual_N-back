var ENGINE = {};

ENGINE.optionsTrg = "navigation";
ENGINE.trainerTrg = "site-wrap";
ENGINE.gridTrg = "grid";
ENGINE.resultsTrg = "results";
ENGINE.chartistTrg = "chart";
ENGINE.btnTrg = "engine-button";
ENGINE.playSymbol = "Play";
ENGINE.stopSymbol = "Stop";

ENGINE.results = new Pop("ENGINE.results", ENGINE.resultsTrg);
ENGINE.progress = new Progress("progress", "1vh", "transparent", "#fff");
ENGINE.runs = 0;

ENGINE.chartist = new Pop("ENGINE.chart", ENGINE.chartistTrg);
ENGINE.hist = {};

ENGINE.left = {
    "target": "left",
    "value": 0
};
ENGINE.time = {
    "type": "range",
    "target": "stimulus-time",
    "text": "Stimulus:",
    "value": 3000,
    "min": 1500,
    "step": 250,
    "MAX": 4500,
    "char": "ms"
};
ENGINE.blocks = {
    "type": "range",
    "target": "matching-blocks",
    "text": "Matching:",
    "value": 6,
    "min": 3,
    "step": 1,
    "MAX": 9
};
ENGINE.n = {
    "type": "range",
    "target": "n-back",
    "text": "N-back:",
    "value": 2,
    "min": 1,
    "step": 1,
    "MAX": 9
};
ENGINE.threshold = {
    "type": "range",
    "target": "success-threshold",
    "text": "Threshold:",
    "value": 0.8,
    "min": 0.7,
    "step": 0.05,
    "MAX": 1.0,
    "char": "%",
    "change": function (x) {
        return x * 100;
    }
};
ENGINE.feedback = {
    "type": "range",
    "target": "feedback",
    "text": "Feedback:",
    "value": 1,
    "min": 0,
    "step": 1,
    "MAX": 1,
    "change": function (x) {
        return (x == 1) ? "on" : "off";
    }
};
ENGINE.rotation = {
    "type": "range",
    "target": "rotation-duration",
    "text": "Rotation:",
    "value": 60,
    "min": 30,
    "step": 10,
    "MAX": 120,
    "char": "s",
    "direction": function () {
        return (Math.floor(Math.random() * 2) == 0) ? "-clockwise" : "-anticlockwise";
    }
};
ENGINE.audio = {
    "type": "selector",
    "target": "audio-selection",
    "text": "Audio:",
    "value": "Natural Numbers",
    "selection": {
        "Natural Numbers": [1, 2, 3, 4, 5, 6, 7, 8],
        "Prime Numbers": [2, 3, 5, 7, 11, 13, 17, 19]
    }
};
ENGINE.loadedSounds = [];

ENGINE.drawChart = function () {

    var MAXS = [];
    $.each(ENGINE.hist, function (key, value) {
        if (ENGINE.MAX(value) != undefined)
            MAXS.push(ENGINE.MAX(value));
    });
    var avgs = [];
    $.each(ENGINE.hist, function (key, value) {
        if (ENGINE.avg(value) != undefined)
            avgs.push(ENGINE.avg(value));
    });
    var mins = [];
    $.each(ENGINE.hist, function (key, value) {
        if (ENGINE.min(value) != undefined)
            mins.push(ENGINE.min(value));
    });
    if (avgs.length == 0)
        setTimeout(function () {
            alert("No data");
        }, 400);
    else
        ENGINE.chartist.yes();


    return new Chartist.Line("#" + ENGINE.chartistTrg, {
        labels: Object.keys(ENGINE.hist),
        series: [MAXS, avgs, mins]
    }, {
        fullWidth: true,
        axisX: {
            onlyInteger: true,
        },
        axisY: {
            onlyInteger: true,
            high: 9,
            low: 1,
            ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9],
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
}

ENGINE.getLayoutHTML = function () {
    var s = "";
    s += "<ul class=" + ENGINE.optionsTrg + "></ul>";
    s += "<input type=\"checkbox\" id=\"nav-trigger\" class=\"nav-trigger\"/>";
    s += "<label for=\"nav-trigger\"></label>";
    s += "<div class=" + ENGINE.trainerTrg + "></div>";
    return s;
}

ENGINE.populateOptionsHTML = function () {
    var s = "",
        obj = ENGINE;
    s += "<li class=\"nav-item\">";
    s += "<p id=\"level\">N = " + ENGINE.n["value"] + "</p>";
    s += "</li>";
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (obj[key]["type"] == "range" || obj[key]["type"] == "selector") {
                if (obj[key]["type"] == "range") {
                    var ch = (obj[key]["char"]) ? obj[key]["char"] : "";
                    txt = (obj[key]["change"]) ? obj[key]["change"](obj[key]["value"]) + ch : obj[key]["value"] + ch;
                    s += "<li class=\"nav-item\">";
                    s += "<span class=\"range-label\">" + obj[key]["text"] + " </span><span id=" + obj[key]["target"] + "-span\" class=\"range-label\">" + txt + "</span>";
                    s += "<input type=\"range\" class=\"slider\" id=" + obj[key]["target"] + " min=" + obj[key]["min"] + " max=" + obj[key]["MAX"] + " step=" + obj[key]["step"] + " value=" + obj[key]["value"] + ">";
                    s += "</li>";
                } else if (obj[key]["type"] == "selector") {
                    s += "<li class=\"nav-item\">";
                    s += "<label for=" + obj[key]["target"] + ">" + obj[key]["text"] + "</label>";
                    s += "<select class=\"option\" id=" + obj[key]["target"] + ">";
                    for (var subkey in obj[key]["selection"])
                        s += "<option>" + subkey + "</option>";
                    s += "</select>";
                    s += "</li>";
                }
                $("." + ENGINE.optionsTrg).append(s);
                ENGINE.onSettingChange(obj, key);
            }
        }
        s = "";
    }
    s += "<li class=\"nav-item\">";
    s += "<p>Controls:<br>\"A\" key for visual<br>\"L\" key for audio.</p>";
    s += "</li>";
    $("." + ENGINE.optionsTrg).append(s);
}

ENGINE.onSettingChange = function (obj, key) {
    var el = "#" + obj[key]["target"];

    if (obj[key]["type"] == "range") {
        ENGINE.onChangeAttacher(el, function () {
            obj[key]["value"] = Number($("#" + obj[key]["target"]).val());
        });
        if ($("#" + obj[key]["target"] + "-span"))
            ENGINE.onChangeAttacher(el, function () {
                $("#" + obj[key]["target"] + "-span").text(obj[key]["value"]);
            });
    } else if (obj[key]["type"] == "selector") {
        ENGINE.onChangeAttacher(el, function () {
            obj[key]["value"] = $("#" + obj[key]["target"]).val();
        });
    }

    if (obj[key]["change"] || obj[key]["char"]) {
        ENGINE.onChangeAttacher(el, function () {
            var ch = (obj[key]["char"]) ? obj[key]["char"] : "";
            txt = (obj[key]["change"]) ? obj[key]["change"](obj[key]["value"]) + ch : obj[key]["value"] + ch;
            $("#" + obj[key]["target"] + "-span").text(txt);
        });
    }

    if (key == "blocks" || key == "n") {
        ENGINE.onChangeAttacher(el, function () {
            if (ENGINE.running)
                ENGINE.stop();
            else
                ENGINE.calculateStimuli(ENGINE.blocks["value"], ENGINE.n["value"]);
        });
    } else if (key == "rotation") {
        ENGINE.onChangeAttacher(el, function () {
            var grid = $("#" + ENGINE.gridTrg);
            grid.attr("style", "animation: rotating" + obj[key]["direction"]() + " " + obj[key]["value"] + "s linear infinite;");
            if (obj[key]["value"] == obj[key]["min"]) {
                $("#" + obj[key]["target"] + "-span").text("off");
                grid.removeClass("rotational-grid");
                grid.attr("style", "");
            } else if (!grid.hasClass("rotational-grid")) {
                grid.addClass("rotational-grid");
                grid.attr("style", "animation: rotating" + obj[key]["direction"]() + " " + obj[key]["value"] + "s linear infinite;");
            }
        });
    } else if (key == "audio") {
        ENGINE.onChangeAttacher(el, function () {
            var sel = obj[key]["value"];
            ENGINE.howlerizer(sel, obj[key]["selection"][sel]);
        });
    }
}

ENGINE.onChangeAttacher = function (el, foo) {
    $(el).on("change", foo);
}

ENGINE.populateTrainerHTML = function () {
    var s = "";
    s += "<div id=\"status-bar\">";
    s += "<div id=" + ENGINE.left["target"] + ">" + ENGINE.left["value"] + "</div>";
    s += "</div>";
    s += "<button type=\"button\" id=" + ENGINE.btnTrg + " class=\"btn-standard\"></button>";
    s += "<table id=" + ENGINE.gridTrg + " class=\"rotational-grid\" style=\"animation: rotating" + ENGINE.rotation["direction"]() + " " + ENGINE.rotation["value"] + "s linear infinite;\">";
    for (var i = 0; i < 3; i++) {
        s += "<tr>";
        for (var j = 0; j < 3; j++)
            s += "<td><div class=\"tile\"></div></td>";
        s += "</tr>";
    }
    s += "</table>";
    s += "<div id=\"eye\"></div>";
    s += "<div id=\"ear\"></div>";
    $("." + ENGINE.trainerTrg).append(s);
}

Date.prototype.ddmm = function () {
    var dd = this.getDate(),
        mm = this.getMonth() + 1;

    return [
        (dd > 9 ? "" : "0") + dd,
        (mm > 9 ? "" : "0") + mm,
    ].join("/");
};

ENGINE.functionizer = function (e, f, t) {
    $(e).prop("onclick", null).attr("onclick", f);
    $(e).text(t);
}

ENGINE.load = function () {
    ENGINE.hist = JSON.parse(localStorage["andrey-pozdnyakov-lrdn"]);
}

ENGINE.save = function () {
    localStorage["andrey-pozdnyakov-lrdn"] = JSON.stringify(ENGINE.hist);
}

ENGINE.historicize = function (date, n) {
    if (ENGINE.hist[date] != undefined) {
        ENGINE.hist[date].push(n)
    } else {
        ENGINE.hist[date] = [];
        ENGINE.hist[date].push(n)
    }
}

ENGINE.MAX = function (array) {

    if (array.length >= 2)
        return array.reduce(function (a, b) {
            return (a > b ? a : b);
        });
    else if (array[0] != undefined)
        return array[0];
}

ENGINE.avg = function (array) {

    if (array.length >= 2)
        return array.reduce(function (a, b) {
            return a + b;
        }) / array.length;
    else if (array[0] != undefined)
        return array[0];
}

ENGINE.min = function (array) {

    if (array.length >= 2)
        return array.reduce(function (a, b) {
            return (a < b ? a : b);
        });
    else if (array[0] != undefined)
        return array[0];
}

ENGINE.update = function (n) {
    if (n) {
        $("#" + ENGINE.n["target"]).val(n);
        $("#" + ENGINE.n["target"] + "-span").text(n);
        $("#level").html("N = " + n);
    }
    $("#" + ENGINE.left["target"]).html(ENGINE.left["value"]);
}

ENGINE.howlerizer = function (dir, a) {
    ENGINE.loadedSounds = [];
    a.forEach(function (el) {
        ENGINE.loadedSounds.push(new Howl({
            src: ["snd/" + dir.replace(/\s/g, "-") + "/" + el + ".wav"]
        }));
    });
}

ENGINE.wow = function (s, c, t) {
    $(s).addClass(c);
    setTimeout(function () {
        $(s).removeClass(c);
    }, t);
}

ENGINE.savedataInitializer = function () {

    if (!localStorage["andrey-pozdnyakov-lrdn"]) {
        ENGINE.save();
    } else {
        ENGINE.load();
    }
}

ENGINE.markupInitializer = function () {

    var body = $("body");

    body.append(ENGINE.getLayoutHTML(), ENGINE.results.getPopHTML(), ENGINE.chartist.getPopHTML());
    $("." + ENGINE.trainerTrg).append("<button onclick=\"ENGINE.drawChart()\" style=\"z-index:50\" class=\"btn-popup reflected\">★</button>");
    $("#" + ENGINE.results.id).append(ENGINE.progress.getProgressHTML());
    ENGINE.populateTrainerHTML();
    ENGINE.populateOptionsHTML();

    ENGINE.calculateStimuli(ENGINE.blocks["value"], ENGINE.n["value"]);
    ENGINE.functionizer("#" + ENGINE.btnTrg, "ENGINE.start()", ENGINE.playSymbol);
}

ENGINE.eventsInitializer = function () {

    var sel = ENGINE.audio["value"];
    ENGINE.howlerizer(sel, ENGINE.audio["selection"][sel]);

    ENGINE.reset();

    var keyAllowed = {};
    $(document).keydown(function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (keyAllowed[e.which] == false) return;
        keyAllowed[e.which] = false;

        var keyCode = e.keyCode || e.which;
        switch (keyCode) {
        case 65:
            ENGINE.checkBlock("visual");
            break;
        case 76:
            ENGINE.checkBlock("audio");
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
        ENGINE.checkBlock("visual");
    }, false);
    document.querySelector("#eye").addEventListener("click", function (e) {
        e.preventDefault();
        ENGINE.checkBlock("visual");
    }, false);
    document.querySelector("#ear").addEventListener("touchstart", function (e) {
        e.preventDefault();
        ENGINE.checkBlock("audio");
    }, false);
    document.querySelector("#ear").addEventListener("click", function (e) {
        e.preventDefault();
        ENGINE.checkBlock("audio");
    }, false);
}

ENGINE.reset = function () {

    ENGINE.running = false;
    ENGINE.currBlock = [];
    ENGINE.currBlockLen = 0;
    ENGINE.blockCounter = -1;
    ENGINE.enable = [0, 0];
    ENGINE.userScore = [0, 0, 0, 0, 0, 0];
}

ENGINE.start = function () {

    ENGINE.running = true;
    ENGINE.playing = setTimeout(function () {
        ENGINE.createBlock();
        ENGINE.playBlock();
    }, ENGINE.time["value"] / 4);

    ENGINE.functionizer("#" + ENGINE.btnTrg, "ENGINE.stop()", ENGINE.stopSymbol);
}

ENGINE.stop = function (n) {

    n = n || ENGINE.n["value"];

    clearTimeout(ENGINE.playing);
    ENGINE.reset();

    ENGINE.blockCounter = -1;
    ENGINE.enable = [0, 0];
    ENGINE.userScore = [0, 0, 0, 0, 0, 0];

    ENGINE.calculateStimuli(ENGINE.blocks["value"], n);
    ENGINE.functionizer("#" + ENGINE.btnTrg, "ENGINE.start()", ENGINE.playSymbol);
}

ENGINE.calculateStimuli = function (blocks, n) {
    ENGINE.left["value"] = blocks * (n + 1);
    ENGINE.update(n);
}

ENGINE.prepareBlock = function (n, left, blocks) {

    var thisBlock = [];

    for (var i = 0; i < left; i++)
        thisBlock.push([0, 0]);

    var blockLength = thisBlock.length,
        vis = 0,
        aud = 0;

    while (vis < blocks) {
        var visTarg = Math.floor(Math.random() * blockLength);
        if (thisBlock[visTarg + n]) {
            if (thisBlock[visTarg][0] == 0 && thisBlock[visTarg + n][0] == 0) {
                thisBlock[visTarg][0] = 1 + Math.floor(Math.random() * 8);
                thisBlock[visTarg + n][0] = thisBlock[visTarg][0];
                vis++;
            } else if (thisBlock[visTarg][0] != 0 && thisBlock[visTarg + n][0] == 0) {
                thisBlock[visTarg + n][0] = thisBlock[visTarg][0];
                vis++;
            } else if (thisBlock[visTarg][0] == 0 && thisBlock[visTarg + n][0] != 0) {
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
        var audTarg = Math.floor(Math.random() * blockLength);
        if (thisBlock[audTarg + n]) {
            if (thisBlock[audTarg][1] == 0 && thisBlock[audTarg + n][1] == 0) {
                thisBlock[audTarg][1] = 1 + Math.floor(Math.random() * 8);
                thisBlock[audTarg + n][1] = thisBlock[audTarg][1];
                aud++;
            } else if (thisBlock[audTarg][1] != 0 && thisBlock[audTarg + n][1] == 0) {
                thisBlock[audTarg + n][1] = thisBlock[audTarg][1];
                aud++;
            } else if (thisBlock[audTarg][1] == 0 && thisBlock[audTarg + n][1] != 0) {
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
        if (thisBlock[x][0] == 0) {
            thisBlock[x][0] = 1 + Math.floor(Math.random() * 8);
            if (thisBlock[x - n] && thisBlock[x][0] == thisBlock[x - n][0]) {
                (thisBlock[x][0] < 8) ? thisBlock[x][0] += 1: thisBlock[x][0] -= 1;
            } else if (thisBlock[x + n] && thisBlock[x][0] == thisBlock[x + n][0]) {
                (thisBlock[x][0] < 8) ? thisBlock[x][0] += 1: thisBlock[x][0] -= 1;
            }
        }
        if (thisBlock[x][1] == 0) {
            thisBlock[x][1] = 1 + Math.floor(Math.random() * 8);
            if (thisBlock[x - n] && thisBlock[x][1] == thisBlock[x - n][1]) {
                (thisBlock[x][1] < 8) ? thisBlock[x][1] += 1: thisBlock[x][1] -= 1;
            } else if (thisBlock[x + n] && thisBlock[x][1] == thisBlock[x + n][1]) {
                (thisBlock[x][1] < 8) ? thisBlock[x][1] += 1: thisBlock[x][1] -= 1;
            }
        }
    }
    return thisBlock;
}

ENGINE.evaluateBlock = function (block, n) {

    var v = 0,
        a = 0;

    for (var i = 0; i < block.length; i++)
        if (block[i - n]) {
            if (block[i][0] == block[i - n][0])
                v += 1;
            if (block[i][1] == block[i - n][1])
                a += 1;
        }

    return [v, a];
}

ENGINE.checkBlock = function (c) {

    var p = (c == "visual") ? 0 : 1,
        e = (c == "visual") ? "#eye" : "#ear",
        r = (c == "visual") ? 0 : 3,
        w = (c == "visual") ? 2 : 5;

    if (ENGINE.enable[p] != 1 && ENGINE.running) {
        ENGINE.enable[p] = 1;
        if (ENGINE.blockCounter + 1 > ENGINE.n["value"] && ENGINE.currBlock[ENGINE.blockCounter]) {
            if (ENGINE.currBlock[ENGINE.blockCounter][p] == ENGINE.currBlock[ENGINE.blockCounter - ENGINE.n["value"]][p]) {
                console.log("%c right " + c, "color: blue");
                if (ENGINE.feedback["value"])
                    ENGINE.wow(e, "right", ENGINE.time["value"] / 6);
                ENGINE.userScore[r] += 1;
            } else {
                console.log("%c wrong " + c, "color: red");
                if (ENGINE.feedback["value"])
                    ENGINE.wow(e, "wrong", ENGINE.time["value"] / 6);
                ENGINE.userScore[w] += 1;
            }
        }
    }
}

ENGINE.createBlock = function () {

    var blockEval = ENGINE.evaluateBlock(ENGINE.currBlock, ENGINE.n["value"]);

    ENGINE.currBlock = ENGINE.prepareBlock(ENGINE.n["value"], ENGINE.left["value"], ENGINE.blocks["value"]);

    while (blockEval[0] != ENGINE.blocks["value"] || blockEval[1] != ENGINE.blocks["value"]) {
        ENGINE.currBlock = ENGINE.prepareBlock(ENGINE.n["value"], ENGINE.left["value"], ENGINE.blocks["value"]);
        blockEval = ENGINE.evaluateBlock(ENGINE.currBlock, ENGINE.n["value"]);
    }

    ENGINE.currBlockLen = ENGINE.currBlock.length;

    console.log(ENGINE.currBlock);
    console.log("%c matching blocks: " + blockEval, "color: blue");
}

ENGINE.playBlock = function () {

    if (++ENGINE.blockCounter < ENGINE.currBlockLen) {
        if (ENGINE.blockCounter > ENGINE.n["value"]) {
            if (ENGINE.currBlock[ENGINE.blockCounter - 1][0] == ENGINE.currBlock[ENGINE.blockCounter - ENGINE.n["value"] - 1][0] && ENGINE.currBlock[ENGINE.blockCounter - 1][1] == ENGINE.currBlock[ENGINE.blockCounter - ENGINE.n["value"] - 1][1]) {
                if (ENGINE.enable[0] < 1 && ENGINE.enable[1] < 1) {
                    console.log("%c both cues missed", "color: orange");
                    if (ENGINE.feedback["value"]) {
                        ENGINE.wow("#eye", "missed", ENGINE.time["value"] / 6);
                        ENGINE.wow("#ear", "missed", ENGINE.time["value"] / 6);
                    }
                    ENGINE.userScore[1] += 1;
                    ENGINE.userScore[4] += 1;
                }
            } else if (ENGINE.currBlock[ENGINE.blockCounter - 1][0] == ENGINE.currBlock[ENGINE.blockCounter - ENGINE.n["value"] - 1][0]) {
                if (ENGINE.enable[0] < 1) {
                    console.log("%c visual cue missed", "color: orange");
                    if (ENGINE.feedback["value"])
                        ENGINE.wow("#eye", "missed", ENGINE.time["value"] / 6);
                    ENGINE.userScore[1] += 1;
                }
            } else if (ENGINE.currBlock[ENGINE.blockCounter - 1][1] == ENGINE.currBlock[ENGINE.blockCounter - ENGINE.n["value"] - 1][1]) {
                if (ENGINE.enable[1] < 1) {
                    console.log("%c audio cue missed", "color: orange");
                    if (ENGINE.feedback["value"])
                        ENGINE.wow("#ear", "missed", ENGINE.time["value"] / 6);
                    ENGINE.userScore[4] += 1;
                }
            }
        }
        if (ENGINE.currBlock[ENGINE.blockCounter]) {
            var blockLight = (ENGINE.currBlock[ENGINE.blockCounter][0] < 5) ? ENGINE.currBlock[ENGINE.blockCounter][0] - 1 : ENGINE.currBlock[ENGINE.blockCounter][0];
            ENGINE.wow(".tile:eq(" + blockLight + ")", "on", ENGINE.time["value"] / 6);
            ENGINE.loadedSounds[ENGINE.currBlock[ENGINE.blockCounter][1] - 1].play();
        }

        console.log("%c id : #" + ENGINE.blockCounter, "color: black")
        console.log("%c value : " + ENGINE.currBlock[ENGINE.blockCounter], "color: black")
        console.log("%c keypresses : " + ENGINE.enable, "color: green");
        console.log("%c score : " + ENGINE.userScore, "color: green");

        ENGINE.left["value"]--;
        ENGINE.update();

        ENGINE.playing = setTimeout(ENGINE.playBlock, ENGINE.time["value"]);
        ENGINE.enable = [0, 0];
    } else {
        var date = new Date();

        ENGINE.userScore[1] = ENGINE.blocks["value"] - ENGINE.userScore[0];
        ENGINE.userScore[4] = ENGINE.blocks["value"] - ENGINE.userScore[3];

        var s = "";
        s += "<table class=\"results-icons\">";
        s += "<tr><td colspan=\"2\">Visual</td><td colspan=\"2\">Audio</td></tr>";
        s += "<tr><td>☑</td><td>" + ENGINE.userScore[0] + "</td><td>☑</td><td>" + ENGINE.userScore[3] + "</td></tr>";
        s += "<tr><td>☐</td><td>" + ENGINE.userScore[1] + "</td><td>☐</td><td>" + ENGINE.userScore[4] + "</td></tr>";
        s += "<tr><td>☒</td><td>" + ENGINE.userScore[2] + "</td><td>☒</td><td>" + ENGINE.userScore[5] + "</td></tr>";
        s += "</table>"

        $("#" + ENGINE.resultsTrg).html(s);

        var incorrectVis = ENGINE.userScore[1] + ENGINE.userScore[2],
            incorrectAud = ENGINE.userScore[4] + ENGINE.userScore[5],
            threshold = ENGINE.blocks["value"] * (1 - ENGINE.threshold["value"]),
            upperThreshold = Math.ceil(threshold),
            lowerThreshold = Math.floor(threshold);

        if (incorrectVis <= lowerThreshold && incorrectAud <= lowerThreshold) {
            ENGINE.historicize(date.ddmm(), ENGINE.n["value"]);
            $("#" + ENGINE.resultsTrg).append("<p class=\"results-text\">N is now:<br>" + ++ENGINE.n["value"] + "</p>");
        } else if (incorrectVis > upperThreshold || incorrectAud > upperThreshold) {
            if (ENGINE.n["value"] != 1) {
                $("#" + ENGINE.resultsTrg).append("<p class=\"results-text\">N is now:<br>" + --ENGINE.n["value"] + "</p>");
            } else {
                $("#" + ENGINE.resultsTrg).append("<p class=\"results-text\">N stays: 1<br>Keep trying</p>");
            }
        } else {
            ENGINE.historicize(date.ddmm(), ENGINE.n["value"]);
            $("#" + ENGINE.resultsTrg).append("<p class=\"results-text\">N stays: " + ENGINE.n["value"] + "<br>Keep trying</p>");
        }

        ENGINE.save();
        ENGINE.stop(ENGINE.n["value"]);
        ENGINE.runs++;
        ENGINE.progress.move(ENGINE.runs / 20 * 100);
        setTimeout(function () {
            ENGINE.results.yes();
        }, 400);
    }
}

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
    if (inStr) s += inStr;
    s += "</div>";
    s += "<button onclick=" + this.name + ".no()\" style=\"z-index:50\" class=\"btn-popup normal\">✖</button>";
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
    s += "<div id=" + this.progressId + " style=\"position:absolute; z-index:40; width:100%; height:" + this.height + "; top:0; left:0; background-color:" + this.background + ">";
    s += "<div id=" + this.barId + " style=\"position:absolute; width:0; height:100%; background-color:" + this.color + "></div>";
    s += "</div>";
    return s;
};

Progress.prototype.move = function (curr) {
    this.current = curr;
    this.el = document.getElementById(this.barId);

    function advance() {
        if (this.stored >= this.current) {
            clearInterval(this.interval);
        } else {
            this.stored++;
            this.el.style.width = this.stored + "%";
        }
    }
    this.interval = setInterval(advance.bind(this), 10);
};