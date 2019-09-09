import { isKeyDown } from "./input";
import { Character } from "./character";

class Player extends Character {
    constructor(x, y) {
        super(x, y, 7);
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

    damage(amount) {}
}

export { Player };