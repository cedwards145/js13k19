import { Player } from "./player";
import { Rectangle } from "./rectangle";
import map from "../map.json";

console.log(map);

const WIDTH = 1280;
const HEIGHT = 720;
const TILE_SIZE = 16;

const canvas = document.getElementById("game");
canvas.width = WIDTH;
canvas.height = HEIGHT;
const canvasOffset = canvas.getBoundingClientRect();

const context = canvas.getContext("2d");

const player = new Player(TILE_SIZE * 4, TILE_SIZE * 4);
const keys = {};

const dynamicBodies = [];
dynamicBodies.push(player.collider);

const staticBodies = [];

const tiles = map.layers[0].data;
for (var index = 0; index < tiles.length; index++) {
    if (tiles[index] !== 0) {
        var x = index % map.width;
        var y = Math.floor(index / map.height);
        staticBodies.push(new Rectangle(TILE_SIZE * x, TILE_SIZE * y, TILE_SIZE, TILE_SIZE));
    }
}

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

    context.fillStyle = "white";
    context.beginPath();
    context.ellipse(player.getX(), player.getY(), player.getWidth(), player.getHeight(), 0, 0, 360);
    context.closePath();
    context.fill();

    context.fillStyle = "black";
    for (var index = 0; index < staticBodies.length; index++) {
        var rectangle = staticBodies[index];        
        context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    }
}

function resolveCollisions() {
    for (var dynamicIndex = 0; dynamicIndex < dynamicBodies.length; dynamicIndex++) {
        var dynamicBody = dynamicBodies[dynamicIndex];
        for (var staticIndex = 0; staticIndex < staticBodies.length; staticIndex++) {
            var staticBody = staticBodies[staticIndex];
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
        circle.x = nearestX + normalisedX * circle.radius;
        circle.y = nearestY + normalisedY * circle.radius;

        const circleCurrentSpeed = Math.sqrt((circle.velocity.y * circle.velocity.y) + (circle.velocity.x * circle.velocity.x));
        circle.velocity.x = normalisedX * circleCurrentSpeed * 0.4;
        circle.velocity.y = normalisedY * circleCurrentSpeed * 0.4;
    }
}

tick(0);