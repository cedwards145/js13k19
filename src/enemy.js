import { Character } from "./character";

class Enemy extends Character {
    constructor(x, y) {
        super(x, y, 7, 1);
    }

    update() {
        const player = this.game.getPlayer();
        const deltaX = player.getX() - this.getX();
        const deltaY = player.getY() - this.getY();

        this.move(Math.sign(deltaX), Math.sign(deltaY));
    }
}

export { Enemy };