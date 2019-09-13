import { Rectangle } from "./rectangle";
import { GameObject } from "./gameobject";
import { ROOM_HEIGHT, ROOM_WIDTH, TILE_SIZE, MAX_LIGHT_DISTANCE } from "./constants";
import { Player } from "./player";

const TOP_WALLS = [0, 3, 4, 5, 7, 10, 11, 13];
const LEFT_WALLS = [0, 2, 3, 5, 6, 9, 10, 15, 17];
const BOTTOM_WALLS = [0, 2, 4, 5, 7, 8, 9, 12];
const RIGHT_WALLS = [0, 2, 3, 4, 6, 8, 11, 14, 17];

class Room extends GameObject {
    constructor(x, y, type) {
        super();
        // Store info read from map data
        this.x = x;
        this.y = y;
        this.type = type;
        
        // Track whether this room has been visited by the player
        this.visited = false;

        // Calculate left and top coords in pixels
        this.left = x * TILE_SIZE * ROOM_WIDTH;
        this.top = y * TILE_SIZE * ROOM_WIDTH;

        this.hasTopDoor = !(TOP_WALLS.includes(type));
        this.hasBottomDoor = !(BOTTOM_WALLS.includes(type));
        this.hasLeftDoor = !(LEFT_WALLS.includes(type));
        this.hasRightDoor = !(RIGHT_WALLS.includes(type));
        this.colliders = [];
        this.exits = [];

        this.light = Math.random();

        // Special case for type 0, empty tile:
        // Create a single body covering the whole room
        if (type === 0) {
            this.colliders.push(new Rectangle(this.left, this.top, TILE_SIZE * ROOM_WIDTH, TILE_SIZE * ROOM_HEIGHT));
        }
        else {
            this.generateBodies();
        }
    }

    generateBodies() {
        // Place top and bottom walls
        for (var x = 0; x < ROOM_WIDTH; x++) {
            const isCenter = x === Math.ceil(ROOM_WIDTH / 2) - 1;

            // Top walls
            // Place wall if the cell isn't the center, or it is the center but this tile type has a wall at the top
            if (!isCenter || !this.hasTopDoor) {
                this.colliders.push(new Rectangle(this.left + (x * TILE_SIZE), this.top, TILE_SIZE, TILE_SIZE));
            }

            // Botom walls, same logic as above
            if (!isCenter || !this.hasBottomDoor) {
                this.colliders.push(new Rectangle(this.left + (x * TILE_SIZE), this.top + ((ROOM_HEIGHT - 1) * TILE_SIZE), TILE_SIZE, TILE_SIZE));
            }
        }

        // place left and right walls, starting at 1 and ending 1 early to avoid overlapping boxes
        // on the corners of the room
        for (var y = 1; y < ROOM_HEIGHT - 1; y++) {
            const isCenter = y === Math.ceil(ROOM_HEIGHT / 2) - 1;

            // Left walls
            if (!isCenter || !this.hasLeftDoor) {
                this.colliders.push(new Rectangle(this.left, this.top + (y * TILE_SIZE), TILE_SIZE, TILE_SIZE));
            }

            if (!isCenter || !this.hasRightDoor) {
                this.colliders.push(new Rectangle(this.left + ((ROOM_WIDTH - 1) * TILE_SIZE), this.top + (y * TILE_SIZE), TILE_SIZE, TILE_SIZE));
            }
        }
    }

    getExits() {
        return this.exits;
    }

    addExit(room, door, reflexive=true) {
        this.exits.push({
            room: room,
            door: door
        });

        // Automatically lock all doors from checkpoints
        if (this.type === 17) {
            door.locked = true;
        }

        if (reflexive) {
            room.addExit(this, door, false);
        }
    }

    draw(context) {
        context.fillStyle = "black";
        for (let bodyIndex = 0; bodyIndex < this.colliders.length; bodyIndex++) {
            const rectangle = this.colliders[bodyIndex];        
            context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        }
    }

    drawLight(context) {
        if (Math.random() > 0.999) {
            return;
        }
        
        if (this.lightLevel > 0) {
            const centerX = this.left + (TILE_SIZE * ROOM_WIDTH) / 2;
            const centerY = this.top + (TILE_SIZE * ROOM_HEIGHT) / 2;
            const gradient = context.createRadialGradient(centerX, centerY, TILE_SIZE, 
                                                        centerX, centerY, TILE_SIZE * ROOM_WIDTH);
            
            if (this.type === 17) {
                gradient.addColorStop(0, 'rgba(0, 200, 255, ' + (this.lightLevel / MAX_LIGHT_DISTANCE) + ')');
            }
            else {
                gradient.addColorStop(0, 'rgba(255, 255, 255, ' + (this.lightLevel / MAX_LIGHT_DISTANCE) + ')');
            }
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            context.fillStyle = gradient;
            context.fillRect(this.left, this.top, TILE_SIZE * ROOM_WIDTH, TILE_SIZE * ROOM_HEIGHT);
        }
    }

    getEmittedLight() {
        if (this.containsPlayer()) {
            return MAX_LIGHT_DISTANCE;
        }
        return 0;
    }
    
    getColliders() {
        return this.colliders;
    }

    containsPlayer() {
        const player = this.game.getPlayer();
        const playersRoom = this.game.getRoomFromCoord(player.getX(), player.getY());
        return this == playersRoom;
    }
}

export { Room };