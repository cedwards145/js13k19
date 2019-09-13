import { TILE_SIZE } from "./constants";
import { GameObject } from "./gameobject";

class Flare extends GameObject {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        const room = this.game.getRoomFromCoord(x, y);
        room.containsFlare = true;
    }

    draw(context) {
        context.fillStyle = "orange";
        context.fillRect(this.x, this.y, 3, 10);
    }

    drawLight(context) {
        const gradient = context.createRadialGradient(this.x, this.y, TILE_SIZE / 2, this.x, this.y, TILE_SIZE * 2);
        gradient.addColorStop(0, 'rgba(255, 200, 0, 0.75)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = gradient;
        context.fillRect(this.x - TILE_SIZE * 2, this.y - TILE_SIZE * 2, TILE_SIZE * 4, TILE_SIZE * 4);
    }
}

export { Flare };