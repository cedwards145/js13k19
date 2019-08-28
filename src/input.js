const keys = {};

function keyDown(event) {
    keys[event.keyCode] = true;
};

function keyUp(event) {
    keys[event.keyCode] = false;
}

function isKeyDown(keyCode) {
    return keys[keyCode];
}

export { keyDown, keyUp, isKeyDown };