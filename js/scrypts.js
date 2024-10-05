const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const rankingScreen = document.getElementById('ranking-screen');
const board = document.getElementById('game-board');
const resetButton = document.getElementById('reset-game');
const easyModeButton = document.getElementById('easy-mode');
const hardModeButton = document.getElementById('hard-mode');
const backToStartButton = document.getElementById('back-to-start');
const backToStartRankingButton = document.getElementById('back-to-start-ranking');
const playerNameInput = document.getElementById('player-name');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const multiplierDisplay = document.getElementById('multiplier');
const rankingList = document.getElementById('ranking-list');

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchCount = 0;
let totalPairs = 0;
let score = 0;
let playerName = '';
let timeLeft = 60; // Inicia com 60 segundos
let timer;
let multiplier = 1; // Multiplicador inicial
let resetMultiplierTimeout; // Timeout para reiniciar o multiplicador após 5 segundos
let gameActive = false; // Controle para saber se o jogo está ativo

const images = [
    'images/bellsprout.svg',
    'images/bullbasaur.svg',
    'images/charmander.svg',
    'images/dratini.svg',
    'images/eevee.svg',
    'images/mewoth.svg',
    'images/pikachu.svg',
    'images/psyduck.svg',
    'images/snorlax.svg',
    'images/squirtle.svg',
    'images/venonat.svg',
    'images/arceus.svg'
];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createBoard(size) {
    const totalCards = size === 16 ? 8 : 12; // Número total de pares
    const selectedImages = images.slice(0, totalCards);
    const allCards = [...selectedImages, ...selectedImages]; // Duplica as imagens para pares
    shuffle(allCards);
    board.className = size === 16 ? 'easy-mode' : 'hard-mode';
    board.innerHTML = '';
    allCards.forEach((image) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.image = image; // Modificado para usar a imagem
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front"><img src="images/pokebola.svg" alt="Pokebola"></div>
                <div class="card-back"><img src="${image}" alt="Card Image"></div> <!-- Usando imagem -->
            </div>
        `;
        cardElement.addEventListener('click', flipCard);
        board.appendChild(cardElement);
    });
    totalPairs = size === 16 ? 8 : 12;
    resetTimer(); // Reinicia o timer ao criar o tabuleiro
}

function flipCard() {
    if (lockBoard || this === firstCard) return;

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    // Desabilitar novos cliques até que a verificação da combinação atual termine
    lockBoard = true;

    if (firstCard.dataset.image === secondCard.dataset.image) {

        // Se as cartas combinam
        disableCards();
        score += 10 * multiplier;
        scoreDisplay.textContent = score;

        // Aumenta o multiplicador
        multiplier = Math.min(multiplier + 0.5, 2.5);
        multiplierDisplay.textContent = multiplier.toFixed(1);

        matchCount += 1;
        if (matchCount === totalPairs) {
            clearInterval(timer);
            setTimeout(() => {
                alert(`Parabéns, ${playerName}! Você encontrou todos os pares!`);
                saveScore();
            }, 100); // Adicionando um pequeno atraso antes de salvar a pontuação
        }

        // Reinicia o temporizador para retornar a 1x após 5 segundos
        clearTimeout(resetMultiplierTimeout);
        resetMultiplierTimeout = setTimeout(() => {
            multiplier = 1;
            multiplierDisplay.textContent = multiplier.toFixed(1);
        }, 5000);
    } else {
        // Se não combinam, desvirar as cartas após um pequeno atraso
        setTimeout(unflipCards, 500);
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 500);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

resetButton.addEventListener('click', resetGame);

function resetGame() {
    matchCount = 0;
    score = 0;
    scoreDisplay.textContent = score;
    multiplier = 1;
    multiplierDisplay.textContent = multiplier.toFixed(1);
    clearInterval(timer); // Parar o timer atual
    gameActive = false; // Desativa o jogo até que seja reiniciado

    const currentMode = board.classList.contains('easy-mode') ? 16 : 36;
    createBoard(currentMode);
    resetTimer(); // Reiniciar o timer ao criar o tabuleiro
}

function startGame(mode) {
    playerName = playerNameInput.value;
    if (!playerName) {
        alert("Por favor, insira seu nome!");
        return;
    }
    startScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    matchCount = 0;
    score = 0;
    scoreDisplay.textContent = score;
    multiplier = 1; // Reseta o multiplicador ao iniciar
    multiplierDisplay.textContent = multiplier.toFixed(1);
    createBoard(mode);
    gameActive = true; // Define que o jogo está ativo
    startTimer(); // Inicia o timer
}

function startTimer() {
    clearInterval(timer); // Limpa o temporizador existente
    timeLeft = 60; // Resetando o tempo para 60 segundos
    timerDisplay.textContent = timeLeft; // Atualiza a exibição do temporizador

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert(`Tempo esgotado, ${playerName}! Sua pontuação foi: ${score}`);
            saveScore();
        }
    }, 1000); // Define o intervalo para 1000ms (1 segundo)
}

function saveScore() {
    const scoresKey = board.classList.contains('easy-mode') ? 'easyScores' : 'hardScores'; // Define a chave com base no modo
    const scores = JSON.parse(localStorage.getItem(scoresKey)) || [];
    
    // Verifica se o jogador já existe no ranking
    const existingPlayerIndex = scores.findIndex(player => player.name === playerName);

    if (existingPlayerIndex > -1) {
        // Se o jogador existe, atualiza a pontuação se a nova pontuação for maior
        if (scores[existingPlayerIndex].score < score) {
            scores[existingPlayerIndex].score = score;
        }
    } else {
        // Se o jogador não existe, adiciona ao ranking
        scores.push({ name: playerName, score: score });
    }
    
    scores.sort((a, b) => b.score - a.score); // Ordena de forma decrescente
    
    localStorage.setItem(scoresKey, JSON.stringify(scores)); // Salva no localStorage o ranking para o modo correto
    showRanking();
}

function showRanking() {
    const scoresKey = board.classList.contains('easy-mode') ? 'easyScores' : 'hardScores'; // Define a chave com base no modo
    rankingScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    startScreen.style.display = 'none';
    rankingList.innerHTML = ''; // Limpa o ranking anterior

    const scores = JSON.parse(localStorage.getItem(scoresKey)) || [];
    scores.sort((a, b) => b.score - a.score); // Ordena de forma decrescente

    // Adiciona a pontuação atual do jogador ao ranking
    const currentPlayerLi = document.createElement('li');
    currentPlayerLi.textContent = `Parabéns "${playerName}" você marcou [${score}] pontos nesta rodada`;
    currentPlayerLi.style.fontWeight = 'bold'; // Destaca a pontuação atual
    rankingList.appendChild(currentPlayerLi);

    // Exibe o ranking dos melhores
    rankingList.appendChild(document.createElement('hr')); // Linha separadora
    scores.forEach(({ name, score }, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${name}: ${score}`;
        rankingList.appendChild(li);
    });
}

