import { Circle } from "./circle";

const WIDTH = 32;

class Player {
    constructor(x, y) {
        this.speed = 3;
        this.collider = new Circle(x + WIDTH / 2, y + WIDTH / 2, WIDTH / 2);
    }

    getX() {
        return this.collider.x - this.collider.radius;
    }

    getY() {
        return this.collider.y - this.collider.radius;
    }

    getWidth() {
        return this.collider.radius * 2;
    }

    getHeight() {
        return this.collider.radius * 2;
    }

    move(x, y) {
        this.collider.x += x * this.speed;
        this.collider.y += y * this.speed;
    }
}

export { Player };