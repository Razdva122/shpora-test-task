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
     * type TMoves = 'FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT';
     * interface IPosition = { x: number, y: number };
     * interface ISnake = { type: 'Snake', expired: number }
     * type TState = ISnake | { type: 'Empty' | 'Meal' };
     *
     * TState[][]
    **/
    field;

    // number
    fieldSize;

    // TMoves[]
    moves;

    // IPosition
    head;

    // IPosition
    neck;

    // snake: TPositionString[], meals: TPositionString[], fieldSize: number, maxTicks: number
    constructor(snake, meals, fieldSize, maxTicks) {
        this.fieldSize = fieldSize;
        this.field = this.generate2dField(fieldSize);
        
        this.updateGameState(snake, meals);
    }

    // 'top' | 'bottom' | 'right' | 'left'
    get direction() {
        if (this.head.x === this.neck.x) {
            if (this.head.y > this.neck.y) {
                return 'bottom';
            } else {
                return 'turn';
            }
        }
        if (this.head.y === this.neck.y) {
            if (this.head.x > this.neck.x) {
                return 'right';
            } else {
                return 'left';
            }
        }
    }

    // snake: TPositionString[], meals: TPositionString[] => TMoves
    makeTurn(snake, meals) {
        this.updateGameState(snake, meals);
        this.generatePath();
        this.consoleField();
        return this.moves.splice(this.moves.length - 1, 1)[0];
    }

    generatePath() {
        const fieldForPath = this.generate2dField(this.fieldSize);
        this.field.forEach((row, rowIndex) => {
            row.forEach((cellValue, columnIndex) => {
                if (cellValue.type === 'Empty') {
                    fieldForPath[columnIndex][rowIndex] = {
                        value: null,
                        path: [],
                    };
                } else if (cellValue.type === 'Snake') {
                    fieldForPath[columnIndex][rowIndex] = {
                        value: cellValue.expired,
                        path: [],
                    };
                } else {
                    fieldForPath[columnIndex][rowIndex] = {
                        value: 'M',
                        path: [],
                    };
                }
            });
        });
        const stack = [{
            pos: this.head,
            direction: this.direction,
        }];
        while(stack.length) {
            const el = stack.splice(stack.length - 1, 1);
            const movesTillThisCell = fieldForPath[el.pos.y][el.pos.x].path.length;
            const possibleMoves = this.getPossibleMoves(el.direction);
            const possibleCoordinates = possibleMoves.map((move) => {
                return {
                    x: el.pos.x + move[1],
                    y: el.pos.y + move[0],
                }
            }).filter((coordinate) => {
                if (coordinate.x >= this.fieldSize || coordinate.y >= this.fieldSize) {
                    return false;
                }

                if (fieldForPath[coordinate.y][coordinate.x].path.length) {
                    return false;
                }

                if (typeof fieldForPath[coordinate.y][coordinate.x].value === 'number') {
                    return fieldForPath[coordinate.y][coordinate.x].value > movesTillThisCell;
                }

                return true;
            });

            for (let i = 0; i < possibleCoordinates.length; i += 1) {
                // STOP HERE;
                const path = [...fieldForPath[el.pos.y][el.pos.x].path];
            }
        }
        this.moves = ['FORWARD'];
    }

    // direction: 'top' | 'bottom' | 'right' | 'left', move: [0,1] | [0, -1] | [1, 0] | [-1, 0]
    getMove(direction, move) {
        const hashMapMoves = {
            top: {
                '0,1': 'TURN_RIGHT',
                '0,-1': 'TURN_LEFT',
                '-1,0': 'FORWARD',
                '1,0': 'WRONG COMMAND'
            }, 
            bottom: {
                '0,1': 'TURN_LEFT',
                '0,-1': 'TURN_RIGHT',
                '-1,0': 'WRONG COMMAND',
                '1,0': 'FORWARD',
            },
            right: {
                '0,1': 'FORWARD',
                '0,-1': 'WRONG COMMAND',
                '-1,0': 'TURN_LEFT',
                '1,0': 'TURN_RIGHT',
            },
            left: {
                '0,1': 'WRONG COMMAND',
                '0,-1': 'FORWARD',
                '-1,0': 'TURN_RIGHT',
                '1,0': 'TURN_LEFT',
            },
        }
        return hashMapMoves[direction][move.join()];
    }

    // direction: 'top' | 'bottom' | 'right' | 'left' => [0,1] | [0, -1] | [1, 0] | [-1, 0][]
    getPossibleMoves(direction) {
        const hashMapPossibleMoves = {
            top: [[0,1],[0,-1],[-1,0]], 
            bottom: [[0,1],[0,-1],[1,0]],
            right: [[0,1],[-1,0],[1,0]],
            left: [[0,-1],[-1,0],[1,0]],
        };
        return hashMapPossibleMoves[direction];
    }

    // lastMove [0,1] | [0, -1] | [1, 0] | [-1, 0] => 'top' | 'bottom' | 'right' | 'left';
    getDirectionByLastMove(lastMove) {
        const directionHashMap = {
            '0,1': 'right',
            '0,-1': 'left',
            '-1,0': 'top',
            '1,0': 'bottom',
        };
        return directionHashMap[lastMove];
    }

    // size: number => (fill[][]).length === size
    generate2dField(size, fill = null) {
        return new Array(size)
            .fill(null)
            .map(() => {
                return new Array(size).fill(fill);
            });
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
        this.neck = snakeNormalized[1];

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
                    y: columnIndex,
                    x: rowIndex,
                });
            });
        });
    }

    // value: TState, pos: IPosition => void
    setCellState(value, pos) {
        this.field[pos.y][pos.x] = value;
    }

    consoleField() {
        console.log(`Y X ->\n|\nV`);
        this.field.forEach((row) => {
            console.log(row.map((i) => i.expired || i.type[0]).join(''));
        })
    }

    // pos: IPosition => TState | null
    getCellState(pos) {
        if (pos.x >= this.fieldSize || pos.y >= this.fieldSize) {
            return null;
        }
        return this.field[pos.y][pos.x];
    }
}
