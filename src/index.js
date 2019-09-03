import { Player } from "./player";
import mapData from "../map.json";
import { loadMap } from "./maploader";
import { keyDown, keyUp, clearPressedKeys } from "./input";
import { Enemy } from "./enemy";
import { Circle } from "./circle";

const WIDTH = 1280;
const HEIGHT = 720;
const TILE_SIZE = 16;

const canvas = document.getElementById("game");
canvas.width = WIDTH;
canvas.height = HEIGHT;
const canvasOffset = canvas.getBoundingClientRect();

const context = canvas.getContext("2d");
const player = new Player(350, 1400);

const gameObjects = [];
gameObjects.push(player);
gameObjects.push(new Enemy(350, 1400));

// Search all game objects for any circle colliders, and add them to a list
// of dynamic bodies for use in collision resolution
const dynamicBodies = [];
for (let index = 0; index < gameObjects.length; index++) {
    const collider = gameObjects[index].collider;
    if (collider && collider instanceof Circle) {
        dynamicBodies.push(collider);
    }
}

const map = loadMap(mapData);
const rooms = map.rooms;
const doors = map.doors;
for (let index = 0; index < doors.length; index++) {
    gameObjects.push(doors[index]);
}

const mouse = {x: 0, y: 0};

// Set up input event handlers
window.onkeydown = keyDown;
window.onkeyup = keyUp;
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX - canvasOffset.left;
    mouse.y = e.clientY - canvasOffset.top;
});

// Not ideal, but export a function for other game logic to find the player
function getPlayer() {
    return player;
}

// Game logic update
function update(delta) {
    for (let index = 0; index < gameObjects.length; index++) {
        gameObjects[index].update();
    }

    resolveCollisions();
    clearPressedKeys();
}

// Main draw function
function draw(context) {
    context.fillStyle = "CornflowerBlue";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    // Translate canvas co-ords to center the player on screen
    context.translate(-1 * (player.getX() - WIDTH / 2), -1 * (player.getY() - HEIGHT / 2));
    
    context.fillStyle = "black";
    for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
        const room = rooms[roomIndex];
        for (let bodyIndex = 0; bodyIndex < room.staticBodies.length; bodyIndex++) {
            const rectangle = room.staticBodies[bodyIndex];        
            context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        }
    }

    for (let gameObjectIndex = 0; gameObjectIndex < gameObjects.length; gameObjectIndex++) {
        gameObjects[gameObjectIndex].draw(context);
    }
    
    //context.fillStyle = generateLightGradient(context);
    //context.fillRect(0, 0, WIDTH, HEIGHT);5

    // Reset context transform to identity matrix
    context.setTransform(1, 0, 0, 1, 0, 0);
}

function generateLightGradient(context) {
    var gradient = context.createRadialGradient(player.getX(), player.getY(), TILE_SIZE * 4, player.getX(), player.getY(), TILE_SIZE * 8);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1.0)');
    
    return gradient;
}

function resolveCollisions() {
    for (var dynamicIndex = 0; dynamicIndex < dynamicBodies.length; dynamicIndex++) {
        var dynamicBody = dynamicBodies[dynamicIndex];

        for (var roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
            const room = rooms[roomIndex];
            for (var bodyIndex = 0; bodyIndex < room.staticBodies.length; bodyIndex++) {
                var staticBody = room.staticBodies[bodyIndex];
                resolveCollision(dynamicBody, staticBody);
            }
        }

        for (var doorIndex = 0; doorIndex < doors.length; doorIndex++) {
            const staticBody = doors[doorIndex].body;
            resolveCollision(dynamicBody, staticBody);
        }
    }
}

function resolveCollision(circle, rectangle) {
    const nearestX = Math.max(rectangle.x, Math.min(circle.x, rectangle.x + rectangle.width));
    const nearestY = Math.max(rectangle.y, Math.min(circle.y, rectangle.y + rectangle.height));
    const deltaX = circle.x - nearestX;
    const deltaY = circle.y - nearestY;
    
    if ((deltaX * deltaX + deltaY * deltaY) < (circle.radius * circle.radius)) {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalisedX = deltaX / distance;
        const normalisedY = deltaY / distance;
        circle.x = Math.floor(nearestX + normalisedX * circle.radius);
        circle.y = Math.floor(nearestY + normalisedY * circle.radius);
    }
}

// Main game loop
function tick(elapsed) {
    update(elapsed);
    draw(context);
    window.requestAnimationFrame(tick);
}
tick(0);

export { getPlayer };