easyModeButton.addEventListener('click', () => startGame(16));
hardModeButton.addEventListener('click', () => startGame(24));

backToStartButton.addEventListener('click', () => {
    startScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    rankingScreen.style.display = 'none';
    resetGame();
});

function resetTimer() {
    clearInterval(timer); // Limpa o temporizador existente
    timeLeft = 60; // Resetando o tempo para 60 segundos
    timerDisplay.textContent = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            if (gameActive) { // Verifica se o jogo está ativo
                alert(`Tempo esgotado! Sua pontuação final é ${score}.`);
                saveScore(); // Salva a pontuação apenas se o jogo estava ativo
                gameActive = false; // Define o jogo como não ativo
            }
        }
    }, 1000); // Define o intervalo para 1000ms (1 segundo)
}

backToStartRankingButton.addEventListener('click', () => {
    startScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    rankingScreen.style.display = 'none';
});

function resetRanking() {
    if (confirm("Tem certeza que deseja resetar o ranking?")) {
        const scoresKey = board.classList.contains('easy-mode') ? 'easyScores' : 'hardScores'; // Define a chave com base no modo
        localStorage.removeItem(scoresKey); // Remove o ranking do localStorage
        showRanking(); // Atualiza a lista de ranking (que agora estará vazia)
        alert("Ranking resetado com sucesso!");
    }
}

// Adicione o evento do botão ao seu código JavaScript
document.getElementById('reset-ranking').addEventListener('click', resetRanking);
// Inicializa o jogo ao carregar
createBoard(16); // Cria o tabuleiro padrão de 16 cartas
