import { Rectangle } from "./rectangle";
import { getPlayer } from ".";

// Door states
const CLOSED_STATE = 0;
const OPENING_STATE = 1;
const OPEN_STATE = 2;
const CLOSING_STATE = 3;

class Door {
    constructor(x, y, width, height, isHorizontal) {
        this.x = x;
        this.y = y;
        this.isHorizontal = isHorizontal
        this.body = new Rectangle(x, y, width, height);
        this.player = getPlayer();
        this.state = CLOSED_STATE;

        if (this.isHorizontal) {
            this.openX = this.x + 16;
            this.openY = this.y;
        }
        else {
            this.openX = this.x;
            this.openY = this.y + 16;
        }
    }

    update() {
        if (this.state === CLOSED_STATE &&
            Math.abs(this.player.getX() - this.body.x) < 32 &&
            Math.abs(this.player.getY() - this.body.y) < 32) {
                this.state = OPENING_STATE;
        }
        else if (this.state === OPEN_STATE && 
                 (Math.abs(this.player.getX() - this.body.x) > 32 ||
                  Math.abs(this.player.getY() - this.body.y) > 32)) {
            this.state = CLOSING_STATE;
        }

        // By default, door doesn't need to move so set target to current position
        let targetX = this.body.x;
        let targetY = this.body.y;

        // If the door is opening or closing, and hasn't finished,
        // set the target to the open or closed position.
        // If it has finished, change state
        if (this.state === OPENING_STATE) {
            if (this.body.x === this.openX && this.body.y === this.openY) {
                this.state = OPEN_STATE;
            }
            else {
                targetX = this.openX;
                targetY = this.openY;
            }
        }
        else if (this.state === CLOSING_STATE) {
            if (this.body.x === this.x && this.body.y === this.y) {
                this.state = CLOSED_STATE;
            }
            else {
                targetX = this.x;
                targetY = this.y;
            }
        }
        
        if (this.body.x !== targetX) {
            const deltaX = targetX - this.body.x;
            this.body.x += Math.sign(deltaX) * 2;
        } 
        
        if (this.body.y !== targetY) {
            const deltaY = targetY - this.body.y;
            this.body.y += Math.sign(deltaY) * 2;
        }
    }
}

export { Door };