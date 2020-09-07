import { runGame } from './coreMechanic.mjs';
import { startGame, getNextCommand } from './game.mjs';
import { renderField } from './visualizer.mjs';

const snake = [ '3;3', '3;2', '3;1', '3;0', '2;0' ];
const meals = [ '3;5', '8;6'];
const fieldSize = 10;
const maxTicks = 10;

async function run() {
    const iterGame = runGame(snake, meals, fieldSize, maxTicks);
    let gameState = iterGame.next().value;
    startGame([...snake], [...meals], fieldSize, maxTicks);

    do {
        await renderField([...gameState.snake], gameState.currentMeal, fieldSize);
        const command = getNextCommand([...gameState.snake], gameState.currentMeal);
        gameState = iterGame.next(command).value;
    } while (!gameState.gameOver);   

    console.log(`Your Score is ${gameState.maxScore}`);
}

run();
