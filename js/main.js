var enviroment = {

  name: "DNB_1.0.0.0", // name of the enviroment
  history: {}, // collection of data
  sounds: {
    "Numbers English (USA)": [1, 2, 3, 4, 5, 6, 7, 8],
    "Numbers English (UK)": [1, 2, 3, 4, 5, 6, 7, 8],
    "Numbers German": [1, 2, 3, 4, 5, 6, 7, 8],
    "Numbers Russian": [1, 2, 3, 4, 5, 6, 7, 8],
    "Numbers Italian": [1, 2, 3, 4, 5, 6, 7, 8],
    "Letters English (USA)": ["c", "h", "k", "l", "q", "r", "s", "t"],
    "Letters English (UK)": ["c", "h", "k", "l", "q", "r", "s", "t"],
    "Letters German": ["c", "h", "k", "l", "q", "r", "s", "t"],
    "Letters Russian": ["c", "h", "k", "l", "q", "r", "s", "t"],
    "Letters Italian": ["c", "h", "k", "l", "q", "r", "s", "x"],
    "Shapes English": ["point", "line", "circle", "triangle", "square", "rectangle", "pentagon", "hexagon"],
    "Shapes Italian": ["punto", "linea", "cerchio", "triangolo", "quadrato", "rettangolo", "pentagono", "esagono"]
  }, // a map that shows the structure of snd/ directory

  // sets the date for today (day/month/year)
  _setDate: function() {
    this.today = (new Date).ddmmyy();
  },

  // makes two popups and a progress bar
  // appends those popups into the body
  // appends progressBar into the resultsPopup
  makePopups: function() {
    this.resultsPopup = new Popup("enviroment.resultsPopup", "results");
    this.chartPopup = new Popup("enviroment.chartPopup", "chart");
    this.progressBar = new Progress("enviroment.progressBar", "1vh", "rgba(0, 0, 0, 0.33)", "white");
    document.body.innerHTML += this.resultsPopup.getHTML() + this.chartPopup.getHTML();
    document.getElementById(this.resultsPopup.outerID).innerHTML += this.progressBar.getHTML();
  },

  // checks whether popus are opened, in such case closes them
  closeAllPopups: function() {
    if (this.resultsPopup.isOpen) this.resultsPopup.hide();
    if (this.chartPopup.isOpen) this.chartPopup.hide();
  },

  // increments runs of today within history
  // if requested puts N into data for today, within history
  // then saves history into localStorage
  saveStats: function(save) {
    this.history[this.today].runs++;
    if (save === true) this.history[this.today].data.push(game.n);
    this.save();
  },

  // if there's no data for today within history
  // it creates the key of today
  // the value of the key for today is initialized
  // then saves history into localStorage
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

  // checks if savegame exists within localStorage
  // if savegame already exists checkData loads it and initializes for today
  checkData: function() {
    if (localStorage[this.name]) this.load();
    this.initHistory(this.today);
  },

  // assigns to each HTML setting element a onChange function
  // which determines how that setting will influence game object variables
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
      $("#N-level").text("N = " + txt);
    });
    onChange("#select-sound", function() {
      game.updateSounds();
    });
    onChange("#feedback", function() {
      game.feedback = Number($("#feedback").val());
      $("#feedback-span").text(game.feedback === 1 ? "on" : "off");
    });

    // appends sounds keys of enviroment.sound to #select-sound
    var sounds = this.sounds;
    for (var key in sounds)
      if (sounds.hasOwnProperty(key))
        $("#select-sound").append("<option>" + key + "</option>");
  },

  // assigns to the required key and buttons specific functions
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

    // initializes click and touch events
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

    // if there are sufficient data show the chart
    // otherwise display a warning message
    if (avgs.length !== 0) this.chartPopup.show();
    else setTimeout(function() {
      alert("There are insufficient data to construct the graph.");
    }, 400);

    // produces the chart inside the chartPopup
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
