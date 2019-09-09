import { getGame } from ".";

class GameObject {
    constructor() {
        this.game = getGame();
    }

    update() {}

    draw(context) {}

    drawLight(context) {}

    getColliders() {
        return [];
    }

    getTriggers() {
        return [];
    }
}

export { GameObject };