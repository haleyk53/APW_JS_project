let targetNumber;
let attempts = 0;
let gameActive = false;

function startNewGame() {
    targetNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    gameActive = true;
    document.getElementById('message').textContent = '';
    document.getElementById('attempts').textContent = 'Attempts: 0';
    document.getElementById('guessInput').value = '';
    document.getElementById('guessInput').focus();
}

function makeGuess() {
    if (!gameActive) {
        startNewGame();
        return;
    }

    const guessInput = document.getElementById('guessInput');
    const guess = parseInt(guessInput.value);
    const messageElement = document.getElementById('message');
    const attemptsElement = document.getElementById('attempts');

    if (isNaN(guess) || guess < 1 || guess > 100) {
        messageElement.textContent = 'Please enter a valid number between 1 and 100';
        return;
    }

    attempts++;
    attemptsElement.textContent = `Attempts: ${attempts}`;

    if (guess === targetNumber) {
        messageElement.textContent = `Congratulations! You found the number in ${attempts} attempts!`;
        messageElement.style.color = '#28a745';
        gameActive = false;
        saveScore(attempts);
    } else if (guess < targetNumber) {
        messageElement.textContent = 'Too low! Try a higher number.';
        messageElement.style.color = '#dc3545';
    } else {
        messageElement.textContent = 'Too high! Try a lower number.';
        messageElement.style.color = '#dc3545';
    }

    guessInput.value = '';
    guessInput.focus();
}

function saveScore(attempts) {
    fetch('/api/numberguess/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attempts: attempts })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save score');
        }
        console.log('Score saved successfully!');
    })
    .catch(error => {
        console.error('Error saving score:', error);
    });
}

// Start the game when the page loads
window.onload = startNewGame;

// Allow Enter key to submit guess
document.getElementById('guessInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        makeGuess();
    }
}); 