var game = {

  // updates all parameters
  // values are taken from HTML elements
  updateParameters: function() {
    this.time = Number($("#set-time").val());
    this.clues = Number($("#set-clues").val());
    this.n = Number($("#set-level").val());
    this.stimuli = calculateStimuli(this.n, this.clues);
    this.feedback = Number($("#feedback").val());
    this.dailyGoal = 20;
  },

  // updates sounds whenever the #select-sound-left has changed its value
  updateSoundsLeft: function() {
    var folder = $("#select-sound-left").val();
    this.playableSoundsLeft = makePlaybleSounds(enviroment.soundsLeft[folder], folder);
  },

  // updates sounds whenever the #select-sound-right has changed its value
  updateSoundsRight: function() {
    var folder = $("#select-sound-right").val();
    this.playableSoundsRight = makePlaybleSounds(enviroment.soundsRight[folder], folder);
  },

  // ordered procedure to initialize things properly
  init: function() {
    this.running = false;
    this.updateParameters();
    this.updateSoundsLeft();
    this.updateSoundsRight();
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
    this.block = prepareBlock(this.n, this.stimuli, this.clues);
    this.prevScore = [
      0, 0, 0, // vis left
      0, 0, 0, // snd left
      0, 0, 0, // snd right
      0, 0, 0  // vis right
    ];
    this.score = [
      0, 0, 0, // vis left
      0, 0, 0, // snd left
      0, 0, 0, // snd right
      0, 0, 0  // vis right
    ];
    this.idx = -1;
    this.enable = [
      0, // vis left
      0, // snd left
      0, // snd right
      0  // vis right
    ];
    this.time = Number($("#set-time").val()); // this changed while in-game
  },

  // invoked when a user checks a clue using keys or buttons
  // this function, which works only during the gameplay
  // keeps track of the user's score
  // when feedback is set to 1 it also displays a visual feedback
  checkUserInput: function(stimulus_name) {

    var stimulusButtons = ["eye-left-btn", "ear-left-btn", "ear-right-btn", "eye-right-btn"];
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

    var stimulusButtons = ["eye-left-btn", "ear-left-btn", "ear-right-btn", "eye-right-btn"];
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

  flashVisualLeft: function() {
    var letterIdx = this.block[this.idx][0] - 1;
    wow(".tile.tile-left", "on", this.time / 2);
    wow(".tile.tile-left", "on-letter-" + letterIdx, this.time - 50);
  },

  flashVisualRight: function() {
    var emotionIdx = this.block[this.idx][3] - 1;
    wow(".tile.tile-right", "on", this.time / 2);
    wow(".tile.tile-right", "on-emotion-" + emotionIdx, this.time - 50);
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
      this.checkMissingInput("eye-left-btn");
      this.checkMissingInput("ear-left-btn");
      this.checkMissingInput("ear-right-btn");
      this.checkMissingInput("eye-right-btn");

      this.flashVisualLeft();
      this.flashVisualRight();
      this.playSoundLeft();
      this.playSoundRight();

      console.log("%c id : #" + this.idx, "color: black");
      console.log("%c value : " + this.block[this.idx], "color: black");
      console.log("%c score : " + this.score, "color: green");

      this.stimuli--;
      $("#stimuli-counter").text(this.stimuli);

      this.playing = setTimeout(this.playBlock.bind(this), this.time);
      this.enable = [0, 0, 0, 0];
    } else {
      this.endBlock();
    }
  },

  endBlock: function() {

    // a simple alias for enviroment object, used below
    var e = enviroment;

    // puts a report into resultsPopup
    document.getElementById(e.resultsPopup.innerID).innerHTML =
      this.buildHTMLReport(
        this.score[1] + this.score[2] + this.score[10] + this.score[11], // wrongPositions
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
    s += "<tr><td colspan=\"2\">Vis L</td><td colspan=\"2\">Vis R</td><td colspan=\"2\">Snd L</td><td colspan=\"2\">Snd R</td></tr>";
    s += "<tr><td>☑</td><td>" + this.score[0] + "</td>"
       + "<td>☑</td><td>" + this.score[9] + "</td>"
       + "<td>☑</td><td>" + this.score[3] + "</td>"
       + "<td>☑</td><td>" + this.score[6] + "</td></tr>";
    s += "<tr><td>☐</td><td>" + this.score[1] + "</td>"
       + "<td>☐</td><td>" + this.score[10] + "</td>"
       + "<td>☐</td><td>" + this.score[4] + "</td>"
       + "<td>☐</td><td>" + this.score[7] + "</td></tr>";
    s += "<tr><td>☒</td><td>" + this.score[2] + "</td>"
        + "<td>☒</td><td>" + this.score[11] + "</td>"
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
