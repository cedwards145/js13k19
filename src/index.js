const WIDTH = 1280;
const HEIGHT = 720;

const canvas = document.getElementById("game");
canvas.width = WIDTH;
canvas.height = HEIGHT;
const context = canvas.getContext("2d");

var x = 0;
function tick(elapsed) {
    context.fillStyle = "rgb(" + x + "," + x + "," + x + ")";
    context.fillRect(0, 0, WIDTH, HEIGHT);
    x = (x + 1) % 255;
    
    window.requestAnimationFrame(tick);
}

tick(0);