import { Player } from "./player";
import mapData from "../map.json";
import { loadMap } from "./maploader";
import { keyDown, keyUp, clearPressedKeys } from "./input";
import { Enemy } from "./enemy";
import { Circle } from "./circle";
import { Rectangle } from "./rectangle";

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

const map = loadMap(mapData);
const rooms = map.rooms;
const doors = map.doors;
for (let index = 0; index < rooms.length; index++) {
    gameObjects.push(rooms[index]);
}
for (let index = 0; index < doors.length; index++) {
    gameObjects.push(doors[index]);
}

// Build up map to get rooms by their x, y coordinate
var roomsByCoord = {};
for (let x = 0; x < map.width; x++) {
    roomsByCoord[x] = {};
}

for (let index = 0; index < rooms.length; index++) {
    const room = rooms[index];
    roomsByCoord[room.x][room.y] = room;
}

console.log(roomsByCoord);

// Build up lists of colliders for use in physics simulation.
// Separate out circle colliders which will be dynamic from
// rectangles which are static.
// (Static colliders don't get moved by collision resolution,
// dynamic ones do)
const dynamicBodies = [];
const staticBodies = [];
const triggers = [];

for (let index = 0; index < gameObjects.length; index++) {
    const colliders = gameObjects[index].getColliders();
    for (let colliderIndex = 0; colliderIndex < colliders.length; colliderIndex++) {
        const collider = colliders[colliderIndex];
        if (collider instanceof Circle) {
            dynamicBodies.push(collider);
        }
        else if (collider instanceof Rectangle) {
            staticBodies.push(collider);
        }
    }

    const currentTriggers = gameObjects[index].getTriggers();
    for (let triggerIndex = 0; triggerIndex < currentTriggers.length; triggerIndex++) {
        triggers.push(currentTriggers[triggerIndex]);
    }
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
    for (let dynamicIndex = 0; dynamicIndex < dynamicBodies.length; dynamicIndex++) {
        const dynamicBody = dynamicBodies[dynamicIndex];

        for (let staticBodyIndex = 0; staticBodyIndex < staticBodies.length; staticBodyIndex++) {
            const staticBody = staticBodies[staticBodyIndex];
            checkCollision(dynamicBody, staticBody);
        }

        for (let triggerIndex = 0; triggerIndex < triggers.length; triggerIndex++) {
            const trigger = triggers[triggerIndex];
            if (checkCollision(dynamicBody, trigger, false)) {
                trigger.onCollision(dynamicBody);
            }
        }
    }
}

function resolveCollision(circle, nearestX, nearestY, deltaX, deltaY) {
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normalisedX = deltaX / distance;
    const normalisedY = deltaY / distance;
    circle.x = Math.floor(nearestX + normalisedX * circle.radius);
    circle.y = Math.floor(nearestY + normalisedY * circle.radius);
}

function checkCollision(circle, rectangle, resolve=true) {
    const nearestX = Math.max(rectangle.x, Math.min(circle.x, rectangle.x + rectangle.width));
    const nearestY = Math.max(rectangle.y, Math.min(circle.y, rectangle.y + rectangle.height));
    const deltaX = circle.x - nearestX;
    const deltaY = circle.y - nearestY;
     
    if ((deltaX * deltaX + deltaY * deltaY) < (circle.radius * circle.radius)) {
        if (resolve) {
            resolveCollision(circle, nearestX, nearestY, deltaX, deltaY);
        }
        return true;
    }

    return false;
}

// Main game loop
function tick(elapsed) {
    update(elapsed);
    draw(context);
    window.requestAnimationFrame(tick);
}
tick(0);

export { getPlayer };