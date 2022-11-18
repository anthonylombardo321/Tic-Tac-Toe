const gameBoard = (() => {
    const boardArray = ["", "", "", "", "", "", "", "", ""];

    const setField = (index, marker) => {
        boardArray[index] = marker;
    }

    const getField = (index) => {
        if(index > boardArray.length) return;
        return boardArray[index];
    }

    const resetBoard = () => {
        for(let i = 0; i < boardArray.length; i++) {
            boardArray[i] = "";
        }
    }

    const getAvailableFields = () => {
        emptyFields = [];
        for(let i = 0; i < boardArray.length; i++) {
            if(boardArray[i] === "") {
                emptyFields.push(i);
            }
        }
        return emptyFields;
    }

    return {setField, getField, resetBoard, getAvailableFields};
})();

// Modal Modules
const gameModeModal = (() => {
    const modeModal = document.querySelector(".modes-modal");
    const gameModes = document.querySelectorAll(".mode-btn");

    const displayGameModes = () => {
        modeModal.style.display = "block";
    }

    gameModes.forEach((gameMode) => {
        gameMode.addEventListener("click", (event) => {
            const selectedMode = event.target;
            const parent = selectedMode.parentNode;
            const modeIndex = Array.prototype.indexOf.call(parent.children, selectedMode);
            formModal.displayForm(modeIndex);
            modeModal.style.display = "none";
        })
    })

    return { displayGameModes };
})();

const formModal = (() => {
    const formModal = document.querySelector(".form-modal");
    const player1Heading = document.getElementById("player1-heading");
    const player1Input = document.getElementById("player1-name");
    const player2Heading = document.getElementById("player2-heading");
    const player2Input = document.getElementById("player2-name");
    const startButton = document.querySelector(".start-btn");
    let activeMode;

    const displayForm = (mode) => {
        formModal.style.display = "block";
        activeMode = mode;
        switch (activeMode) {
            case 0:
                player1Heading.textContent = "Player 1's Name:";
                player2Heading.textContent = "Player 2's Name:";
                break;
            case 1:
                player1Heading.textContent = "Player's Name:";
                player2Heading.textContent = "Computer's Name:";
                player2Input.value = "HAL-9000";
                break;
            case 2:
                player1Heading.textContent = "Computer 1's Name:";
                player1Input.value = "C3PO";
                player2Heading.textContent = "Computer 2's Name:";
                player2Input.value = "R2D2";
                break;
        }
    }

    startButton.addEventListener("click", () => {
        const player1Name = player1Input.value;
        const player2Name = player2Input.value;
        gameUI.createPlayers(player1Name, player2Name, activeMode)
        formModal.style.display = "none";
        //Reset Input values
        player1Input.value = "";
        player2Input.value = "";
        
        gameUI.resetGame();
    });

    return { displayForm };
})();

const gameOverModal = (() => {
    const gameOverModal = document.querySelector(".gameover-modal");
    const gameOverMessage = document.querySelector(".gameover-message");
    const playAgainButton = document.querySelector(".play-again-btn");
    const newGameButton = document.querySelector(".new-game-btn");

    const displayGameOver = (message) => {
        message === "It's a Tie" 
            ? gameOverMessage.textContent = message
            : gameOverMessage.textContent = `${message} Wins!`;
        gameOverModal.style.display = "block";
    }

    playAgainButton.addEventListener("click", () => {
        gameOverModal.style.display = "none";
        gameUI.resetGame();
    })

    newGameButton.addEventListener("click", () => {
        gameOverModal.style.display = "none";
        gameModeModal.displayGameModes();
    })

    return { displayGameOver };
})();

// Player Factory Methods
const Player = (name, marker) => {
    const playerName = name;
    const playerMarker = marker;
    const getName = () => playerName;
    const getMarker = () => playerMarker;
    const getObjectName = () => "Player";
    return {getName, getMarker, getObjectName};
}

const AI = (name, marker) => {
    const {getName, getMarker} = Player(name, marker);
    const getObjectName = () => "AI";
    const getRandomMove = () => {
        const availableFields = gameBoard.getAvailableFields();
        const randomIndex = Math.floor(Math.random() * availableFields.length);
        return availableFields[randomIndex];
    }
    return {getName, getMarker, getObjectName, getRandomMove };
}

