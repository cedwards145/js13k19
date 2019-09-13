import { Player } from "./player";

// Not really ideal to extend player, but Scientist is just a player with no controls
// Only used for intro scene, so not too important
class Scientist extends Player {
    constructor(x, y) {
        super(x, y)
    }

    // Override update method and do nothing to stop input
    update() {}
    drawUi() {}
}

export { Scientist };