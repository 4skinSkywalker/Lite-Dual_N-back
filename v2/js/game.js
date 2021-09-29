var game = {

  // updates all parameters
  // values are taken from HTML elements
  updateParameters: function() {
    this.time = Number($("#set-time").val());
    this.dynamicDelay = Number($("#dynamic-delay").val());
    this.clues = Number($("#set-clues").val());
    this.n = Number($("#set-level").val());
    this.stimuli = calculateStimuli(this.n, this.clues);
    this.feedback = Number($("#feedback").val());
    this.dailyGoal = 20;
  },

  // updates sounds whenever the #select-sound has changed its value
  updateSounds: function() {
    var folder = $("#select-sound").val();
    this.playableSoundsLeft = makePlaybleSounds(enviroment.sounds[folder], folder);
    this.playableSoundsRight = makePlaybleSounds(enviroment.sounds[folder], folder);
  },

  // ordered procedure to initialize things properly
  init: function() {
    this.running = false;
    this.updateParameters();
    this.updateSounds();
    this.reset();
  },

  // starts the game
  // changes function to the play button, which now is a stop button
  start: function() {
    this.running = true;
    this.reset();
    this.playing = setTimeout(function() {
      game.playBlock.call(game);
    }, this.time / 4);
    newOnClickFunction("#engine-btn", "game.stop()", "Stop");
  },

  // stops the game
  // changes function to the stop button, which now is a start button
  stop: function() {
    this.running = false;
    this.reset();
    clearTimeout(this.playing);
    newOnClickFunction("#engine-btn", "game.start()", "Play");
  },

  // resets temporary variables used within playBlock
  reset: function() {
    this.updateParameters();
    this.block = makeBlock(this.n, this.stimuli, this.clues);
    this.prevScore = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.score = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.idx = -1;
    this.enable = [0, 0, 0];
    this.time = Number($("#set-time").val()); // this changed while in-game
  },

  // invoked when a user checks a clue using keys or buttons
  // this function, which works only during the gameplay
  // keeps track of the user's score
  // when feedback is set to 1 it also displays a visual feedback
  checkUserInput: function(stimulus_name) {

    var stimulusButtons = ["eye-btn", "ear-left-btn", "ear-right-btn"];
    var el = stimulusButtons.indexOf(stimulus_name);
    // right eye 0, right ear left 3, right ear right 6
    // wrong eye 2, wrong ear left 5, wrong ear right 8

    if (this.enable[el] < 1 && this.running) {
      this.enable[el] = 1;
      if (this.idx + 1 > this.n && this.block[this.idx])
        if (this.block[this.idx][el] === this.block[this.idx - this.n][el]) {
          console.log("%c right " + stimulus_name, "color: green");
          this.score[el * 3]++;
          if (this.feedback) wow("#" + stimulus_name, "right", this.time / 6);
        } else {
          console.log("%c wrong " + stimulus_name, "color: red");
          this.score[el * 3 + 2]++;
          if (this.feedback) wow("#" + stimulus_name, "wrong", this.time / 6);
        }
    }
  },

  // invoked when a clue has been missed
  // this function, which works only during the gameplay
  // keeps track of the user's score
  checkMissingInput: function(stimulus_name) {

    var stimulusButtons = ["eye-btn", "ear-left-btn", "ear-right-btn"];
    var el = stimulusButtons.indexOf(stimulus_name);
    // missed eye 1, missed ear left 4, missed ear right 7

    if (this.idx > this.n)
      if (this.block[this.idx - 1][el] === this.block[this.idx - this.n - 1][el]) {
        if (this.enable[el] < 1) {
          console.log("%c " + stimulus_name + " missed", "color: orange");
          this.score[el * 3 + 1]++;
        }
      }
  },

  // flashes a position
  flashPosition: function() {
    var light = this.block[this.idx][0] - 1;
    wow(".tile:eq(" + light + ")", "on", this.time / 2);
    wow(".tile:eq(" + light + ")", "on-99", this.time / 2);
  },

  playSoundLeft: function() {
    var sound = this.playableSoundsLeft[this.block[this.idx][1] - 1];
    sound.stereo(-1);
    setTimeout(() => sound.play(), 50);
  },

  playSoundRight: function() {
    var sound = this.playableSoundsRight[this.block[this.idx][2] - 1];
    sound.stereo(1);
    setTimeout(() => sound.play(), 75);
  },

  // plays the block already created within the game object
  playBlock: function() {

    // increments idx and checks whether the block is not at its end
    // in case the block is not at its end plays stimuli
    // otherwise calls endGame
    if (++this.idx < this.block.length) {
      this.checkMissingInput("eye-btn");
      this.checkMissingInput("ear-left-btn");
      this.checkMissingInput("ear-right-btn");

      this.flashPosition();
      this.playSoundLeft();
      this.playSoundRight();

      console.log("%c id : #" + this.idx, "color: black");
      console.log("%c value : " + this.block[this.idx], "color: black");
      console.log("%c score : " + this.score, "color: green");

      this.stimuli--;
      $("#stimuli-counter").text(this.stimuli);

      // console.log("Is dynamic delay on?", this.dynamicDelay);
      // console.log("Stimulus time", this.time);

      // if dynamic delay is on, then change the stimulus time based on performance
      if (this.dynamicDelay) {

        let deltaDelay = 0;

        // missed
        if (this.score[1] !== this.prevScore[1]) {
          deltaDelay += 100;
          this.prevScore[1] = this.score[1];
        }
        if (this.score[4] !== this.prevScore[4]) {
          deltaDelay += 100;
          this.prevScore[4] = this.score[4];
        }

        // right
        if (this.score[0] !== this.prevScore[0]) {
          deltaDelay -= 100;
          this.prevScore[0] = this.score[0];
        }
        if (this.score[3] !== this.prevScore[3]) {
          deltaDelay -= 100;
          this.prevScore[3] = this.score[3];
        }

        // wrong
        if (this.score[2] !== this.prevScore[2]) {
          deltaDelay += 100;
          this.prevScore[2] = this.score[2];
        }
        if (this.score[5] !== this.prevScore[5]) {
          deltaDelay += 100;
          this.prevScore[5] = this.score[5];
        }

        // if new stimulus time is within the boundaries, then update it
        let timeMin = +document.querySelector("#set-time").min;
        let timeMax = +document.querySelector("#set-time").max;
        console.log("Lower and upper boundaries", timeMin, timeMax);
        let newTime = this.time + deltaDelay;
        if (newTime > timeMin && newTime < timeMax) {
          this.time = newTime;
        }
      }

      this.playing = setTimeout(this.playBlock.bind(this), this.time);
      this.enable = [0, 0, 0];
    } else {
      this.endBlock();
    }
  },

  endBlock: function() {

    // the following piece of code is useful to calculate missing clues
    // Math.max() is used because matching stimuli may be in different numbers than expected 
    this.score[1] = Math.max(this.clues - this.score[0], 0);
    this.score[4] = Math.max(this.clues - this.score[3], 0);
    this.score[7] = Math.max(this.clues - this.score[6], 0);

    // a simple alias for enviroment object, used below
    var e = enviroment;

    // puts a report into resultsPopup
    document.getElementById(e.resultsPopup.innerID).innerHTML =
      this.buildHTMLReport(
        this.score[1] + this.score[2], // wrongPositions
        this.score[4] + this.score[5] + this.score[7] + this.score[8], // wrongSounds
        Math.floor(this.clues * 0.3) // tolleratedErrors
      );

    // updates N level of #set-level within the slide menu
    $("#set-level").val(this.n);
    $("#set-level-span").text(this.n);
    $("#N-level").text("N = " + this.n);

    // stops the game, shows resultsPopup, moves progressBar
    this.stop();
    e.resultsPopup.show();
    e.progressBar.move(e.history[e.today].runs / this.dailyGoal * 100);
  },

  // builds a HTML report to append within resultsPopup
  // saves N into data for today, within history
  // increases or decreases N level for the next game
  buildHTMLReport: function(wrongPositions, wrongSounds, tolleratedErrors) {
    var s = "";
    s += "<table class=\"results-icons\">";
    s += "<tr><td colspan=\"2\">Pos</td><td colspan=\"2\">Snd L</td><td colspan=\"2\">Snd R</td></tr>";
    s += "<tr><td>☑</td><td>" + this.score[0] + "</td>"
       + "<td>☑</td><td>" + this.score[3] + "</td>"
       + "<td>☑</td><td>" + this.score[6] + "</td></tr>";
    s += "<tr><td>☐</td><td>" + this.score[1] + "</td>"
       + "<td>☐</td><td>" + this.score[4] + "</td>"
       + "<td>☐</td><td>" + this.score[7] + "</td></tr>";
    s += "<tr><td>☒</td><td>" + this.score[2] + "</td>"
        + "<td>☒</td><td>" + this.score[5] + "</td>"
        + "<td>☒</td><td>" + this.score[8] + "</td></tr>";
    s += "</table>";

    // decides what to do in each case of judgement
    // see judgeResults within functions.js to know more
    switch (judgeResults(wrongPositions, wrongSounds, tolleratedErrors)) {
      case 2:
        enviroment.saveStats(true);
        s += "<p class=\"results-text\">N is now: " + ++this.n + "</p>";
        break;
      case 1:
        enviroment.saveStats(true);
        s += "<p class=\"results-text\">N stays: " + this.n + "<br>Keep trying</p>";
        break;
      case 0:
        enviroment.saveStats();
        s += "<p class=\"results-text\">N is now: " + --this.n + "<br>N won't be saved</p>";
        break;
      default: s += "<p class=\"results-text\">N stays: 1<br>N won't be saved<br>Keep trying</p>";
    }
    return s;
  }
};
