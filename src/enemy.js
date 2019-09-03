import { Character } from "./character";
import { getPlayer } from ".";

class Enemy extends Character {
    constructor(x, y) {
        super(x, y, 7);
    }

    update() {
        const player = getPlayer();
        const deltaX = player.getX() - this.getX();
        const deltaY = player.getY() - this.getY();

        this.move(Math.sign(deltaX), Math.sign(deltaY));
    }
}

export { Enemy };