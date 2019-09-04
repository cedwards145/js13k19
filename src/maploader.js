import { Room } from "./room";
import { Door } from "./door";

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
                // Hard-coded coords needs fixing
                map.doors.push(new Door(neighbour.left - 4, room.top + 64, 8, 16, false));
            }
        }
        if (room.hasBottomDoor) {
            const neighbour = map.rooms[getIndex(x, y + 1, mapData.width)]

            if (neighbour) {
                // Hard-coded coords needs fixing
                map.doors.push(new Door(room.left + 64, neighbour.top - 4, 16, 8, true));
            }
        }
    }

    return map;
}

function getIndex(x, y, width) {
    return y * width + x;
}

export { loadMap };