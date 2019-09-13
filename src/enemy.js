import { Character } from "./character";
import { OPEN_STATE } from "./door";
import { TILE_SIZE, ROOM_WIDTH, ROOM_HEIGHT } from "./constants";

const ATTACK_RANGE = 16;
const ATTACK_EXTEND_FRAMES = 6;
const ATTACK_RETREAT_FRAMES = 16;
const ATTACK_COOLDOWN_FRAMES = 8;

class Enemy extends Character {
    constructor(x, y) {
        super(x, y, 7, 3);
        this.feet = [
            {x:-6, y:6, direction:1, stride:3},
            {x:6, y:-6, direction:1, stride:3},
            {x:-6, y:-6, direction:-1, stride:3},
            {x:6, y:6, direction:-1, stride:3},
        ];

        this.targets = [];

        // Sin time for animating legs
        this.t = 0;

        // Crude animation state for attacking
        this.attacking = false;
        this.attackProgress = 0;
        this.bodyOffset = 0;
        
        this.isActive = false;
    }

    update() {
        super.update()

        // Allows enemy to be disabled during cutscenes
        if (!this.isActive) {
            return;
        }

        // Simple attack animation to extend and retreat body as if smashing something
        if (this.attacking) {
            this.attackProgress++;
            if (this.attackProgress <= ATTACK_EXTEND_FRAMES) {
                // Exponential extend
                this.bodyOffset = Math.pow(this.attackProgress / 2, 2);
            }
            else if (this.attackProgress <= ATTACK_EXTEND_FRAMES + ATTACK_RETREAT_FRAMES) {
                this.bodyOffset = 16 - (this.attackProgress - ATTACK_EXTEND_FRAMES);
            }
            else if (this.attackProgress <= ATTACK_EXTEND_FRAMES + ATTACK_RETREAT_FRAMES + ATTACK_COOLDOWN_FRAMES) {
                // No action required, force pause before starting next attack
            }
            else {
                this.attacking = false;
            }
        }
        else {
            // If no target, or target is dead, fetch the next target
            if (!this.target || !this.target.isAlive) {
                // No targets left, nothing to do
                if (this.targets.length == 0) {
                    return;
                }

                this.target = this.targets.pop();
            }

            const currentRoom = this.game.getRoomFromCoord(this.getX(), this.getY());
            const targetRoom = this.game.getRoomFromCoord(this.target.getX(), this.target.getY());
            
            // If in same room as player, no pathfinding needed
            // Attack if in range or move towards
            if (currentRoom === targetRoom) {
                this.attack(this.target);
            }
            // Otherwise, need to move to the player's room
            else {
                // Find the best exit from this room based on distance and locked doors
                const bestExit = this.findBestExit(currentRoom);

                // If the best exit is unlocked or destroyed, move through it
                if (bestExit.door.state === OPEN_STATE || !bestExit.door.locked || bestExit.door.isDestroyed()) {
                    this.moveTowardsExit(bestExit);
                }
                // Otherwise, attack it
                else {
                    this.attack(bestExit.door);
                }            
            }
        }

        // Increase progress of leg swing
        this.t += Math.PI / 30;
    }

    moveTowardsExit(exit) {
        let x = exit.door.getX();
        let y = exit.door.getY();

        // Add in minor correction for when enemy is at the door's position,
        // leading to a 0 delta
        if (Math.abs(x - this.getX()) < this.speed && Math.abs(y - this.getY()) < this.speed) {
            x = exit.door.isHorizontal ? x : exit.room.left + ROOM_WIDTH / 2;
            y = exit.door.isHorizontal ? exit.room.top + ROOM_HEIGHT / 2 : y;
        }
        this.moveTowards(x, y);
    }

    moveTowards(x, y) {
        const deltaX = x - this.getX();
        const deltaY = y - this.getY();

        this.move(Math.sign(deltaX), Math.sign(deltaY));
    }

    findBestExit(currentRoom) {
        const exits = currentRoom.getExits();
        let lowestScore = Number.MAX_VALUE;
        let bestExit = null;
        for (let index = 0; index < exits.length; index++) {
            const exit = exits[index];
            const score = this.game.distanceMap[exit.room.x][exit.room.y];

            if (score < lowestScore) {
                lowestScore = score;
                bestExit = exit;
            }
        }

        return bestExit;
    }

    attack(target) {
        const x = target.getX();
        const y = target.getY();

        if (Math.abs(x - this.getX()) < ATTACK_RANGE && Math.abs(y - this.getY()) < ATTACK_RANGE) {
            this.attacking = true;
            this.attackProgress = 0;
            target.damage(10);
        }
        else {
            this.moveTowards(x, y);
        }
    }

    draw(context) {
        context.fillStyle = "black";
        for (let index = 0; index < this.feet.length; index++) {
            const foot = this.feet[index];
            const sinValue = Math.sin(this.t);
            context.beginPath();
            context.ellipse(this.getX() + foot.x + (this.xDirection !== 0 ? (sinValue * foot.stride * foot.direction) : 0),
                            this.getY() + foot.y + (this.yDirection !== 0 ? (sinValue * foot.stride * foot.direction) : 0), 
                            3, 3, 0, 0, 360);
            context.closePath();
            context.fill();
        }

        const bodyX = this.getX() - TILE_SIZE / 2 + Math.sign(this.xFacing) * this.bodyOffset;
        const bodyY = this.getY() - TILE_SIZE / 2 + Math.sign(this.yFacing) * this.bodyOffset;

        context.drawImage(this.game.tileset, 0, 16, 16, 16, 
                          bodyX, bodyY, TILE_SIZE, TILE_SIZE);
    }
}

export { Enemy };