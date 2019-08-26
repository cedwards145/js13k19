import { Player } from "./player";
import { Rectangle } from "./rectangle";
import map from "../map.json";
import { loadMap } from "./maploader";

const WIDTH = 1280;
const HEIGHT = 720;
const TILE_SIZE = 16;

const canvas = document.getElementById("game");
canvas.width = WIDTH;
canvas.height = HEIGHT;
const canvasOffset = canvas.getBoundingClientRect();

const context = canvas.getContext("2d");

const player = new Player(350, 1400);
const keys = {};

const dynamicBodies = [];
dynamicBodies.push(player.collider);

const rooms = loadMap(map, TILE_SIZE);
const mouse = {x: 0, y: 0};

window.onkeydown = function(event) {
    keys[event.keyCode] = true;
};

window.onkeyup = function(event) {
    keys[event.keyCode] = false;
}

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX - canvasOffset.left;
    mouse.y = e.clientY - canvasOffset.top;
});

function tick(elapsed) {
    update(elapsed);
    draw(context);
    window.requestAnimationFrame(tick);
}

function update(delta) {
    var x = 0;
    var y = 0;

    if (keys[65]) {
        x = -1;
    }
    else if (keys[68]) {
        x = 1;
    }
    if (keys[87]) {
        y = -1;
    }
    else if (keys[83]) {
        y = 1;
    }

    player.move(x, y);
    resolveCollisions();
}

function draw(context) {
    context.fillStyle = "CornflowerBlue";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.translate(-1 * (player.getX() - WIDTH / 2), -1 * (player.getY() - HEIGHT / 2));

    context.fillStyle = "white";
    context.beginPath();
    context.ellipse(player.getX(), player.getY(), player.getWidth(), player.getHeight(), 0, 0, 360);
    context.closePath();
    context.fill();

    context.fillStyle = "black";
    
    for (var roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
        const room = rooms[roomIndex];
        for (var bodyIndex = 0; bodyIndex < room.staticBodies.length; bodyIndex++) {
            var rectangle = room.staticBodies[bodyIndex];        
            context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        }
    }

    //context.fillStyle = generateLightGradient(context);
    //context.fillRect(0, 0, WIDTH, HEIGHT);5

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

tick(0);