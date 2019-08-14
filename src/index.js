import { Player } from "./player";

const WIDTH = 1280;
const HEIGHT = 720;

const canvas = document.getElementById("game");
canvas.width = WIDTH;
canvas.height = HEIGHT;
const context = canvas.getContext("2d");

const player = new Player(32, 32);

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
}

function draw(context) {
    context.fillStyle = "blue";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = "white";
    context.fillRect(player.x, player.y, player.width, player.height);
}

tick(0);