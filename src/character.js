import { Circle } from "./circle";
import { GameObject } from "./gameobject";

class Character extends GameObject {
    constructor(x, y, radius, speed=3) {
        super();
        this.speed = speed;
        this.collider = new Circle(x + radius, y + radius, radius);
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

export { Character };