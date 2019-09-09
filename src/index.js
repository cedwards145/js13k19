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
mainCanvas.parentElement.appendChild(lightCanvas);
const floorCanvas = document.createElement("canvas");

const mainContext = mainCanvas.getContext("2d");

const game = new Game(WIDTH, HEIGHT, tileset, mainCanvas, floorCanvas, lightCanvas);

game.loadMap(mapData);
game.setPlayer(350, 1400);

// Set up input event handlers
window.onkeydown = keyDown;
window.onkeyup = keyUp;

function generateLightGradient(context) {
    var gradient = context.createRadialGradient(player.getX(), player.getY(), TILE_SIZE * 4, player.getX(), player.getY(), TILE_SIZE * 8);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1.0)');
    
    return gradient;
}

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