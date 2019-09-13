import { drawText } from "./graphics";
import { getGame } from ".";

const INTRO_MESSAGES = [
    "TESTING INTRO MESSAGE..."
];
let messageQueue = null;
let messageIndex = 0;
let messageProgress = 0;
let pauseTimer = 0;
const PAUSE_BETWEEN_MESSAGES = 300;

function startIntro() {
    messageQueue = INTRO_MESSAGES;
    endScene();
}

function updateCutscene() {
    if (messageQueue) {
        // Horrible chain of ifs...
        // Increment the progress through the current message
        // to display messages character by character.
        messageProgress++;
        // If entire message is displayed, start counting to pause
        // between messages.
        if (messageProgress >= messageQueue[messageIndex].length) {
            pauseTimer++;
            // If pause timer has completed, move on to the next
            // message in the queue.
            if (pauseTimer >= PAUSE_BETWEEN_MESSAGES) {
                messageProgress = 0;
                pauseTimer = 0;
                messageIndex++;
                // If the queue is over, set the queue to null to
                // indicate that no scene is in progress
                if (messageIndex >= messageQueue.length) {
                    endScene();
                    messageQueue = null;
                }
            }
        }
    }
}

// Bit of a hack, use current message queue to work out which
// cutscene just ended and run whatever code needed from there
function endScene() {
    if (messageQueue == INTRO_MESSAGES) {
        getGame().getPlayer().canControl = true;
        getGame().getEnemy().isActive = true;
    }
}

function drawCutscene(context, tileset) {
    if (messageQueue) {

        const message = messageQueue[messageIndex];
        const end = Math.min(message.length, messageProgress);
        
        drawText(context, message.substring(0, end), tileset, 16, 16);
    }
}

export { startIntro, updateCutscene, drawCutscene };