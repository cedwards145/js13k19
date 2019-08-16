import { Player } from "./player";
import { Circle } from "./circle";
import { Rectangle } from "./rectangle";

const WIDTH = 1280;
const HEIGHT = 720;

const canvas = document.getElementById("game");
canvas.width = WIDTH;
canvas.height = HEIGHT;
const canvasOffset = canvas.getBoundingClientRect();

const context = canvas.getContext("2d");

const player = new Player(600, HEIGHT - 32);
const keys = {};

const dynamicBodies = [
    new Circle(WIDTH / 2, 0, 50)
];

const staticBodies = [];
for (var count = 0; count < 10; count++) {
    staticBodies.push(new Rectangle(count * (WIDTH / 10) + 10, HEIGHT / 2, 25, 25));
    staticBodies.push(new Rectangle(count * (WIDTH / 10) + 60, HEIGHT / 4, 25, 25));
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
    var direction = 0;
    if (keys[65]) {
        direction = -1;
    }
    else if (keys[68]) {
        direction = 1;
    }
    player.move(direction);

    for (var index = 0; index < dynamicBodies.length; index++) {
        var body = dynamicBodies[index];
        body.velocity.y += 0.1;

        body.x += body.velocity.x;
        body.y += body.velocity.y;
    }

    resolveCollisions();
}

function draw(context) {
    context.fillStyle = "CornflowerBlue";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = "white";
    context.fillRect(player.x, player.y, player.width, player.height);

    for (var index = 0; index < staticBodies.length; index++) {
        var rectangle = staticBodies[index];        
        context.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    }

    for (var index = 0; index < dynamicBodies.length; index++) {
        var circle = dynamicBodies[index];        
        context.beginPath();
        context.ellipse(circle.x, circle.y, circle.radius, circle.radius, 0, 0, 360);
        context.closePath();
        context.stroke();
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