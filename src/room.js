import { Rectangle } from "./rectangle";

const ROOM_HEIGHT = 9;
const ROOM_WIDTH = 9;
const TOP_WALLS = [3, 4, 5, 7, 10, 11, 13];
const LEFT_WALLS = [2, 3, 5, 6, 9, 10, 15];
const BOTTOM_WALLS = [2, 4, 5, 7, 8, 9, 12];
const RIGHT_WALLS = [2, 3, 4, 6, 8, 11, 14];
const TILE_SIZE = 16;

class Room {
    constructor(x, y, type) {
        this.x = x * TILE_SIZE * ROOM_WIDTH;
        this.y = y * TILE_SIZE * ROOM_WIDTH;
        this.type = type
        this.staticBodies = [];
        
        this.hasTopDoor = !(TOP_WALLS.includes(type));
        this.hasBottomDoor = !(BOTTOM_WALLS.includes(type));
        this.hasLeftDoor = !(LEFT_WALLS.includes(type));
        this.hasRightDoor = !(RIGHT_WALLS.includes(type));

        this.generateBodies();
    }

    generateBodies() {
        // Place top and bottom walls
        for (var x = 0; x < ROOM_WIDTH; x++) {
            const isCenter = x === Math.ceil(ROOM_WIDTH / 2) - 1;

            // Top walls
            // Place wall if the cell isn't the center, or it is the center but this tile type has a wall at the top
            if (!isCenter || !this.hasTopDoor) {
                this.staticBodies.push(new Rectangle(this.x + (x * TILE_SIZE), this.y, TILE_SIZE, TILE_SIZE));
            }

            // Botom walls, same logic as above
            if (!isCenter || !this.hasBottomDoor) {
                this.staticBodies.push(new Rectangle(this.x + (x * TILE_SIZE), this.y + ((ROOM_HEIGHT - 1) * TILE_SIZE), TILE_SIZE, TILE_SIZE));
            }
        }

        // place left and right walls, starting at 1 and ending 1 early to avoid overlapping boxes
        // on the corners of the room
        for (var y = 1; y < ROOM_HEIGHT - 1; y++) {
            const isCenter = y === Math.ceil(ROOM_HEIGHT / 2) - 1;

            // Left walls
            if (!isCenter || !this.hasLeftDoor) {
                this.staticBodies.push(new Rectangle(this.x, this.y + (y * TILE_SIZE), TILE_SIZE, TILE_SIZE));
            }

            if (!isCenter || !this.hasRightDoor) {
                this.staticBodies.push(new Rectangle(this.x + ((ROOM_WIDTH - 1) * TILE_SIZE), this.y + (y * TILE_SIZE), TILE_SIZE, TILE_SIZE));
            }
        }
    }
}

export { Room };