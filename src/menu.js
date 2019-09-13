import { drawText } from "./graphics";
import { isKeyPressed } from "./input";
import { getGame } from ".";
import { startIntro } from "./cutscene";

let selectedIndex = 0;
let opacity = 0;

const OPTIONS = [
    "start",
    "controls",
    "something else"
];

const FADE_IN = 0;
const ACTIVE = 1;
const FADE_OUT = 2;
const INACTIVE = 3;
let state = FADE_IN;

function updateMenu() {
    if (state === FADE_IN) {
        opacity += 0.05;
        if (opacity >= 1) {
            state = ACTIVE;
        }
    }
    else if (state === ACTIVE) {
        if (isKeyPressed(87)) {
            selectedIndex--;
            // Special case because JS modulo operator gives negative results for negative numbers...
            if (selectedIndex < 0) {
                selectedIndex = OPTIONS.length - 1;
            }
        }
        else if (isKeyPressed(83)) {
            selectedIndex++;
        }
        else if (isKeyPressed(69)) {
            click();
        }
        
        selectedIndex = selectedIndex % OPTIONS.length;
    }
    else if (state === FADE_OUT) {
        opacity -= 0.05;
        if (opacity <= 0) {
            state = INACTIVE;
            startIntro();
        }
    }
}
    
function click() {
    // Start game
    if (selectedIndex === 0) {
        state = FADE_OUT;
    }
}

function drawMenu(context, tileset) {
    if (state === INACTIVE) {
        return;
    }
    
    const previousOpacity = context.globalAlpha;
    context.globalAlpha = opacity;
    drawText(context, "Fall Back!", tileset, 32, 200, 5);

    let y = 350;
    for (let index = 0; index < OPTIONS.length; index++) {
        const scale = (index === selectedIndex ? 4 : 2);
        const text = OPTIONS[index] + (index === selectedIndex ? " (E)" : "");
        drawText(context, text, tileset, 32, y, scale);
        y += 16 * scale;
    }
    
    context.globalAlpha = previousOpacity;
}

export { updateMenu, drawMenu };