//UI Module
const gameUI = (() => {
    const fieldElements = document.querySelectorAll(".field");
    const message = document.querySelector("#message");
    const messageMarker = document.querySelector("#message-span");
    const restartButton = document.querySelector(".restart-btn");
    let player1;
    let player2;
    let round = 0;
    let isPlayer1 = true;
    let isGameOver = false;
    let isAIMove = false; //Flag to make AI calls sequential

    //Methods:
    //Player Methods
    const createPlayers = (player1Name, player2Name, mode) => {
        switch (mode) {
            case 0:
                player1 = Player(player1Name, "✖");
                player2 = Player(player2Name, "〇");        
                break;
            case 1:
                player1 = Player(player1Name, "✖");
                player2 = AI(player2Name, "〇");        
                break;
            case 2:
                player1 = AI(player1Name, "✖");
                player2 = AI(player2Name, "〇");
                break;
        }
    }

    const getCurrentPlayer = () => {
        return isPlayer1 ? player1 : player2;
    }

    const makeAIMove = (player) => {
        if(isAIMove) {
            let bestMove = player.getRandomMove();
            setFieldMarker(bestMove);
        }
    }

    //UI Update Methods
    const setFieldMarker = (index) => {
        //Update field selected by current player
        const currentPlayer = getCurrentPlayer();
        gameBoard.setField(index, currentPlayer.getMarker());
        
        //Get next player and update UI
        let nextPlayer;
        isPlayer1
            ? nextPlayer = player2
            : nextPlayer = player1;
        message.childNodes[0].textContent = `${nextPlayer.getName()}'s Turn: `;
        messageMarker.textContent = nextPlayer.getMarker();  
        
        updateGameBoard(); 
        checkGameOver(index);
        //If there's no game over, continue game.
        if(!isGameOver) {
            isPlayer1 ? isPlayer1 = false : isPlayer1 = true;

            if(nextPlayer.getObjectName() === "AI") {
                setTimeout(() => {
                    isAIMove = true;
                    makeAIMove(nextPlayer);
                    isAIMove = false;
                }, 500);
            }
        }
    }

    const updateGameBoard = () => {
        for(let i = 0; i < fieldElements.length; i++) {
            fieldElements[i].textContent = gameBoard.getField(i);
        }
        round+=1;
    }

    const resetGame = () => {
        gameBoard.resetBoard();
        message.childNodes[0].textContent = `${player1.getName()}'s Turn: `;
        messageMarker.textContent = player1.getMarker();
        updateGameBoard();
        isPlayer1 = true;
        round = 0;
        isGameOver = false;
        isAIMove = true;

        if(player1.getObjectName() === "AI") {
            setTimeout(() => {
                makeAIMove(player1);
                isAIMove = false;
            }, 500);
        }
    }

    //Methods for Checking Game Conditions
    const checkGameOver = (index) => {
        if(isWinner(index)) {
            currentPlayerName = getCurrentPlayer().getName();
            isGameOver = true;
            gameOverModal.displayGameOver(currentPlayerName);
        }
        if(round === 9 && !isWinner(index)) {
            isGameOver = true;
            gameOverModal.displayGameOver("It's a Tie")
        }
    }

    const isWinner = (index) => {
        const winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        currentPlayerMarker = getCurrentPlayer().getMarker();
        return winningConditions
            .filter((combination) => combination.includes(index))
            .some((potentialCombination) => potentialCombination.every(
                (index) => gameBoard.getField(index) === currentPlayerMarker
            )
        );
    }

    //Event Listeners
    fieldElements.forEach((field) => {
        field.addEventListener("click", (event) => {
            let field = event.target;
            if(field.textContent !== "" || isGameOver) return;
            const parent = field.parentNode;
            const index = Array.prototype.indexOf.call(parent.children, field);
            setFieldMarker(index);
        })
    })

    restartButton.addEventListener("click", resetGame)
    return { createPlayers, resetGame };
})();