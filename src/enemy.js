import { Character } from "./character";

const ATTACK_RANGE = 16;

class Enemy extends Character {
    constructor(x, y) {
        super(x, y, 7, 1);
    }

    update() {
        const currentRoom = this.game.getRoomFromCoord(this.getX(), this.getY());
        const player = this.game.getPlayer();
        const playerRoom = this.game.getRoomFromCoord(player.getX(), player.getY());
        
        // If in same room as player, no pathfinding needed
        // Attack if in range or move towards
        if (currentRoom === playerRoom) {
            this.attack(player);
        }
        // Otherwise, need to move to the player's room
        else {
            // Find the best exit from this room based on distance and locked doors
            const bestExit = this.findBestExit(currentRoom);

            // If the best exit is unlocked or destroyed, move through it
            if (!bestExit.door.locked || bestExit.door.isDestroyed()) {
                this.moveTowardsExit(bestExit);
            }
            // Otherwise, attack it
            else {
                this.attack(bestExit.door);
            }            
        }
    }

    moveTowardsExit(exit) {
        let x = exit.door.getX();
        let y = exit.door.getY();

        // Add in minor correction for when enemy is at the door's position,
        // leading to a 0 delta
        if (Math.abs(x - this.getX()) < 1 && Math.abs(y - this.getY()) < 1) {
            x = exit.room.left;
            y = exit.room.top;
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
            target.damage(1);
        }
        else {
            this.moveTowards(x, y);
        }
    }
}

export { Enemy };