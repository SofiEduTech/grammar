// ========== GRAMMAR GAME LOGIC ==========

// Sound Effects (using Web Audio API)
const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'correct') {
        // Happy sound
        oscillator.frequency.value = 523.25; // C5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'wrong') {
        // Sad sound
        oscillator.frequency.value = 200;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'complete') {
        // Victory sound
        oscillator.frequency.value = 659.25; // E5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    }
};

// Game State
let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let gameActive = false;

// Start Game Function
function startGame(questionsArray) {
    questions = shuffleArray([...questionsArray]); // Shuffle questions
    currentQuestionIndex = 0;
    score = 0;
    gameActive = true;
    
    // Hide start button, show game container
    document.querySelector('.start-game-btn').style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';
    
    // Load first question
    loadQuestion();
}

// Shuffle Array Function (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Load Question Function
function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    // Update question counter
    document.querySelector('.question-counter').textContent = 
        `Question ${currentQuestionIndex + 1} / ${questions.length}`;
    
    // Update score display
    document.querySelector('.score-display').innerHTML = 
        `🏆 Score: ${score}`;
    
    // Update question text
    document.querySelector('.question-text').textContent = currentQuestion.question;
    
    // Clear previous options
    const optionsGrid = document.querySelector('.options-grid');
    optionsGrid.innerHTML = '';
    
    // Shuffle options
    const shuffledOptions = shuffleArray([...currentQuestion.options]);
    
    // Create option buttons
    shuffledOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option, currentQuestion.correct, btn);
        optionsGrid.appendChild(btn);
    });
    
    // Clear feedback
    const feedbackDiv = document.querySelector('.feedback');
    if (feedbackDiv) {
        feedbackDiv.style.display = 'none';
    }
}

// Check Answer Function
function checkAnswer(selectedAnswer, correctAnswer, button) {
    if (!gameActive) return;
    
    gameActive = false; // Prevent multiple clicks
    
    const allButtons = document.querySelectorAll('.option-btn');
    const feedbackDiv = document.querySelector('.feedback');
    
    // Disable all buttons
    allButtons.forEach(btn => btn.disabled = true);
    
    if (selectedAnswer === correctAnswer) {
        // Correct answer
        button.classList.add('correct');
        score++;
        playSound('correct');
        
        feedbackDiv.textContent = '✅ Great Job! That\'s Correct! 🎉';
        feedbackDiv.className = 'feedback correct';
        feedbackDiv.style.display = 'block';
        
        // Update score
        document.querySelector('.score-display').innerHTML = `🏆 Score: ${score}`;
        
        // Move to next question after delay
        setTimeout(() => {
            currentQuestionIndex++;
            gameActive = true;
            loadQuestion();
        }, 2000);
        
    } else {
        // Wrong answer
        button.classList.add('wrong');
        playSound('wrong');
        
        // Highlight correct answer
        allButtons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
        
        feedbackDiv.textContent = '❌ Oops! Try Again! 💪';
        feedbackDiv.className = 'feedback wrong';
        feedbackDiv.style.display = 'block';
        
        // Move to next question after delay
        setTimeout(() => {
            currentQuestionIndex++;
            gameActive = true;
            loadQuestion();
        }, 2500);
    }
}

// End Game Function
function endGame() {
    const gameContainer = document.querySelector('.game-container');
    const percentage = Math.round((score / questions.length) * 100);
    
    let message = '';
    let emoji = '';
    
    if (percentage === 100) {
        message = 'PERFECT SCORE! You\'re a Grammar Star! ⭐';
        emoji = '🎉🏆🌟';
    } else if (percentage >= 80) {
        message = 'Excellent Work! You\'re doing great!';
        emoji = '🎊🎯';
    } else if (percentage >= 60) {
        message = 'Good Job! Keep practicing!';
        emoji = '👍😊';
    } else {
        message = 'Nice Try! Let\'s practice more!';
        emoji = '💪📚';
    }
    
    gameContainer.innerHTML = `
        <div class="feedback complete">
            <div style="font-size: 4rem; margin-bottom: 20px;">${emoji}</div>
            <div>🏆 Game Complete! 🏆</div>
            <div style="font-size: 2.5rem; margin: 20px 0;">
                Final Score: ${score}/${questions.length}
            </div>
            <div style="font-size: 2rem; margin: 20px 0;">
                ${percentage}% Correct
            </div>
            <div style="font-size: 1.8rem; margin-top: 20px;">
                ${message}
            </div>
            <button class="start-game-btn" onclick="location.reload()" style="margin-top: 40px;">
                🔄 Play Again
            </button>
            <a href="index.html" class="start-game-btn" style="display: inline-block; margin-top: 20px; text-decoration: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                🏠 Back to Home
            </a>
        </div>
    `;
    
    playSound('complete');
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add click sound to all topic cards on index page
    const topicCards = document.querySelectorAll('.topic-card');
    topicCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Subtle hover sound could be added here
        });
    });
    
    // Check if we're on a game page
    const startButton = document.querySelector('.start-game-btn');
    if (startButton && typeof gameQuestions !== 'undefined') {
        startButton.addEventListener('click', () => {
            startGame(gameQuestions);
        });
    }
});