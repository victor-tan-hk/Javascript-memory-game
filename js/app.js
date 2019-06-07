

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


  let imgNumArray = [1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8];

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




/* Get a reference to the start button and set event listener to respond
to click events to start / restart the game
*/

let startButton = document.getElementById('start-button');
startButton.addEventListener('click', startGame);
