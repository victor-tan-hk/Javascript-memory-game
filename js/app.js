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

  console.log("awesome");
  createHTMLForMainGameArea();

  // Set an event listener on all the boxes in the grid in the
  // main game play area
  flipBoxes = document.getElementsByClassName('flip-box-inner');
  for (let flipBox of flipBoxes) {
    flipBox.addEventListener('click', doFlip);
  }  

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

  if (successfulMatch == NUM_DIFF_IMAGES)
    console.log("End of game ! All images matched !");
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


/* Global variables */


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


/* Get a reference to the start button and set event listener to respond
to click events to start / restart the game
*/

let startButton = document.getElementById('start-button');
startButton.addEventListener('click', startGame);
