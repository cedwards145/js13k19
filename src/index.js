const WIDTH = 1280;
const HEIGHT = 720;

const canvas = document.getElementById("game");
canvas.width = WIDTH;
canvas.height = HEIGHT;
const context = canvas.getContext("2d");

const player = {
    x: 32,
    y: 32,
    width: 32,
    height: 32,
    speed: 3
};

keys = {};

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
    if (keys[65]) {
        player.x -= player.speed;
    }
    else if (keys[68]) {
        player.x += player.speed;
    }
}

function draw(context) {
    context.fillStyle = "blue";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = "white";
    context.fillRect(player.x, player.y, player.width, player.height);
}

tick(0);