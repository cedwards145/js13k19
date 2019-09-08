import mapData from "../map.json";
import { keyDown, keyUp, clearPressedKeys } from "./input";
import { Game } from "./game.js";

const WIDTH = 1280;
const HEIGHT = 720;
const TILE_SIZE = 16;

const game = new Game(WIDTH, HEIGHT);

const canvas = document.getElementById("game");
canvas.width = WIDTH;
canvas.height = HEIGHT;

const context = canvas.getContext("2d");

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

    // Clear screen for drawing
    context.fillStyle = "CornflowerBlue";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    // Translate canvas co-ords to center the player on screen
    const player = game.getPlayer();
    context.translate(-1 * (player.getX() - WIDTH / 2), -1 * (player.getY() - HEIGHT / 2));
    // Draw game
    game.draw(context);
    // Reset context transform to identity matrix
    context.setTransform(1, 0, 0, 1, 0, 0);

    clearPressedKeys();
    window.requestAnimationFrame(tick);
}
tick(0);

export { getGame };