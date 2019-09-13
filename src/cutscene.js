import { drawText } from "./graphics";
import { getGame } from ".";
import { win } from "./menu";

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

const CHECKPOINT_ONE_MESSAGES = [
    "SECURITY: Checkpoint A reached, drone in hot pursuit.",
    "SECURITY: Proceed to the next checkpoint ASAP."
];

const CHECKPOINT_TWO_MESSAGES = [
    "SECURITY: The drone is proving more resillient than expected.",
    "SECURITY: You are advised to exit the laboratory through the...",
    "SECURITY: ...remaining last security checkpoint."
];

const CHECKPOINT_THREE_MESSAGES = [
    "SECURITY: Nicely done, head on upstairs. We can take it from here."
];

let messageQueue = null;
let messageIndex = 0;
let messageProgress = 0;
let pauseTimer = 0;
const PAUSE_BETWEEN_MESSAGES = 200;

function startIntro() {
    playMessages(INTRO_MESSAGES);
}

function checkpointOne() {
    playMessages(CHECKPOINT_ONE_MESSAGES);
}

function checkpointTwo() {
    playMessages(CHECKPOINT_TWO_MESSAGES);
}

function checkpointThree() {
    playMessages(CHECKPOINT_THREE_MESSAGES);
}

function playMessages(queue) {
    messageQueue = queue;
    messageProgress = 0;
    messageIndex = 0;
    pauseTimer = 0;
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
    else if (messageQueue == CHECKPOINT_THREE_MESSAGES) {
        messageQueue = null;
        win();
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

export { startIntro, checkpointOne, checkpointTwo, checkpointThree, updateCutscene, drawCutscene };