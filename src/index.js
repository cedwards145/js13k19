import mapData from "../map.json";
import { keyDown, keyUp, clearPressedKeys } from "./input";
import { Game } from "./game.js";

const WIDTH = 1280;
const HEIGHT = 720;

const tileset = new Image();

const mainCanvas = document.getElementById("game");
mainCanvas.width = WIDTH;
mainCanvas.height = HEIGHT;
const lightCanvas = document.createElement("canvas");
lightCanvas.width = WIDTH;
lightCanvas.height = HEIGHT;
const floorCanvas = document.createElement("canvas");

const game = new Game(WIDTH, HEIGHT, tileset, mainCanvas, floorCanvas, lightCanvas);

game.loadMap(mapData);

// Set up input event handlers
window.onkeydown = keyDown;
window.onkeyup = keyUp;

function getGame() {
    return game;
}

// Main game loop
function tick(elapsed) {
    game.update(elapsed);

    // Draw game
    game.draw();

    clearPressedKeys();
    window.requestAnimationFrame(tick);
}

// Run game start once resources have loaded
tileset.onload = function() {
    game.init();
    tick(0);
}
tileset.src = "./tileset.png";

export { getGame };