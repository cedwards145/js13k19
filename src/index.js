import { Player } from "./player";

const WIDTH = 1280;
const HEIGHT = 720;

const canvas = document.getElementById("game");
canvas.width = WIDTH;
canvas.height = HEIGHT;
const context = canvas.getContext("2d");

const player = new Player(600, HEIGHT - 32);
const blobs = [];
for (var count = 0; count < 50; count++) {
    const size = Math.random() * 64 + 16;
    const blob = new Player(Math.random() * 200, HEIGHT - size);
    blob.width = size;
    blob.height = size;
    blob.speed = Math.random() * 1.75 + 1;
    blobs.push(blob);
}

const keys = {};

window.onkeydown = function(event) {
    keys[event.keyCode] = true;
};

window.onkeyup = function(event) {
    keys[event.keyCode] = false;
}

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

    for (var index = 0; index < blobs.length; index++) {
        const blob = blobs[index];
        const direction = Math.sign(player.x - blob.x);
        blob.move(direction);
    }
}

function draw(context) {
    context.fillStyle = "CornflowerBlue";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = "white";
    context.fillRect(player.x, player.y, player.width, player.height);

    context.fillStyle = "black";
    for (var index = 0; index < blobs.length; index++) {
        const blob = blobs[index];
        context.beginPath();
        context.ellipse(blob.x + (blob.width / 2), blob.y + (blob.height / 2), blob.width / 2, blob.height / 2, 0, 0, 360);
        context.closePath();
        context.fill();
    }
}

tick(0);