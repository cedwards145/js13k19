import { Circle } from "./circle";
import { GameObject } from "./gameobject";

class Character extends GameObject {
    constructor(x, y, radius, speed=3) {
        super();
        this.speed = speed;
        this.collider = new Circle(x + radius, y + radius, radius);

        // Movement direction, will be reset to 0 if stationary
        this.xDirection = 0;
        this.yDirection = 0;

        // Facing direction, retains last moved direction, not set to 0 if stationary
        this.xFacing = 0;
        this.yFacing = 0;
    }

    update() {
        this.xDirection = 0;
        this.yDirection = 0;
    }

    setX(x) {
        this.collider.x = x;
    }

    setY(y) {
        this.collider.y = y;
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
        this.xDirection = Math.sign(x);
        this.yDirection = Math.sign(y);

        // Update facing to match direction if at least one axis
        // of movement was non-zero
        if (x !== 0 || y !== 0) {
            this.xFacing = this.xDirection;
            this.yFacing = this.yDirection;
        }

        this.collider.x += x * this.speed;
        this.collider.y += y * this.speed;
    }

    draw(context) {
        context.fillStyle = "white";
        context.beginPath();
        context.ellipse(this.getX(), this.getY(), this.getWidth(), this.getHeight(), 0, 0, 360);
        context.closePath();
        context.fill();
    }

    getColliders() {
        return [this.collider];
    }
}

export { Character };