import { Circle } from "./circle";
import { loadMap, populateRoom } from "./maploader";
import { Player } from "./player";
import { Rectangle } from "./rectangle";
import { Room } from "./room";
import { Enemy } from "./enemy";
import { TILE_SIZE, ROOM_HEIGHT, ROOM_WIDTH } from "./constants";
import { CLOSED_STATE } from "./door";
import { drawText } from "./graphics";
import { updateMenu, drawMenu } from "./menu";
import { drawCutscene, updateCutscene } from "./cutscene";

class Game {
    constructor(width, height, tileset, mainCanvas, floorCanvas, lightCanvas) {
        this.width = width;
        this.height = height;
        
        // Store main canvas and context along with auxiliary canvases for 
        // more complex drawing
        this.tileset = tileset;
        this.mainCanvas = mainCanvas;
        this.mainContext = mainCanvas.getContext("2d");
        this.mainContext.imageSmoothingEnabled = false;
        this.floorCanvas = floorCanvas;
        this.floorContext = floorCanvas.getContext("2d");
        this.floorContext.imageSmoothingEnabled = false;
        this.lightCanvas = lightCanvas;
        this.lightContext = lightCanvas.getContext("2d");
        this.lightContext.imageSmoothingEnabled = false;

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

    // Separate from constructor so that all resources can be loaded before running
    init() {
        this.generateFloorPattern();
    }

    generateFloorPattern() {
        const tilesAcross = 50;
        const tilesDown = 50;
        this.floorCanvas.width = TILE_SIZE * tilesAcross;
        this.floorCanvas.height = TILE_SIZE * tilesDown;

        for (let x = 0; x < tilesAcross; x++) {
            for (let y = 0; y < tilesDown; y++) {
                let xOffset = 0;
                const value = Math.random() * 100;
                if (value >= 95) {
                    xOffset = TILE_SIZE * 1;
                }
                else if (value >= 90) {
                    xOffset = TILE_SIZE * 2;
                }

                this.floorContext.drawImage(this.tileset, xOffset, 0, TILE_SIZE, TILE_SIZE, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
        this.floorPattern = this.mainContext.createPattern(this.floorCanvas, "repeat");
    }

    loadMap(jsonData) {
        // Load rooms and doors from JSON data
        this.map = loadMap(jsonData);
        this.rooms = this.map.rooms;
        this.doors = this.map.doors;

        // Load player start position from map
        let playerX = 0;
        let playerY = 0;
        
        for (let index = 0; index < jsonData.properties.length; index++) {
            const property = jsonData.properties[index];
            if (property.name === "startX") {
                playerX = Math.floor((property.value + 0.5) * TILE_SIZE * ROOM_WIDTH);
            }
            else if (property.name === "startY") {
                playerY = Math.floor((property.value + 0.5) * TILE_SIZE * ROOM_HEIGHT);
            }
        }
        this.setPlayer(playerX, playerY);
        this.enemy = new Enemy(playerX, playerY + (TILE_SIZE * 2));
        this.addGameObject(this.enemy);

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

            const obstacles = populateRoom(room);
            for (let obstacleIndex = 0; obstacleIndex < obstacles.length; obstacleIndex++) {
                this.addGameObject(obstacles[obstacleIndex]);
            }
        }
        for (let index = 0; index < this.doors.length; index++) {
            this.addGameObject(this.doors[index]);
        }

        this.lightCanvas.width = TILE_SIZE * ROOM_WIDTH * this.map.width;
        this.lightCanvas.height = TILE_SIZE * ROOM_HEIGHT * this.map.height;
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

    getEnemy() {
        return this.enemy;
    }

    // Game logic update
    update(delta) {
        this.updateDistanceMap();
        for (let index = 0; index < this.gameObjects.length; index++) {
            this.gameObjects[index].update();
        }
        this.resolveCollisions();
        this.updateLightMap();
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
            const exits = currentRoom.getExits();

            for (let index = 0; index < exits.length; index++) {
                const exit = exits[index];
                const neighbour = exit.room;
                const cost = exit.door.locked ? 5 : 1;
                const distance = this.distanceMap[currentRoom.x][currentRoom.y] + cost;

                if (this.distanceMap[neighbour.x][neighbour.y] > distance) {
                    this.distanceMap[neighbour.x][neighbour.y] = distance;
                    openCells.push(neighbour);
                }
            }
        }
    }

    updateLightMap() {
        const openCells = [];
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                const room = this.roomsByCoord[x][y];
                const lightLevel = room.getEmittedLight();
                if (lightLevel > 0) {
                    room.lightLevel = lightLevel;
                    openCells.push(room);
                }
                else {
                    room.lightLevel = 0;
                }
            }
        }

        while (openCells.length > 0) {
            const room = openCells.pop();
            const exits = room.getExits();

            for (let index = 0; index < exits.length; index++) {
                const exit = exits[index];
                if (exit.door.state === CLOSED_STATE) {
                    continue;
                }

                const neighbour = exit.room;
                const lightLevel = room.lightLevel - 1;
                if (lightLevel > 0 && lightLevel > neighbour.lightLevel) {
                    neighbour.lightLevel = lightLevel;
                    openCells.push(neighbour);
                }   
            }
        }

        updateMenu();
        updateCutscene();
    }

    // Main draw function
    draw() {
        // Reset any blending operations
        this.mainContext.globalCompositeOperation = "source-over";
        this.lightContext.globalAlpha = 1;

        // Clear any canvases before canvas transform is applied
        this.lightContext.fillStyle = "black";
        this.lightContext.fillRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);
        this.mainContext.fillStyle = "black";
        this.mainContext.fillRect(0, 0, this.width, this.height);
        
        // Translate canvas co-ords to center the player on screen
        const xOffset = Math.floor(this.player.getX() - this.width / 2);
        const yOffset = Math.floor(this.player.getY() - this.height / 2);
        this.mainContext.translate(-1 * xOffset, -1 * yOffset);
        //this.lightContext.translate(xOffset, yOffset);
        
        this.mainContext.fillStyle = this.floorPattern;
        this.mainContext.fillRect(0, 0, this.map.width * TILE_SIZE * ROOM_WIDTH, this.map.height * TILE_SIZE * ROOM_HEIGHT);

        this.lightContext.globalCompositeOperation = "lighten";
        for (let gameObjectIndex = 0; gameObjectIndex < this.gameObjects.length; gameObjectIndex++) {
            this.gameObjects[gameObjectIndex].draw(this.mainContext);
            this.gameObjects[gameObjectIndex].drawLight(this.lightContext);
        }
        this.lightContext.globalCompositeOperation = "source-over";
        
        // Reset context transform to identity matrix
        this.mainContext.setTransform(1, 0, 0, 1, 0, 0);
        this.lightContext.setTransform(1, 0, 0, 1, 0, 0);

        // Draw lighting overlay
        this.mainContext.globalCompositeOperation = "multiply";
        this.mainContext.drawImage(this.lightCanvas, xOffset, yOffset, this.width, this.height, 0, 0, this.width, this.height);

        // Draw non-game object systems like menus and cutscenes
        this.mainContext.globalCompositeOperation = "source-over";
        drawMenu(this.mainContext, this.tileset);
        drawCutscene(this.mainContext, this.tileset);

        return;

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