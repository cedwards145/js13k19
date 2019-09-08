import { Circle } from "./circle";
import { loadMap } from "./maploader";
import { Player } from "./player";
import { Rectangle } from "./rectangle";
import { Room } from "./room";
import { Enemy } from "./enemy";
import { TILE_SIZE, ROOM_HEIGHT, ROOM_WIDTH } from "./constants";

class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        // Build up lists of colliders for use in physics simulation.
        // Separate out circle colliders which will be dynamic from
        // rectangles which are static.
        // (Static colliders don't get moved by collision resolution,
        // dynamic ones do)
        this.dynamicBodies = [];
        this.staticBodies = [];
        this.triggers = [];
        this.gameObjects = [];
    }

    loadMap(jsonData) {
        // Load rooms and doors from JSON data
        this.map = loadMap(jsonData);
        this.rooms = this.map.rooms;
        this.doors = this.map.doors;

        // Build up structures for pathfinding
        // RoomsByCoord maps an x, y pair to a room at that location,
        // DistanceMap maps an x, y pair to the distance that room is from the player
        this.roomsByCoord = {};
        this.distanceMap = {};
        for (let x = 0; x < this.map.width; x++) {
            this.roomsByCoord[x] = {};
            this.distanceMap[x] = {};
        }

        // Add all doors and rooms to the list of game objects
        for (let index = 0; index < this.rooms.length; index++) {
            const room = this.rooms[index];
            this.roomsByCoord[room.x][room.y] = room;
            this.addGameObject(room);
        }
        for (let index = 0; index < this.doors.length; index++) {
            this.addGameObject(this.doors[index]);
        }

        this.addGameObject(new Enemy(300, 1400));
    }

    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);

        // Grab each game object's colliders and triggers for collision resolution
        const colliders = gameObject.getColliders();
        for (let colliderIndex = 0; colliderIndex < colliders.length; colliderIndex++) {
            const collider = colliders[colliderIndex];
            if (collider instanceof Circle) {
                this.dynamicBodies.push(collider);
            }
            else if (collider instanceof Rectangle) {
                this.staticBodies.push(collider);
            }
        }
    
        const currentTriggers = gameObject.getTriggers();
        for (let triggerIndex = 0; triggerIndex < currentTriggers.length; triggerIndex++) {
            this.triggers.push(currentTriggers[triggerIndex]);
        }
    }

    getRoomFromCoord(x, y) {
        // First divide x and y by tile size to get coords in terms of tiles
        // Then divide by room size and floor to get coords in terms of rooms
        x = Math.floor((x / TILE_SIZE) / ROOM_WIDTH);
        y = Math.floor((y / TILE_SIZE) / ROOM_HEIGHT);

        return this.roomsByCoord[x][y];
    }

    setPlayer(x, y) {
        if (this.player) {
            this.player.setX(x);
            this.player.setY(y);
        }
        else {
            this.player = new Player(x, y);
            this.addGameObject(this.player);
        }
    }

    getPlayer() {
        return this.player;
    }

    // Game logic update
    update(delta) {
        this.updateDistanceMap();
        for (let index = 0; index < this.gameObjects.length; index++) {
            this.gameObjects[index].update();
        }

        this.resolveCollisions();
    }

    updateDistanceMap() {
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                this.distanceMap[x][y] = Number.MAX_VALUE;
            }
        }

        const playerRoom = this.getRoomFromCoord(this.player.getX(), this.player.getY());

        this.distanceMap[playerRoom.x][playerRoom.y] = 0;

        const openCells = [];
        openCells.push({
            x: playerRoom.x,
            y: playerRoom.y
        });

        while (openCells.length > 0) {
            const currentCell = openCells.pop();
            const currentRoom = this.roomsByCoord[currentCell.x][currentCell.y];
            const neighbours = currentRoom.getNeighbours();

            for (let index = 0; index < neighbours.length; index++) {
                const neighbour = neighbours[index];
                const neighbourRoom = neighbour.room;
                const cost = neighbour.door.locked ? 5 : 1;
                const distance = this.distanceMap[currentRoom.x][currentRoom.y] + cost;
                if (this.distanceMap[neighbourRoom.x][neighbourRoom.y] > distance) {
                    this.distanceMap[neighbourRoom.x][neighbourRoom.y] = distance;
                    openCells.push(neighbourRoom);
                }
            }
        }
    }

    // Main draw function
    draw(context) {        
        for (let gameObjectIndex = 0; gameObjectIndex < this.gameObjects.length; gameObjectIndex++) {
            this.gameObjects[gameObjectIndex].draw(context);
        }

        // Debug view for visualising distance map
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                if (this.distanceMap[x][y] === Number.MAX_VALUE) {
                    continue;
                }

                context.fillStyle = "rgba(" + (255 - (this.distanceMap[x][y] * 20)) + ", 0, 0, 0.5)";
                context.fillRect(x * TILE_SIZE * ROOM_WIDTH, 
                                 y * TILE_SIZE * ROOM_HEIGHT, 
                                 TILE_SIZE * ROOM_WIDTH, 
                                 TILE_SIZE * ROOM_HEIGHT);
            }
        }
    }

    resolveCollisions() {
        for (let dynamicIndex = 0; dynamicIndex < this.dynamicBodies.length; dynamicIndex++) {
            const dynamicBody = this.dynamicBodies[dynamicIndex];
    
            for (let staticBodyIndex = 0; staticBodyIndex < this.staticBodies.length; staticBodyIndex++) {
                const staticBody = this.staticBodies[staticBodyIndex];
                this.checkCollision(dynamicBody, staticBody);
            }
    
            for (let triggerIndex = 0; triggerIndex < this.triggers.length; triggerIndex++) {
                const trigger = this.triggers[triggerIndex];
                if (this.checkCollision(dynamicBody, trigger, false)) {
                    trigger.onCollision(dynamicBody);
                }
            }
        }
    }
    
    resolveCollision(circle, nearestX, nearestY, deltaX, deltaY) {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalisedX = deltaX / distance;
        const normalisedY = deltaY / distance;
        circle.x = Math.floor(nearestX + normalisedX * circle.radius);
        circle.y = Math.floor(nearestY + normalisedY * circle.radius);
    }
    
    checkCollision(circle, rectangle, resolve=true) {
        const nearestX = Math.max(rectangle.x, Math.min(circle.x, rectangle.x + rectangle.width));
        const nearestY = Math.max(rectangle.y, Math.min(circle.y, rectangle.y + rectangle.height));
        const deltaX = circle.x - nearestX;
        const deltaY = circle.y - nearestY;
         
        if ((deltaX * deltaX + deltaY * deltaY) < (circle.radius * circle.radius)) {
            if (resolve) {
                this.resolveCollision(circle, nearestX, nearestY, deltaX, deltaY);
            }
            return true;
        }
    
        return false;
    }
}

export { Game };