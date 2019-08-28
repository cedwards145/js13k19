import { Circle } from "./circle";
import { isKeyDown } from "./input";

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

    update() {
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
}

export { Player };