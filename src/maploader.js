import { Room } from "./room";
import { Door } from "./door";
import { Obstacle } from "./obstacle";
import { TILE_SIZE, ROOM_WIDTH, ROOM_HEIGHT } from "./constants";

// Rooms that should not be populated with objects
// Contains checkpoint rooms, 4 way intersections and empty rooms
const SPECIAL_ROOMS = [1, 16, 17];

function loadMap(mapData) {
    const map = {
        width: mapData.width,
        height: mapData.height,
        rooms: [],
        doors: []
    };

    const tiles = mapData.layers[0].data;
    
    // Initial pass generates the rooms and their colliders
    for (let index = 0; index < tiles.length; index++) {
        const x = index % mapData.width;
        const y = Math.floor(index / mapData.height);  
        map.rooms.push(new Room(x, y, tiles[index]));
    }

    // Second pass now that all rooms exist links them with doors
    for (let index = 0; index < map.rooms.length; index++) {
        const x = index % mapData.width;
        const y = Math.floor(index / mapData.height);
        const room = map.rooms[getIndex(x, y, mapData.width)];

        if (room.hasRightDoor) {
            const neighbour = map.rooms[getIndex(x + 1, y, mapData.width)];
            
            if (neighbour) {
                const door = new Door(neighbour.left - 4, room.top + 64, 8, 16, false, [room, neighbour]);
                room.addExit(neighbour, door);
                
                // Hard-coded coords needs fixing
                map.doors.push(door);
            }
        }
        if (room.hasBottomDoor) {
            const neighbour = map.rooms[getIndex(x, y + 1, mapData.width)]

            if (neighbour) {
                const door = new Door(room.left + 64, neighbour.top - 4, 16, 8, true, [room, neighbour]);
                room.addExit(neighbour, door);

                // Hard-coded coords needs fixing
                map.doors.push(door);
            }
        }
    }

    return map;
}

function populateRoom(room) {
    // Hack to stop spawning objects in cutscene room
    if (SPECIAL_ROOMS.includes(room.type) || (room.x === 1 && room.y === 19)) {
        return [];
    }

    const gameObjects = [];

    // Should really have a better way of placing objects, but pathfinding inside a room is stupid.
    // To avoid things getting stuck, manually place objects around the edges of rooms

    // Storage room top left
    if (Math.random() <= 0.1) {
        gameObjects.push(new Obstacle(room.left + TILE_SIZE + Math.random(), room.top + TILE_SIZE + Math.random(), TILE_SIZE, TILE_SIZE, 48, 0));
        gameObjects.push(new Obstacle(room.left + TILE_SIZE * (2  + Math.random()), room.top + TILE_SIZE + Math.random(), TILE_SIZE, TILE_SIZE, 48, 0));
        gameObjects.push(new Obstacle(room.left + TILE_SIZE + Math.random(), room.top + TILE_SIZE * 2 + Math.random(), TILE_SIZE, TILE_SIZE, 48, 0));
    }
    // Desk top left
    else if (Math.random() <= 0.2) {
        gameObjects.push(new Obstacle(room.left + TILE_SIZE, room.top + TILE_SIZE, TILE_SIZE * 2, TILE_SIZE, 64, 0));
    }

    // Storage bottom right
    if (Math.random() <= 0.1) {
        gameObjects.push(new Obstacle(room.left + TILE_SIZE * (ROOM_WIDTH - (2 + Math.random())), room.top + TILE_SIZE * (ROOM_HEIGHT - 2)  + Math.random(), TILE_SIZE, TILE_SIZE, 48, 0));
        gameObjects.push(new Obstacle(room.left + TILE_SIZE * (ROOM_WIDTH - (2 + Math.random())), room.top + TILE_SIZE * (ROOM_HEIGHT - 3) + Math.random(), TILE_SIZE, TILE_SIZE, 48, 0));
    }

    // Desk room top right
    if (Math.random() <= 0.1) {
        gameObjects.push(new Obstacle(room.left + TILE_SIZE * 6, room.top + TILE_SIZE, TILE_SIZE * 2, TILE_SIZE, 64, 0));
    }
    
    // Break room bottom left
    if (Math.random() <= 0.1) {
        gameObjects.push(new Obstacle(room.left + TILE_SIZE, room.top + TILE_SIZE * 6, TILE_SIZE * 2, TILE_SIZE * 2, 96, 0));
    }

    return gameObjects;
}

function getIndex(x, y, width) {
    return y * width + x;
}

export { loadMap, populateRoom };