import { Rectangle } from "./rectangle";
import { getPlayer } from ".";
import { isKeyDown } from "./input";

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
        this.locked = false;

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
        const playerInRange = Math.abs(this.player.getX() - this.body.x) < 32 &&
                              Math.abs(this.player.getY() - this.body.y) < 32;

        // If player is in range and interact button pressed, toggle door lock
        if (playerInRange && isKeyDown(69)) {
            this.locked = !this.locked;
        }

        // If door is closed, unlocked, and the player is in range, open it.
        // Doors should automatically open for the player
        if (this.state === CLOSED_STATE && !this.locked && playerInRange) {
            this.state = OPENING_STATE;
        }
        // If door is open, it closes if the player is not in range, or the door is
        // locked
        else if (this.state === OPEN_STATE && (!playerInRange || this.locked)) {
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
        
        // Move actual position towards target position if not already there
        // DOESN'T HANDLE OVERSHOOT!
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