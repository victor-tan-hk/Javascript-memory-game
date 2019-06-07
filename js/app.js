/**
* @description This shuffles the numbers in an integer array using a customized algorithm, instead of the standard Fisher-Yates (Knuth) Shuffle. This algorithm relies on the numbers in the array BEING POSITIVE !

* @param {array} array
* @returns {array} Array of shuffled numbers
*/

function shuffle(array) {
  let newArray = [];
  for (let i = 0; i < array.length; i++) {
      newArray[i] = -1;
  }

  let posToPlace;
  for (let arrPos = 0; arrPos < array.length; arrPos++) {
      posToPlace = Math.floor(Math.random() * (array.length - arrPos));  
      let fillPos = 0;
      for (let newArrayPos = 0; newArrayPos < array.length; newArrayPos++) {
          if (newArray[newArrayPos] < 0) {
              if (fillPos === posToPlace) {
                  newArray[newArrayPos] = array[arrPos];
                  break;
              }
              fillPos++;    
          }
      }
      
  }

  return newArray;
}



/**
* @description This generates an initial array containing the numbers to be reshuffled. Each number corresponds to a specific symbol to be matched on the
flipbox. Each number is generated numSymbolsToMatch times
* @returns {array} An array of integers
*/

function generateArrayRandomNumbers() {

  let numArr = [];
  let arrPos = 0;
  for (let i = 0; i < currentLevel.numSymbolsToMatch; i++) {
    for (let j = 1; j <= NUM_DIFF_IMAGES; j++) {
      numArr[arrPos++] = j;
    }
  }
  let shuffledArray = shuffle(numArr);
  return shuffledArray;

}



/**
* @description This creates the HTML for a single flip box
* @returns {string} The HTML string
*/

function createHTMLForFlipBox(currentBaseUrl, iconNumber) {

  let htmlSnippet = `
<div class="flip-box">`;

  if (DEBUG_MODE)
    htmlSnippet += iconNumber;
  htmlSnippet += `
  <div class="flip-box-inner">
    <div class="flip-box-front">
      <img src="`;

  htmlSnippet += BOX_FRONT_IMAGE_URL;
  htmlSnippet += `" class="box-images" alt="">
    </div>
    <div class="flip-box-back">
      <img src="`;

  htmlSnippet += currentBaseUrl + 'icon' + iconNumber + '.svg" ';
  htmlSnippet += ` class="box-images" alt="">
    </div>
  </div>
</div>
`;

  return htmlSnippet;
}


/**
* @description This creates the HTML for a dummy flip box. Used as
a temporary measure to address the CSS styling issue for the
row containing the flip boxes
* @returns {string} The HTML string
*/

function createHTMLForDummyBox() {

  let htmlSnippet = `
<div class="flip-box">
  <img src="`;
  htmlSnippet += BOX_FRONT_IMAGE_URL;
  htmlSnippet += `" class="dummy-images" alt="">
</div>
`;

  return htmlSnippet;
}


/**
* @description This creates the HTML for the div containing the row of
flip-boxes
* @returns {string} The HTML string
*/

function createHTMLForBoxRow() {

  let htmlSnippet = `<div class="box-row">`;

  return htmlSnippet;
}


/**
* @description This dynamically generates the complete HTML for the grid of
flip boxes in the main game area by building up a HTML string through
concatenating the results from repeated calls to the previous functions.
This HTML snippet is then appended as the content of the corresponding
section for this area
*/
function createHTMLForMainGameArea() {


  let imgNumArray = generateArrayRandomNumbers();

  let numBoxesPerRow = currentLevel.numSymbolsToMatch * NUM_DIFF_IMAGES / TOTAL_ROWS;
  let gameAreaHTML = '';
  let gameAreaElement = document.getElementById("main-game-area");
  let arrPos = 0;

  for (let rowNum = 0; rowNum < TOTAL_ROWS; rowNum++ ) {

    gameAreaHTML += createHTMLForBoxRow();

    for (let imgNum = 0; imgNum < numBoxesPerRow; imgNum ++) {
      gameAreaHTML += createHTMLForFlipBox(currentBaseUrl, imgNumArray[arrPos++]);
    }

    gameAreaHTML += createHTMLForDummyBox();
    gameAreaHTML += `</div>`;
    //alert(gameAreaHTML);
  }
  gameAreaElement.innerHTML = gameAreaHTML;

}



/**
* @description Handles the start of the game (when the HTML is loaded
for the first time) as well as any subsequent restarts in the middle
of an existing game. 

*/

