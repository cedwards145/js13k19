const CHARACTER_SIZE = 8;
const UPPER_A = 65;

function drawText(context, string, tileset, x, y, scale=1, fillStyle=null) {
    // Optionally fill a box behind the text before drawing
    if (fillStyle) {
        context.fillStyle = fillStyle;
        context.fillRect(x - 4, y - 4, (string.length * CHARACTER_SIZE) + 8, CHARACTER_SIZE + 8);
    }

    const upperCaseString = string.toUpperCase();
    for (let index = 0; index < upperCaseString.length; index++) {
        let letterIndex = upperCaseString.charCodeAt(index);

        // Hard coded edge cases for limited punctuation
        // No drawing needed for space (char 32)
        if (letterIndex === 32) {
            continue;
        }
        // Re-map full stop (46) to 26 to use spot in tileset after z
        else if (letterIndex === 46) {
            letterIndex = 26
        }
        // Re-map exclamation (33) to 27
        else if (letterIndex === 33) {
            letterIndex = 27;
        }
        // Brackets
        else if (letterIndex === 40) {
            letterIndex = 28;
        }
        else if (letterIndex === 41) {
            letterIndex = 29;
        }
        // Colon
        else if (letterIndex === 58) {
            letterIndex = 30;
        }
        else {
            letterIndex -= UPPER_A;
        }

        const sourceX = (letterIndex % 16) * CHARACTER_SIZE;
        const sourceY = 112 + (Math.floor(letterIndex / 16) * CHARACTER_SIZE);

        context.drawImage(tileset, sourceX, sourceY, CHARACTER_SIZE, CHARACTER_SIZE, x + (index * CHARACTER_SIZE * scale), y, CHARACTER_SIZE * scale, CHARACTER_SIZE * scale);
    }
}

export { drawText };