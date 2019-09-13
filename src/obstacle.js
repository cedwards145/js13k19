import { GameObject } from "./gameobject";
import { Rectangle } from "./rectangle";

class Obstacle extends GameObject {
    constructor(x, y, width, height, tileX, tileY) {
        super()
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.tileX = tileX;
        this.tileY = tileY;
        this.collider = new Rectangle(x, y, width, height);
    }

    getColliders() {
        return [this.collider];
    }

    draw(context) {
        context.drawImage(this.game.tileset, this.tileX, this.tileY, this.width, this.height, this.x, this.y, this.width, this.height);
    }
}

export { Obstacle };