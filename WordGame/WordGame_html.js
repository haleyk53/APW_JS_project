<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Word Game</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    #gameArea { margin-top: 20px; }
    .green { color: green; }
    .yellow { color: orange; }
    .red { color: red; }
  </style>
</head>
<body>

<h1>Word Game</h1>

<div id="setupArea">
  <p>Enter desired word length (between 3 and <span id="maxLength"></span>):</p>
  <input type="number" id="wordLengthInput" min="3">
  <button onclick="startGame()">Start Game</button>
</div>

<div id="gameArea" style="display:none;">
  <p><b>Guess #<span id="guessNumber">1</span></b></p>
  <div>
    <span>Letters Not Included: </span>
    <span id="wrongChars" class="red"></span>
  </div>
  <input type="text" id="guessInput" placeholder="Enter your guess">
  <button onclick="submitGuess()">Submit Guess</button>
  <div id="resultArea"></div>
</div>

<script>
const exampleWords = [
  "dog", "cat", "bird", "dragon", "zebra", "lion", "tiger", "cheetah", "elephant"
];

let wordArray = [...exampleWords];
let gameWord = "";
let wrongChars = [];
let guessCtr = 1;
let wordLength = 0;

function sortStrByLength(arr) {
  for (let i = 1; i < arr.length; i++) {
    let temp = arr[i];
    let j = i - 1;
    while (j >= 0 && temp.length < arr[j].length) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = temp;
  }
}

function linearSearchStrLength(array, value) {
  let vect = array.filter(word => word.length === value);

  if (vect.length === 0) {
    value--;
    vect = array.filter(word => word.length === value);
  }

  if (vect.length === 0) {
    return "";
  }

  const randomIndex = Math.floor(Math.random() * vect.length);
  return vect[randomIndex];
}

function compareStrings(str, strguess) {
  let numCorrect = 0;
  const result = [];
  const matched = Array(str.length).fill(false);
  const guessed = Array(str.length).fill(false);

  for (let i = 0; i < str.length; i++) {
    if (strguess[i].toLowerCase() === str[i].toLowerCase()) {
      result[i] = `<span class="green">${strguess[i]}</span>`;
      numCorrect++;
      matched[i] = true;
      guessed[i] = true;
    }
  }

  for (let i = 0; i < strguess.length; i++) {
    if (!guessed[i]) {
      for (let j = 0; j < str.length; j++) {
        if (!matched[j] && strguess[i].toLowerCase() === str[j].toLowerCase()) {
          result[i] = `<span class="yellow">${strguess[i]}</span>`;
          matched[j] = true;
          break;
        }
      }
    }
  }

  for (let i = 0; i < strguess.length; i++) {
    if (!result[i]) {
      result[i] = "_";
      const lowerChar = strguess[i].toLowerCase();
      if (!wrongChars.includes(lowerChar)) {
        wrongChars.push(lowerChar);
      }
    }
  }

  document.getElementById('resultArea').innerHTML = result.join(" ");
  return numCorrect === str.length;
}

function startGame() {
  sortStrByLength(wordArray);

  const maxWord = wordArray[wordArray.length - 1];
  const maxLength = maxWord.length;

  wordLength = parseInt(document.getElementById('wordLengthInput').value);

  if (isNaN(wordLength) || wordLength < 3 || wordLength > maxLength) {
    alert(`Please enter a valid number between 3 and ${maxLength}.`);
    return;
  }

  gameWord = linearSearchStrLength(wordArray, wordLength);
  wrongChars = [];
  guessCtr = 1;

  document.getElementById('setupArea').style.display = 'none';
  document.getElementById('gameArea').style.display = 'block';
  document.getElementById('wrongChars').textContent = '';
  document.getElementById('guessNumber').textContent = guessCtr;
  document.getElementById('guessInput').value = "";
  document.getElementById('resultArea').innerHTML = "";
}

function submitGuess() {
  const userGuess = document.getElementById('guessInput').value.trim();

  if (userGuess.length !== wordLength) {
    alert(`Guess must be exactly ${wordLength} letters.`);
    return;
  }

  if (compareStrings(gameWord, userGuess)) {
    document.getElementById('resultArea').innerHTML += "<p><b>Congratulations! You guessed the word!</b></p>";
    document.getElementById('guessInput').disabled = true;
  } else {
    guessCtr++;
    document.getElementById('guessNumber').textContent = guessCtr;
    document.getElementById('wrongChars').textContent = wrongChars.join(" ");
    document.getElementById('guessInput').value = "";
  }
}

// Initialize the page
sortStrByLength(wordArray);
document.getElementById('maxLength').textContent = wordArray[wordArray.length - 1].length;
</script>

</body>
</html>
