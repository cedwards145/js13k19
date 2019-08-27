import { Room } from "./room";

function loadMap(mapData) {
    const map = {
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
                map.doors.push({
                    x: neighbour.x - 4,
                    y: room.y + 64,
                    width: 8,
                    height: 16
                });
            }
        }
        if (room.hasBottomDoor) {
            const neighbour = map.rooms[getIndex(x, y + 1, mapData.width)]

            if (neighbour) {
                // Hard-coded coords needs fixing
                map.doors.push({
                    x: room.x + 64,
                    y: neighbour.y - 4,
                    width: 16,
                    height:8
                });
            }
        }
    }

    return map;
}

function getIndex(x, y, width) {
    return y * width + x;
}

export { loadMap };