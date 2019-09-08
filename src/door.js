import { Rectangle } from "./rectangle";
import { getPlayer } from "./game";
import { isKeyPressed } from "./input";
import { GameObject } from "./gameobject";

// Door states
const CLOSED_STATE = 0;
const OPENING_STATE = 1;
const OPEN_STATE = 2;
const CLOSING_STATE = 3;

class Door extends GameObject {
    constructor(x, y, width, height, isHorizontal) {
        super();
        this.x = x;
        this.y = y;
        this.isHorizontal = isHorizontal
        this.collider = new Rectangle(x, y, width, height);
        this.state = CLOSED_STATE;
        this.locked = false;

        this.hasBeenTriggered = false;
        this.trigger = new Rectangle(x - 16, y - 16, width + 32, height + 32);
        this.trigger.onCollision = (other) => {
            this.hasBeenTriggered = true;
        }

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
        const player = this.game.getPlayer();
        const playerInRange = Math.abs(player.getX() - this.collider.x) < 32 &&
                              Math.abs(player.getY() - this.collider.y) < 32;

        // If player is in range and interact button pressed, toggle door lock
        if (playerInRange && isKeyPressed(69)) {
            this.locked = !this.locked;
        }

        // If door is closed, unlocked, and the player is in range, open it.
        // Doors should automatically open for the player
        if (this.state === CLOSED_STATE && !this.locked && this.hasBeenTriggered) {
            this.state = OPENING_STATE;
        }
        // If door is open, it closes if the player is not in range, or the door is
        // locked
        else if (this.state === OPEN_STATE && (!this.hasBeenTriggered || this.locked)) {
            this.state = CLOSING_STATE;
        }

        // By default, door doesn't need to move so set target to current position
        let targetX = this.collider.x;
        let targetY = this.collider.y;

        // If the door is opening or closing, and hasn't finished,
        // set the target to the open or closed position.
        // If it has finished, change state
        if (this.state === OPENING_STATE) {
            if (this.collider.x === this.openX && this.collider.y === this.openY) {
                this.state = OPEN_STATE;
            }
            else {
                targetX = this.openX;
                targetY = this.openY;
            }
        }
        else if (this.state === CLOSING_STATE) {
            if (this.collider.x === this.x && this.collider.y === this.y) {
                this.state = CLOSED_STATE;
            }
            else {
                targetX = this.x;
                targetY = this.y;
            }
        }
        
        // Move actual position towards target position if not already there
        // DOESN'T HANDLE OVERSHOOT!
        if (this.collider.x !== targetX) {
            const deltaX = targetX - this.collider.x;
            this.collider.x += Math.sign(deltaX) * 2;
        } 
        
        if (this.collider.y !== targetY) {
            const deltaY = targetY - this.collider.y;
            this.collider.y += Math.sign(deltaY) * 2;
        }

        this.hasBeenTriggered = false;
    }

    draw(context) {
        if (this.locked) {
            context.fillStyle = "red";
        }
        else {
            context.fillStyle = "green";
        }
        context.fillRect(this.collider.x, this.collider.y, this.collider.width, this.collider.height);
    }

    getColliders() {
        return [this.collider];
    }

    getTriggers() {
        return [this.trigger];
    }
}

export { Door };