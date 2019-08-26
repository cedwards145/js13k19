import { Rectangle } from "./rectangle";

const ROOM_HEIGHT = 9;
const ROOM_WIDTH = 9;
const TOP_WALLS = [3, 4, 5, 7, 10, 11, 13];
const LEFT_WALLS = [2, 3, 5, 6, 9, 10, 15];
const BOTTOM_WALLS = [2, 4, 5, 7, 8, 9, 12];
const RIGHT_WALLS = [2, 3, 4, 6, 8, 11, 14];

function loadMap(mapData, tileSize) {
    const rooms = [];
    const tiles = mapData.layers[0].data;
    for (var index = 0; index < tiles.length; index++) {
        if (tiles[index] !== 0) {
            var x = index % mapData.width;
            var y = Math.floor(index / mapData.height);  
            rooms.push(placeRoom(x * tileSize * ROOM_WIDTH, y * tileSize * ROOM_HEIGHT, tiles[index], tileSize));
        }
    }

    return rooms;
}

function placeRoom(left, top, type, tileSize) {
    var room = {
        staticBodies: []
    };
    
    // Place top and bottom walls
    for (var x = 0; x < ROOM_WIDTH; x++) {
        const isCenter = x === Math.ceil(ROOM_WIDTH / 2) - 1;

        // Top walls
        // Place wall if the cell isn't the center, or it is the center but this tile type has a wall at the top
        if (!isCenter || TOP_WALLS.includes(type)) {
            room.staticBodies.push(new Rectangle(left + (x * tileSize), top, tileSize, tileSize));
        }

        // Botom walls, same logic as above
        if (!isCenter || BOTTOM_WALLS.includes(type)) {
            room.staticBodies.push(new Rectangle(left + (x * tileSize), top + ((ROOM_HEIGHT - 1) * tileSize), tileSize, tileSize));
        }
    }

    // place left and right walls, starting at 1 and ending 1 early to avoid overlapping boxes
    // on the corners of the room
    for (var y = 1; y < ROOM_HEIGHT - 1; y++) {
        const isCenter = y === Math.ceil(ROOM_HEIGHT / 2) - 1;

        // Left walls
        if (!isCenter || LEFT_WALLS.includes(type)) {
            room.staticBodies.push(new Rectangle(left, top + (y * tileSize), tileSize, tileSize));
        }

        if (!isCenter || RIGHT_WALLS.includes(type)) {
            room.staticBodies.push(new Rectangle(left + ((ROOM_WIDTH - 1) * tileSize), top + (y * tileSize), tileSize, tileSize));
        }
    }
    
    return room;
}

export { loadMap };