var enviroment = {

  // a set of variables within the enviroment
  // name    : name of the enviroment
  // history : collection of data
  // sounds  : a map that shows the structure of the "snd/" directory
  name: "DNB_1.0.0.0",
  history: {},
  sounds: {
    "Numbers": [1, 2, 3, 4, 5, 6, 7, 8],
    "Letters": ["c", "h", "k", "l", "q", "r", "s", "t"],
    "Piano": ["A4", "B4", "C4", "C5", "D4", "E4", "F4", "G4"]
  },

  // sets the date for today in ddmmyy format
  _setDate: function() {
    this.today = (new Date).ddmmyy();
  },

  // makes two popups and a progress bar
  // appends the popups into the body
  // appends the progress bar into the resultsPopup
  makePopups: function() {
    this.resultsPopup = new Popup("enviroment.resultsPopup", "results");
    this.chartPopup = new Popup("enviroment.chartPopup", "chart");
    this.progressBar = new Progress("enviroment.progressBar", "1vh", "rgba(0, 0, 0, 0.33)", "white");
    document.body.innerHTML += this.resultsPopup.getHTML() + this.chartPopup.getHTML();
    document.getElementById(this.resultsPopup.outerID).innerHTML += this.progressBar.getHTML();
  },

  closeAllPopups: function() {
    if (this.resultsPopup.isOpen) this.resultsPopup.hide();
    if (this.chartPopup.isOpen) this.chartPopup.hide();
  },

  // updates the number of runs for today
  // if requested (save === true) it pushes N inside the history for today
  // then it saves history into localStorage
  saveStats: function(save) {
    this.history[this.today].runs++;
    if (save === true) this.history[this.today].data.push(game.n);
    this.save();
  },

  // if there's no data in history for today it creates the key of today
  // the value for the key today is initialized to 0 runs and no data
  // then it saves history into localStorage
  initHistory: function(date) {
    if (this.history[this.today] === undefined)
      this.history[this.today] = {"runs": 0, "data": []};
    this.save();
  },

  // loads from localStorage to history
  load: function() {
    this.history = JSON.parse(localStorage[this.name]);
  },

  // saves from history to localStorage
  save: function() {
    localStorage[this.name] = JSON.stringify(this.history);
  },

  // checks the existence of a savegame within localStorage
  // if savegame already exist checkData loads it
  // then initializes today
  checkData: function() {
    if (localStorage[this.name]) this.load();
    this.initHistory(this.todayDate);
  },

  // assigns to each HTML setting element a onChange function
  // which determines how that setting will influence game variables
  initSettings: function() {
    onChange("#set-time", function() {
      var txt = $("#set-time").val();
      game.time = Number(txt);
      $("#set-time-span").text(txt + "ms");
    });
    onChange("#set-clues", function() {
      game.updateParameters();
      var txt = $("#set-clues").val();
      $("#set-clues-span").text(txt);
    });
    onChange("#set-level", function() {
      game.updateParameters();
      var txt = $("#set-level").val();
      $("#set-level-span").text(txt);
    });
    onChange("#select-sound", function() {
      game.updateSounds();
    });
    onChange("#feedback", function() {
      game.feedback = Number($("#feedback").val());
      $("#feedback-span").text(game.feedback === 1 ? "on" : "off");
    });
  },

  // assigns to the required key and buttons specific functions
  // to be able to play the game properly
  initEvents: function() {
    var keyAllowed = {};
    $(document).keydown(function(e) {
      e.stopPropagation();
      if (keyAllowed[e.which] === false) return;
      keyAllowed[e.which] = false;
      var keyCode = e.keyCode || e.which;
      switch (keyCode) {
        case 65:
          game.checkUserInput("position");
          break;
        case 76:
          game.checkUserInput("sound");
          break;
        case 83:
          enviroment.closeAllPopups();
          $("#engine-btn").click();
          break;
        default:
          return;
      }
    });
    $(document).keyup(function(e) {
      keyAllowed[e.which] = true;
    });
    // the following line of code makes things for both click and touch events
    document.querySelector("#eye-btn").addEventListener("touchstart", function(e) {
      e.preventDefault();
      game.checkUserInput("position");
    }, false);
    document.querySelector("#eye-btn").addEventListener("click", function(e) {
      e.preventDefault();
      game.checkUserInput("position");
    }, false);
    document.querySelector("#ear-btn").addEventListener("touchstart", function(e) {
      e.preventDefault();
      game.checkUserInput("sound");
    }, false);
    document.querySelector("#ear-btn").addEventListener("click", function(e) {
      e.preventDefault();
      game.checkUserInput("sound");
    }, false);
  },

  // ordered procedure to initialize things properly
  init: function() {
    this._setDate();
    this.checkData();
    this.makePopups();
    this.initSettings();
    this.initEvents();
  },

  drawChart: function() {
    var maxs = [],
      avgs = [],
      mins = [];

    // find max, avg and min for each day of training in the users's history
    $.each(this.history, function(key, value) {
      if (value.data.avg() !== undefined) {
        maxs.push(value.data.max());
        avgs.push(value.data.avg());
        mins.push(value.data.min());
      }
    });

    // if avarage of N can be established then show a popup with the chart
    // otherwise display a warning message
    if (avgs.length !== 0) this.chartPopup.show();
    else setTimeout(function() {
      alert("There are insufficient data to construct the graph.");
    }, 400);

    // produces the graph inside the chartPopup
    return new Chartist.Line("#" + this.chartPopup.innerID, {
      series: [maxs, avgs, mins]
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
  }
};
