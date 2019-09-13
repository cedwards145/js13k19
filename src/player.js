import { isKeyDown } from "./input";
import { Character } from "./character";
import { TILE_SIZE } from "./constants";

class Player extends Character {
    constructor(x, y) {
        super(x, y, 5, 2);
        this.canControl = false;
        this.isAlive = true;
    }

    update() {
        if (!this.canControl || !this.isAlive) {
            return;
        }

        let x = 0;
        let y = 0;

        if (isKeyDown(65)) {
            x = -1;
        }
        else if (isKeyDown(68)) {
            x = 1;
        }
        if (isKeyDown(87)) {
            y = -1;
        }
        else if (isKeyDown(83)) {
            y = 1;
        }

        this.move(x, y);
    }

    damage(amount) {
        this.isAlive = false;
        const enemy = this.game.getEnemy();

        // Choose a blood spatter based on the direction of the enemy to the player
        // Makes the blood appear to fly out in the right direction
        const deltaX = enemy.getX() - this.getX();
        const deltaY = enemy.getY() - this.getY();
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.sign(deltaX) < 0) {
                this.bloodOffset = 1;
            }
            else {
                this.bloodOffset = 3;
            }
        }
        else {
            if (Math.sign(deltaY) < 0) {
                this.bloodOffset = 2;
            }
            else {
                this.bloodOffset = 0;
            }
        }
    }

    draw(context) {
        if (!this.isAlive) {
            // Draw blood spatter if dead
            const xDirection = this.bloodOffset === 1 ? 0 : (this.bloodOffset === 3 ? -1 : -0.5);
            const yDirection = this.bloodOffset === 0 ? -1 : (this.bloodOffset === 2 ? 0 : -0.5);
            context.drawImage(this.game.tileset, this.bloodOffset * 32, 32, 32, 32, 
                              this.getX() + TILE_SIZE * 2 * xDirection, 
                              this.getY() + (TILE_SIZE * 2 * yDirection), 
                              TILE_SIZE * 2, 
                              TILE_SIZE * 2);
        }
        super.draw(context);
    }
}

export { Player };