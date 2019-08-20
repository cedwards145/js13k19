import { Circle } from "./circle";

const WIDTH = 14;

class Player {
    constructor(x, y) {
        this.speed = 3;
        this.collider = new Circle(x + WIDTH / 2, y + WIDTH / 2, WIDTH / 2);
    }

    getX() {
        return this.collider.x;
    }

    getY() {
        return this.collider.y;
    }

    getWidth() {
        return this.collider.radius;
    }

    getHeight() {
        return this.collider.radius;
    }

    move(x, y) {
        this.collider.x += x * this.speed;
        this.collider.y += y * this.speed;
    }
}

export { Player };