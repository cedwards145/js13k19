import { Circle } from "./circle";
import { loadMap } from "./maploader";
import { Player } from "./player";
import { Rectangle } from "./rectangle";
import { Room } from "./room";
import { Enemy } from "./enemy";

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

        // Add all doors and rooms to the list of game objects
        for (let index = 0; index < this.rooms.length; index++) {
            this.addGameObject(this.rooms[index]);
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
        for (let index = 0; index < this.gameObjects.length; index++) {
            this.gameObjects[index].update();
        }

        this.resolveCollisions();
    }

    // Main draw function
    draw(context) {        
        for (let gameObjectIndex = 0; gameObjectIndex < this.gameObjects.length; gameObjectIndex++) {
            this.gameObjects[gameObjectIndex].draw(context);
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