function startGame() {

  /*Reset all relevant variables*/
  numBoxFlipped = 0;
  imgToMatch = '';
  boxesFlipped = [];
  successfulMatch = 0;
  matchAverage = 0.0;
  gameStarted = true;
  numMoves = 0;

  // Stop the count down timer
  // in case this is a reset from an existing game
  gameTimer.stop();
  
  difficultyElement.textContent = currentLevel.name;
  movesElement.textContent = "Moves: 0";
  timerElement.textContent = "0m : 00s";
  startButton.textContent = "Restart";

  // Reset the star ratings for both the main and modal display
  resetStars();  
  
  
  createHTMLForMainGameArea();

  // Set an event listener on all the boxes in the grid in the
  // main game play area
  flipBoxes = document.getElementsByClassName('flip-box-inner');
  for (let flipBox of flipBoxes) {
    flipBox.addEventListener('click', doFlip);
  }  

  // Start count down timer for game
  gameTimer.start(gameTime);  

}


/**
* @description Performs the flip animation on a clicked flip box
by adding flipped to its class attribute so that the appropiate
CSS animation is activated. Sets a timeout for checking whether
this box matches with existing flipped boxes.
*/

function doFlip() {

  if (!this.classList.contains('flipped')) {
    movesElement.textContent = "Moves: "+ ++numMoves;
    this.classList.add('flipped');
    setTimeout(checkMatch,1000, this);

  }
}

/**
* @description Handles the end of the game where all boxes are flipped
and all symbols successfully matched.

The count up is stopped and the time is displayed in the appropriate
element in the relevant modal boxes and main game view

If the time qualifies for a high score, the high score modal is displayed
otherwise a normal end of game modal is displayed
*/

function endGame() {

  gameTimer.stop();
  console.log("end of game reached !");


}


/**
* @description Check whether the most recently flipped box (currFlipBox)
has a symbol that matches the existing flipped boxes. It then calls the
appropriate function to handle the case of

- a mismatch
- a successful match for the predefined number of consecutive symbols (2,3 or 4)

It computes the match average and calls the function to highlight the appropriate number of stars for this average

If all boxes are flipped and all symbols are successfully matched, the function
to handle the game end is called

* @param {Element} currFlipBox
*/


function checkMatch(currFlipBox) {

  let currImgURL = currFlipBox.getElementsByTagName('img')[1].getAttribute('src');
  boxesFlipped.push(currFlipBox);
  numBoxFlipped++;

  if (numBoxFlipped == 1) {
    imgToMatch = currImgURL;
  } else if (currImgURL !== imgToMatch) {
      showErrorSymbol();
  } else if (numBoxFlipped === currentLevel.numSymbolsToMatch) {
      ++successfulMatch;
      doShake();
      resetVariables();
  }

  matchAverage = Math.floor(successfulMatch/numMoves*100);

  doStarsHighlight();


  if (successfulMatch == NUM_DIFF_IMAGES)
    endGame();
}

/**
* @description Highlight the stars for all modal boxes as well as the game view
that they appear in.

matchAverage = successfulMatches / numMoves * 100

Since the fastest a successful match can occur is in 2 moves (for the case of
2 consecutive symbols), the highest possible value for matchAverage at any
single time is 50.

The stars highlighted depend on the value of matchAverage

10-19: 2
20-29: 3
30-39: 4
40-50: 5

There is at least one star highlighted regardless of the value of matchAverage

//TODO: need to further refine the matchAverage scale above for the case of 3
 (Difficulty: HARD) and 4 (Difficulty: INSANE) consecutive matches.
 For e.g. the fastest a successful match can occur is 3 moves for the case of
 3 consecutive symbols, which means the highest possible value of matchAverage
 is 33.33. The range for the 5 stars must then fall in that category, e.g.

 6 - 12: 2
 13 - 18: 3
 19 - 25: 4
 26 - 33: 5

 Equivalent comments apply as well for 4 consecutive matches.

*/

function doStarsHighlight() {

  for (let theStars of starsSpan) {

    for (let arrPos = 1; arrPos < theStars.length; arrPos++) {

      if (matchAverage >= (arrPos*10) ) {
        if (!theStars[arrPos].classList.contains("checked"))
          theStars[arrPos].classList.add("checked");
      } else {
        if (theStars[arrPos].classList.contains("checked"))
          theStars[arrPos].classList.remove("checked");
      }

    }

  }

}


/**
* @description Puts an error image on the existing flipped boxes whose
symbols do not match. Sets a timeout to flip these boxes back to the
original closed card symbol.
*/

function showErrorSymbol() {

  for (let flipBox of boxesFlipped) {

    let currImgURL = flipBox.getElementsByTagName('img')[1].getAttribute('src');
    flipBox.getElementsByTagName('img')[1].setAttribute('src', ERROR_IMAGE_URL);
    setTimeout(doFlipBack,1000,flipBox,currImgURL);

  }

  resetVariables();

}


/**
* @description Tags the open flipped boxes with the do-shake class label
in order to start the CSS shake animation to indicate a successful match
in the symbols on all these boxes
*/

function doShake() {

  for (let flipBox of boxesFlipped) {
    let imgToShake = flipBox.getElementsByTagName('img')[1];
    imgToShake.classList.add('do-shake');
  }

}

/**
* @description Resets the image on the back of the flip box
to its original image
* @param {Element object} flipBox
* @param {string} currImgURL
*/

