import { commands } from './coreMechanic.mjs';

let gameInstance;

export function startGame(...args) {
    gameInstance = new Game(...args);
}

export function getNextCommand(snake, meal) {
    return gameInstance.makeTurn(snake, meal);
}

class Game {
    /* 
     * type TPositionString = 'X;Y'
     * interface IPosition = { x: number, y: number };
     * interface ISnake = { type: 'Snake', expired: number }
     * type TState = ISnake | { type: 'Empty' | 'Meal' };
     *
     * TState[][]
    **/
    field;

    // IPosition
    head;

    // snake: TPositionString[], meals: TPositionString[], fieldSize: number, maxTicks: number
    constructor(snake, meals, fieldSize, maxTicks) {
        this.field = new Array(fieldSize)
            .fill(null)
            .map(() => {
                return new Array(fieldSize).fill(null);
            });
        
        this.updateGameState(snake, meals);
    }

    makeTurn(snake, meals) {
        this.updateGameState(snake, meals);
        console.log(this.field);
        return commands.FORWARD;
    }

    // input: TPositionString => IPosition;
    positionFromString(input) {
        return {
            x: Number(input.split(';')[0]),
            y: Number(input.split(';')[1]),
        };
    }

    // snake: TPositionString[], meals: TPositionString[] => void
    updateGameState(snake, meals) {
        const snakeNormalized = snake.map(this.positionFromString);
        this.head = snakeNormalized[0];

        this.field.forEach((row, rowIndex) => {
            row.forEach((columnValue, columnIndex) => {
                let value = { type: 'Empty' };
                const positionInString = `${rowIndex};${columnIndex}`;
                if (snake.includes(positionInString)) {
                    let bodyPartPosition = snake.findIndex((i) => i === positionInString);
                    value = {
                        type: 'Snake',
                        expired: snake.length - bodyPartPosition,
                    };
                } else if (meals.includes(positionInString)) {
                    value = { type: 'Meals' };
                }

                this.setCellState(value, {
                    x: rowIndex,
                    y: columnIndex,
                });
            });
        });
    }

    // value: TState, pos: IPosition => void
    setCellState(value, pos) {
        console.log(value, pos);
        this.field[pos.x][pos.y] = value;
    }
}
