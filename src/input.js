// Keys never cleared, set to true on key down and false on key up.
// Tells whether a key is currently down
const keys = {};
// Pressed keys to be cleared in update loop
// Tells whether a key was pressed this frame
const pressedKeys = {};

function keyDown(event) {
    keys[event.keyCode] = true;
    pressedKeys[event.keyCode] = true;
};

function keyUp(event) {
    keys[event.keyCode] = false;
}

function isKeyDown(keyCode) {
    return keys[keyCode];
}

function isKeyPressed(keyCode) {
    return pressedKeys[keyCode];
}

function clearPressedKeys() {
    for (const key in pressedKeys) {
        delete pressedKeys[key];
    }
}

export { keyDown, keyUp, isKeyDown, isKeyPressed, clearPressedKeys };