function doFlipBack(flipBox,currImgURL) {
  flipBox.classList.remove('flipped');
  flipBox.getElementsByTagName('img')[1].setAttribute('src', currImgURL);
}




/**
* @description Resets the two variables used to keep track of the number of boxes
that have been flipped as well as the references to those flipped boxes
*/

function resetVariables() {
  numBoxFlipped = 0;
  boxesFlipped.length = 0;
}

/**
* @description Reset the stars for all modal boxes as well as the main game
play area that they appear in
*/

function resetStars() {

  for (let theStars of starsSpan) {
    for (let arrPos = 1; arrPos < theStars.length; arrPos++) {
      if (theStars[arrPos].classList.contains("checked"))
        theStars[arrPos].classList.remove("checked");
    }
  }
}

/* Global variables */

/* Constant used for the difficulty level settings */

const DIFFICULTY_LEVELS = [
  { name: 'EASY', numSymbolsToMatch : 2, highScoreList: []},
  { name: 'HARD', numSymbolsToMatch : 3, highScoreList: []},
  { name: 'INSANE', numSymbolsToMatch : 4, highScoreList: []},

];

/* Constant used for the icon group game settings */

const ICON_GROUPS = [
  {name:"SOCIAL", symbolImageBaseUrl : 'images/social/', },
  {name:"FOOD", symbolImageBaseUrl : 'images/food/', },
  {name:"FUN", symbolImageBaseUrl : 'images/fun/', },

];

/* Variables to keep track of the current difficulty and
image base directory for the selected icon group
*/

let currentLevel = { name: 'EASY', numSymbolsToMatch : 2, highScoreList: []};
let currentBaseUrl = 'images/social/';



/* Used as a reference to images to use, to be customized by
developer if need be
*/

const BOX_FRONT_IMAGE_URL = 'images/boxfront.jpg';
const ERROR_IMAGE_URL = 'images/error.png';

/* For modification by developer to customize layout of images
in the main game play area
*/

const TOTAL_ROWS = 4;
const NUM_DIFF_IMAGES = 8;


/* For use by developer to help in debugging and testing existing code
When set to true

- all flip boxes are labelled with a number corresponding to their
hidden symbols
- the rating for the player is shown in game play

*/

const DEBUG_MODE = true;


/* Variables for use in game play */

let numBoxFlipped = 0;
let imgToMatch = '';
let boxesFlipped = [];
let successfulMatch = 0;
let matchAverage = 0.0;
let gameStarted = false;
let numMoves = 0;
let flipBoxes;
let posToInsertHighScore;

/* Get reference to the elements that will be used to display info during game play */
let difficultyElement = document.getElementById("level-text-main");
let timerElement = document.getElementById("timer-text");
let movesElement = document.getElementById("moves-text");
let ratingElement = document.getElementById("rating-text");

/* Get reference to the span element for all  5 stars for all occurrences of  this icon in the HTML */

let starsElements = document.getElementsByClassName("stars-part");
let starsSpan = [];
for (let elem of starsElements) {
  starsSpan.push(elem.getElementsByTagName('span'));
}

/* Predefined game time (in secs) to assist in the count up timer
Assume the game will never last longer than 30 mins
*/

let gameTime = 60 * 30;

/* Set up count up timer functionality using the Timer.js countdown 
timer library. To implement a count up, subtract the current countdown 
time from gameTime.
*/

let gameTimer = new Timer({
  tick : 1,
  ontick : function (sec) {

      let timeDifference = (gameTime*1000) - sec;
      let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    
      let secondsString = String(seconds);
      if (seconds < 10) {
        secondsString = '0' + secondsString;
      }
    
      timerElement.textContent = ""+minutes+"m : " + secondsString+"s";
  },
});




/* Get a reference to the start button and set event listener to respond
to click events to start / restart the game
*/

let startButton = document.getElementById('start-button');
startButton.addEventListener('click', startGame);

/*
Get references to the li for the game options available from the drop down menu
Set click events for these options to open up the appropriate modal boxes
Append the name of the menu option to -modal to get the name of the matching element
*/

let menuOptions = document.querySelectorAll(".dropdown-content ul li");
let modalToOpen;

for (let option of menuOptions) {
  option.addEventListener('click', function() {
    modalToOpen = document.getElementById(this.textContent.toLowerCase() + '-modal');
    modalToOpen.style.display = "block";

  });
}

/*
Get references to the icon selections available from the modal boxes for the 2 menu options (Difficulty and Icons)
For Difficulty, set click events for the corresponding options to restart the game at the appropriate level
For Icons, set click events for the corresponding options to choose a different image URL base path and restart the game at the current level */

let imageOptions = document.getElementsByClassName("modal-selections");
for (let option of imageOptions) {
  option.addEventListener('click', function() {

    modalToOpen.style.display = "none";

    let chosenOption = this.querySelector("p").textContent;

    for (let group of ICON_GROUPS) {
      if (group.name === chosenOption) {
        currentBaseUrl = group.symbolImageBaseUrl;
        startGame();
      }
    }


  });
}
