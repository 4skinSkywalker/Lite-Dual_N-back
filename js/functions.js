// converts date from computer style into human style
Date.prototype.ddmmyy = function() {
  var dd = this.getDate();
  var mm = this.getMonth()+1;
  return [(dd > 9 ? "" : "0") + dd, (mm > 9 ? "" : "0") + mm, this.getFullYear()].join("/");
};

// chart-fns start

// if the array has at least two elements it finds its max
Array.prototype.max = function() {
  if (this.length >= 2) return this.reduce(function(a, b) {
    return (Math.max(a, b));
  });
  else if (this[0] !== undefined) return this[0];
};

// if the array has at least two elements it finds its avg
Array.prototype.avg = function() {
  if (this.length >= 2) return this.reduce(function(a, b) {
    return a + b;
  }) / this.length;
  else if (this[0] !== undefined) return this[0];
};

// if the array has at least two elements it finds its min
Array.prototype.min = function() {
  if (this.length >= 2) return this.reduce(function(a, b) {
    return (Math.min(a, b));
  });
  else if (this[0] !== undefined) return this[0];
};
// chart-fns end 

// adds a class to a HTML element
// and then removes that class within a certain time
function wow(element, _class, time) {
  $(element).addClass(_class);
  setTimeout(function() {
    $(element).removeClass(_class);
  }, time);
}

// assigns a function on onChange event of an element
function onChange(element, _function) {
  $(element).on("change", _function);
};

// assigns a new function to a button and changes its text
function newOnClickFunction(element, newFunction, text) {
  $(element).prop("onClick", null).attr("onClick", newFunction);
  if (text !== undefined) $(element).text(text);
}

// from folders within "snd/" directory
// uses an array of filenames of sounds (only .wav accepted)
// and directory name (no spaces allowed, use - instead)
// to produce an array of playbale sounds via JS
function makePlaybleSounds(arrSounds, dirSounds) {
  var playableSounds = [];
  arrSounds.forEach(
    function(element) {
      playableSounds.push(
        new Howl({
          src: ["snd/" + dirSounds.replace(/\s/g, "-") + "/" + element + ".wav"]
        })
      );
    }
  );
  return playableSounds;
};

// block-building-fns start

// produces the number of stimuli and
// changes the text of the HTML stimuli-counter
function calculateStimuli(n, clues) {
  var stimuli = clues * (n + 1)
  $("#stimuli-counter").text(stimuli);
  return stimuli;
};

function prepareBlock(n, stimuli, clues) {

  // makes an array, also called block, made of empty elements
  // elements are like this: [num_code_for_position, num_code_for_sound]
  var block = [];
  for (var i = 0; i < stimuli; i++) block.push([0, 0]);

  // introduces matching stimuli, also called clues, inside the block
  function rightAmountOf(stimulus_name) {
    var el = (stimulus_name === "positions") ? 0 : 1;
    var target, amount = 0;
    while (amount < clues) {
      target = Math.floor(Math.random() * block.length);
      if (block[target + n]) {
        if (block[target][el] === 0 && block[target + n][el] === 0) {
          block[target][el] = 1 + Math.floor(Math.random() * 8);
          block[target + n][el] = block[target][el];
          amount++;
        } else if (block[target][el] !== 0 && block[target + n][el] === 0) {
          block[target + n][el] = block[target][el];
          amount++;
        } else if (block[target][el] === 0 && block[target + n][el] !== 0) {
          block[target][el] = block[target + n][el];
          amount++;
        } else {
          continue;
        }
      } else {
        continue;
      }
    }
  }

  // fill a hole with a random stimulus
  // !!! pay attention that the random stimulus may be a clue
  // this will be fixed with the help of isValidBlock function below !!!
  function fillHole(stimulus_name, idx) {
    var el = (stimulus_name === "position") ? 0 : 1;
    if (block[idx][el] === 0) {
      block[idx][el] = 1 + Math.floor(Math.random() * 8);
      if (block[idx - n] && block[idx][el] === block[idx - n][el])
        (block[idx][el] < 8) ? block[idx][el]++ : block[idx][el]--;
      else if (block[idx + n] && block[idx][el] === block[idx + n][el])
        (block[idx][el] < 8) ? block[idx][el]++ : block[idx][el]--;
    }
  }
  rightAmountOf("positions");
  rightAmountOf("sounds");

  // there are empty spots inside the block of stimuli
  // therefore it calls fillHole to fill those empty spots
  for (var i = 0; i < block.length; i++) {
    fillHole("position", i);
    fillHole("sound", i);
  }
  return block;
};

// isValidBlock helps makeBlock to establish if the block made from prepareBlock
// is made of the same amount of clues for both position and sound
function isValidBlock(block, n, clues) {
  var positions = 0, sounds = 0;
  for (var i = 0; i < block.length; i++)
    if (block[i - n]) {
      if (block[i][0] === block[i - n][0]) positions++;
      if (block[i][1] === block[i - n][1]) sounds++;
    }
  return (positions === sounds && positions === clues);
};

// returns a playble block for the game
function makeBlock(n, stimuli, clues) {
  var block;
  do {
    block = prepareBlock(n, stimuli, clues);
  } while (!isValidBlock(block, n, clues))
  return block;
};
// block-building-fns end

// produces:
// 2  : the player deserves an increasement in level
// 1  :                     to stay at the same level
// 0  :                     a descreasment in level
// -1 :                     to stay at the same level
function judgeResults(wrongPositions, wrongSounds, tolleratedErrors) {
  if (wrongPositions <= tolleratedErrors && wrongSounds <= tolleratedErrors) {
    return 2; // next level
  } else if (wrongPositions <= (tolleratedErrors+2) || wrongSounds <= (tolleratedErrors+2)) {
    return 1; // same level
  } else {
    if (game.n !== 1)
      return 0; // previous level
    else
      return -1; // level 1 failed, same level
  }
}
