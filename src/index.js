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

const circle = new Circle(0, 0, 50);
const rectangle = new Rectangle(WIDTH / 2, HEIGHT / 2, 100, 100);

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

    circle.x = mouse.x;
    circle.y = mouse.y;
}

function draw(context) {
    context.fillStyle = "CornflowerBlue";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = "white";
    context.fillRect(player.x, player.y, player.width, player.height);
    
    context.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

    if (circle.collidesWithRectangle(rectangle)) {
        context.fillStyle = "red";
        context.strokeStyle = "red";
    }
    else {
        context.fillStyle = "white";
        context.strokeStyle = "white";
    }

    context.beginPath();
    context.ellipse(circle.x, circle.y, circle.radius, circle.radius, 0, 0, 360);
    context.closePath();
    context.stroke();
}

tick(0);