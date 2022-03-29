// converts date from computer style into human style (day/month/year)
Date.prototype.ddmmyy = function() {
  var dd = this.getDate();
  var mm = this.getMonth()+1;
  return [(dd > 9 ? "" : "0") + dd, (mm > 9 ? "" : "0") + mm, this.getFullYear()].join("/");
};

// chart-fns start

// if the array has at least two elements finds its max
Array.prototype.max = function() {
  if (this.length >= 2) return this.reduce(function(a, b) {
    return (Math.max(a, b));
  });
  else if (this[0] !== undefined) return this[0];
};

// if the array has at least two elements finds its avg
Array.prototype.avg = function() {
  if (this.length >= 2) return this.reduce(function(a, b) {
    return a + b;
  }) / this.length;
  else if (this[0] !== undefined) return this[0];
};

// if the array has at least two elements finds its min
Array.prototype.min = function() {
  if (this.length >= 2) return this.reduce(function(a, b) {
    return (Math.min(a, b));
  });
  else if (this[0] !== undefined) return this[0];
};
// chart-fns end

// adds a class to a HTML element
// and then removes that class after a certain amount of time
function wow(element, _class, time) {
  let el = document.querySelector(element);
  el.classList.add(_class);
  setTimeout(function() {
    el.classList.remove(_class);
  }, time);
}

// assigns a function onChange of an element
function onChange(element, _function) {
  $(element).on("change", _function);
};

// assigns a new function to a button and changes its text
function newOnClickFunction(element, newFunction, text) {
  $(element).prop("onClick", null).attr("onClick", newFunction);
  if (text !== undefined) $(element).text(text);
}

// uses an array of filenames of sounds (only .mp3 accepted)
// and directory name
// to match the structure of snd/ directory
// to produce an array of playbale sounds via JS
function makePlaybleSounds(arrSounds, dirSounds) {
  var playableSounds = [];
  arrSounds.forEach(
    function(sndFile) {
      playableSounds.push(
        new Howl({
          src: ["snd/" + dirSounds + "/" + sndFile],
          preload: true
        })
      );
    }
  );
  return playableSounds;
};

// block-building-fns start

// produces the number of stimuli
// changes the text of #stimuli-counter
function calculateStimuli(n, clues) {
  var stimuli = 2 * n * clues;
  $("#stimuli-counter").text(stimuli);
  return stimuli;
};

function prepareBlock(n, stimuli, clues) {

  // makes an array, also called block, made of empty elements
  var block = [];
  for (var i = 0; i < stimuli; i++) block.push([0, 0, 0, 0]);

  // introduces matching stimuli, also called clues, inside the block
  function rightAmountOf(stimulus_name) {

    var stimulusButtons = ["eye-left-btn", "ear-left-btn", "ear-right-btn", "eye-right-btn"];
    var el = stimulusButtons.indexOf(stimulus_name);
    
    var target, amount = 0;
    while (amount < clues) {
      target = Math.floor(Math.random() * block.length);
      if (block[target + n]) {
        if (block[target][el] === 0 && block[target + n][el] === 0) {
          block[target][el] = Math.floor(Math.random() * 8);
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

  // fills a hole with a random stimulus
  //
  // you have to pay attention that "a random stimulus" may be also a clue
  function fillHole(stimulus_name, idx) {
    
    var stimulusButtons = ["eye-left-btn", "ear-left-btn", "ear-right-btn", "eye-right-btn"];
    var el = stimulusButtons.indexOf(stimulus_name);

    // zero is used as the non-initialized stimulus
    if (block[idx][el] === 0) {
      block[idx][el] = 1 + Math.floor(Math.random() * 8);
      if (block[idx - n] && block[idx][el] === block[idx - n][el] || block[idx + n] && block[idx][el] === block[idx + n][el])
        (block[idx][el] < 8)
          ? block[idx][el]++
          : block[idx][el]--
    }
  }
  rightAmountOf("eye-left-btn");
  rightAmountOf("ear-left-btn");
  rightAmountOf("ear-right-btn");
  rightAmountOf("eye-right-btn");

  // there are empty spots inside the block of stimuli
  // therefore calls fillHole to fill those empty spots
  for (var i = 0; i < block.length; i++) {
    fillHole("eye-left-btn", i);
    fillHole("ear-left-btn", i);
    fillHole("ear-right-btn", i);
    fillHole("eye-right-btn", i);
  }

  return block;
};

// let pd be what the player deserves
//
// judgeResults produces:
// 2  : pd to proceed to the next in level
// 1  : pd to stay at the same level
// 0  : pd to come back to the previous level
// -1 : pd to stay at the same level (there's no level below 1)
function judgeResults(wrongPositions, wrongSounds, tolleratedErrors) {
  if (wrongPositions <= tolleratedErrors && wrongSounds <= tolleratedErrors) {
    return 2; // next level
  } else if (wrongPositions <= (tolleratedErrors+3) || wrongSounds <= (tolleratedErrors+3)) {
    return 1; // same level
  } else {
    if (game.n !== 1)
      return 0; // previous level
    else
      return -1; // level 1 failed, same level
  }
}
