import { Rectangle } from "./rectangle";
import { getPlayer } from ".";

class Door {
    constructor(x, y, width, height, isHorizontal) {
        this.x = x;
        this.y = y;
        this.isHorizontal = isHorizontal
        this.body = new Rectangle(x, y, width, height);
        this.player = getPlayer();
    }

    update() {
        if (Math.abs(this.player.getX() - this.body.x) < 32 &&
            Math.abs(this.player.getY() - this.body.y) < 32) {
                if (this.isHorizontal) {
                    this.body.x = this.x + 16;
                }
                else {
                    this.body.y = this.y + 16;
                }
        }
        else {
            this.body.x = this.x;
            this.body.y = this.y;
        }
    }
}

export { Door };