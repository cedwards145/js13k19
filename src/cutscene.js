import { drawText } from "./graphics";
import { getGame } from ".";

const INTRO_MESSAGES = [
    "OPERATOR: Starting the experiment.",
    "OPERATOR: Security drone is now active! Readings appear normal.",
    "OPERATOR: Testing employee recognition function..."
];

const INSTRUCTION_MESSAGES = [
    "SECURITY: Fall back, repeat, fall back!",
    "SECURITY: Hostile drone detected, retreat to the nearest checkpoint.",
    "SECURITY: You are advised to lock any doors behind you...",
    "SECURITY: ...to stop the advance of the drone."
];

let messageQueue = null;
let messageIndex = 0;
let messageProgress = 0;
let pauseTimer = 0;
const PAUSE_BETWEEN_MESSAGES = 200;

function startIntro() {
    messageQueue = INTRO_MESSAGES; 
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
                    messageIndex = 0;
                }
            }
        }
    }
}

// Bit of a hack, use current message queue to work out which
// cutscene just ended and run whatever code needed from there
function endScene() {
    if (messageQueue == INTRO_MESSAGES) {
        const game = getGame();
        game.getPlayer().canControl = true;
        const enemy = game.getEnemy();
        enemy.targets = game.getTargets();
        enemy.isActive = true;
        messageQueue = INSTRUCTION_MESSAGES;
    }
    else {
        messageQueue = null;
    }
}

function drawCutscene(context, tileset) {
    if (messageQueue) {

        const message = messageQueue[messageIndex];
        const end = Math.min(message.length, messageProgress);
        
        drawText(context, message.substring(0, end), tileset, 16, 16, 2);
    }
}

export { startIntro, updateCutscene, drawCutscene };