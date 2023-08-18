var game = {

  progressManager: {
    intervals: [],
    startTick: function() {
      game.progressManager.intervals.push(
        setInterval(
          () => {

            const sessionTimeIndicator = $("#session-time-indicator");
            const progressBar = document.querySelector(".progress__bar");

            environment.time.elapsed += 1 / 60;

            const timeDiff = environment.time.expected - environment.time.elapsed;
            const remaining = Math.max(0, Math.ceil(timeDiff));

            sessionTimeIndicator.text(remaining + "m");

            const newWidth = (100 * environment.time.elapsed / environment.time.expected);
            const percentage = Math.min(Math.max(0, newWidth), 100);

            progressBar.style.width = percentage + "%";
            if (percentage > 99.9) {
              progressBar.style.backgroundColor = "#f88";
            }
          },
          1000
        )
      );
    },
    stopTick: function() {
      game.progressManager.intervals.forEach(i => clearInterval(i));
    }
  },

  // updates all parameters
  // values are taken from HTML elements
  updateParameters: function(init) {

    this.time = Number($("#set-time").val());
    this.clues = Number($("#set-clues").val());

    this.levelUpThreshold = Number($("#level-up-threshold").val());
    this.levelDownA = Number($("#level-down-a").val());
    this.levelDownB = Number($("#level-down-b").val());
    this.levelDownC = Number($("#level-down-c").val());

    // if the game is initializing, then try to retrieve N from LS
    const defaultN = Number($("#set-level").val());
    let LSEntry = localStorage.getItem(environment.name);
    let savedN;
    if (init && LSEntry) {
      LSEntry = JSON.parse(LSEntry);
      const entries = Object.entries(JSON.parse(localStorage.getItem("DNB_1.0.0.0")));
      const sorted = entries.sort((a, b) =>
        Number(b[0].split("/").reverse().join("")) - Number(a[0].split("/").reverse().join(""))
      );
      savedN = sorted[0][1].data.pop();
    }
    this.n = savedN || defaultN;
    $("#set-level").val(this.n);
    $("#set-level-span").text(this.n);
    $("#N-level").text("N = " + this.n);
    
    this.stimuli = calculateStimuli(this.n, this.clues);
    this.feedback = Number($("#feedback").val());
    this.levelUp = Number($("#level-up").val());
  },

  // updates sounds whenever the #select-sound has changed its value
  updateSounds: function() {
    var folder = $("#select-sound").val();
    this.playableSounds = makePlaybleSounds(environment.sounds[folder], folder);
  },

  // ordered procedure to initialize things properly
  init: function() {
    this.running = false;
    this.updateParameters(true);
    this.updateSounds();
    this.reset(true);
  },

  // starts the game
  // changes function to the play button, which now is a stop button
  start: function() {

    this.progressManager.startTick();

    this.running = true;
    this.reset();
    this.playing = setTimeout(
      function() {
        game.playBlock.call(game);
      },
      this.time
    );
    newOnClickFunction("#engine-btn", "game.stop()", "Stop");
  },

  // stops the game
  // changes function to the stop button, which now is a start button
  stop: function() {

    this.progressManager.stopTick();

    this.running = false;
    this.reset();
    clearTimeout(this.playing);
    newOnClickFunction("#engine-btn", "game.start()", "Play");
  },

  // resets temporary variables used within playBlock
  reset: function(init) {
    this.updateParameters(init);
    this.block = makeBlock(this.n, this.stimuli, this.clues);
    this.prevScore = [0, 0, 0, 0, 0, 0];
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
    var btn = isPosition ? "#eye-btn" : "#confirm-btn";
    var el =  isPosition ? 0 : 1;
    if (this.enable[el] < 1 && this.running) {
      this.enable[el] = 1;
      if (this.idx + 1 > this.n && this.block[this.idx])
        if (this.block[this.idx][el] === this.block[this.idx - this.n][el]) {
          console.log("%c right " + stimulus_name, "color: green");
          this.score[isPosition ? 0 : 3]++;
          if (this.feedback) wow(btn, "right", this.time);
        } else {
          console.log("%c wrong " + stimulus_name, "color: red");
          this.score[isPosition ? 2 : 5]++;
          if (this.feedback) wow(btn, "wrong", this.time);
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

  // plays a sound
  playSound: function() {
    var sounds = this.playableSounds.sounds;
    var sound = sounds[this.block[this.idx][1] - 1];
    sound.play();
  },

  // plays the block already created within the game object
  playBlock: function() {

    // increments idx and checks whether the block is not at its end
    // in case the block is not at its end plays stimuli
    // otherwise calls endGame
    if (++this.idx < this.block.length) {
      this.checkMissingInput("sound");
      this.playSound();

      console.log("%c id : #" + this.idx, "color: black");
      console.log("%c value : " + this.block[this.idx], "color: black");
      console.log("%c score : " + this.score, "color: green");

      this.stimuli--;
      $("#stimuli-counter").text(this.stimuli);

      this.playing = setTimeout(
        this.playBlock.bind(this),
        this.time + (this.playableSounds.averageDuration || 800)
      );
      this.enable = [0, 0];
    } else {
      this.endBlock();
    }
  },

  endBlock: function() {

    // a simple alias for environment object, used below
    var e = environment;

    // puts a report into resultsPopup
    document.getElementById(e.resultsPopup.innerID).innerHTML =
      this.buildHTMLReport();

    // updates N level of #set-level within the slide menu
    $("#set-level").val(this.n);
    $("#set-level-span").text(this.n);
    $("#N-level").text("N = " + this.n);

    // stops the game and shows resultsPopup
    this.stop();
    e.resultsPopup.show();
  },

  // builds a HTML report to append within resultsPopup
  // saves N into data for today, within history
  // increases or decreases N level for the next game
  buildHTMLReport: function() {

    var s = "";
    s += "<table class=\"results-icons\">";
    s += "<tr><td colspan=\"2\">Sounds</td></tr>";
    s += "<tr><td>☑</td><td>" + this.score[3] + "</td></tr>";
    s += "<tr><td>☐</td><td>" + this.score[4] + "</td></tr>";
    s += "<tr><td>☒</td><td>" + this.score[5] + "</td></tr>";
    s += "</table>";

    if (!this.levelUp) {
      environment.saveStats(true);
      s += "<p class=\"results-text\">Level up is off<br>N stays: " + this.n;
      return s;
    }

    // decides what to do in each case of judgement
    // see judgeResults within functions.js to know more
    switch (judgeResults(this.score[3], this.score[4], this.score[5], this.clues)) {
      case 2:
        environment.saveStats(true);
        s += "<p class=\"results-text\">N is now: " + ++this.n + "</p>";
        break;
      case 1:
        environment.saveStats(true);
        s += "<p class=\"results-text\">N stays: " + this.n + "<br>Keep trying</p>";
        break;
      case 0:
        environment.saveStats();
        s += "<p class=\"results-text\">N is now: " + --this.n + "<br>N won't be saved</p>";
        break;
    }
    return s;
  }
};
