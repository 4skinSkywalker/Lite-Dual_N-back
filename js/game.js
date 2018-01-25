var game = {

  // updates all parameter required
  // values are taken from HTML settings elements
  updateParameters: function() {
    this.time = Number($("#set-time").val());
    this.clues = Number($("#set-clues").val());
    this.n = Number($("#set-level").val());
    this.stimuli = calculateStimuli(this.n, this.clues);
    this.feedback = Number($("#feedback").val());
  },

  // updates sounds whenever the HTML sound selector has changed its value
  updateSounds: function() {
    var folder = $("#select-sound").val();
    this.playableSounds = makePlaybleSounds(enviroment.sounds[folder], folder);
  },

  // ordered procedure to initialize things properly
  init: function() {
    this.running = false;
    this.updateParameters();
    this.updateSounds();
    this.reset();
  },

  // starts the game
  // changes function to the play button which now is a stop button
  start: function(n, clues, time) {
    this.running = true;
    this.reset();
    this.playing = setTimeout(function() {
      game.playBlock.call(game);
    }, this.time / 4);
    newOnClickFunction("#engine-btn", "game.stop()", "Stop");
  },

  // stops the game
  // changes function to the stop button which now is a start button
  stop: function() {
    this.running = false;
    this.reset();
    clearTimeout(this.playing);
    newOnClickFunction("#engine-btn", "game.start()", "Play");
  },

  // resets temporary variables used within the play functions
  reset: function() {
    this.updateParameters();
    this.block = makeBlock(this.n, this.stimuli, this.clues);
    this.score = [0, 0, 0, 0, 0, 0];
    this.idx = -1;
    this.enable = [0, 0];
  },

  // invoked when a user checks a clue using keys or buttons
  // this function, which works only during the gameplay
  // keeps track of the user's score
  // when feedback is set to 1 it also displays a visual feedback
  checkUserInput: function(stimulus_name) {
    var isPosition = stimulus_name === "position";
    var btn = isPosition ? "#eye-btn" : "#ear-btn";
    var el =  isPosition ? 0 : 1;
    if (this.enable[el] < 1 && this.running) {
      this.enable[el] = 1;
      if (this.idx + 1 > this.n && this.block[this.idx])
        if (this.block[this.idx][el] === this.block[this.idx - this.n][el]) {
          console.log("%c right " + stimulus_name, "color: green");
          this.score[isPosition ? 0 : 3]++;
          if (this.feedback) wow(btn, "right", this.time / 6);
        } else {
          console.log("%c wrong " + stimulus_name, "color: red");
          this.score[isPosition ? 2 : 5]++;
          if (this.feedback) wow(btn, "wrong", this.time / 6);
        }
    }
  },

  // invoked when a clue has been missed
  // this function, which works only during the gameplay
  // keeps track of the user's score
  checkMissingInput: function(stimulus_name) {
    var isPosition = stimulus_name === "position";
    var el =  isPosition ? 0 : 1;
    if (this.idx > this.n)
      if (this.block[this.idx - 1][el] === this.block[this.idx - this.n - 1][el]) {
        if (this.enable[el] < 1) {
          console.log("%c " + stimulus_name + "missed", "color: orange");
          this.score[isPosition ? 1 : 4]++;
        }
      }
  },

  // flashes a position within the grid
  flashPosition: function() {
    var light = (this.block[this.idx][0] < 5) ? this.block[this.idx][0] - 1 : this.block[this.idx][0];
    wow(".tile:eq(" + light + ")", "on", this.time / 2);
  },

  // plays a sound
  playSound: function() {
    this.playableSounds[this.block[this.idx][1] - 1].play();
  },

  // plays the block already created within the game object
  playBlock: function() {

    // if there is a block element
    // checks for missing inputs
    // flash a position and play a sound
    // keep repeting this process until there's no more block elements
    // then call endBlock
    if (++this.idx < this.block.length - 1) {
      this.checkMissingInput("position");
      this.checkMissingInput("sound");
      this.flashPosition();
      this.playSound();

      console.log("%c id : #" + this.idx, "color: black");
      console.log("%c value : " + this.block[this.idx], "color: black");
      console.log("%c score : " + this.score, "color: green");

      this.stimuli--;
      $("#stimuli-counter").text(this.stimuli);

      this.playing = setTimeout(this.playBlock.bind(this), this.time);
      this.enable = [0, 0];
    } else {
      this.endBlock();
    }
  },

  endBlock: function() {

    // the following piece of code is useful to find missing clues
    this.score[1] = this.clues - this.score[0];
    this.score[4] = this.clues - this.score[3];

    // a simpler alias of enviroment to work with below
    var e = enviroment;

    // puts a report into resultsPopup
    document.getElementById(e.resultsPopup.innerID).innerHTML =
      this.buildHTMLReport(
        this.score[1] + this.score[2], // wrongPositions
        this.score[4] + this.score[5], // wrongSounds
        Math.floor(this.clues * (1 - 0.8)) // tolleratedErrors
      );

    // updates N level
    $("#set-level").val(this.n);
    $("#set-level-span").text(this.n);

    // stops the game
    // shows resultsPopup
    // move progressBar
    this.stop();
    e.resultsPopup.show();
    e.progressBar.move(e.history[e.today].runs / 20 * 100);
  },

  // .1 builds a HTML report for the suitable for the results popup
  // .2 saves stats for this game
  // .3 increases or decreases N level for the next games
  buildHTMLReport: function(wrongPositions, wrongSounds, tolleratedErrors) {
    var s = "";
    s += "<table class=\"results-icons\">";
    s += "<tr><td colspan=\"2\">Positions</td><td colspan=\"2\">Sounds</td></tr>";
    s += "<tr><td>☑</td><td>" + this.score[0] + "</td><td>☑</td><td>" + this.score[3] + "</td></tr>";
    s += "<tr><td>☐</td><td>" + this.score[1] + "</td><td>☐</td><td>" + this.score[4] + "</td></tr>";
    s += "<tr><td>☒</td><td>" + this.score[2] + "</td><td>☒</td><td>" + this.score[5] + "</td></tr>";
    s += "</table>";

    // decides what to do in each case of judgement
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
