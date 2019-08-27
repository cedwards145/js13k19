import { Room } from "./room";

function loadMap(mapData) {
    const rooms = [];
    const tiles = mapData.layers[0].data;
    for (var index = 0; index < tiles.length; index++) {
        if (tiles[index] !== 0) {
            var x = index % mapData.width;
            var y = Math.floor(index / mapData.height);  
            rooms.push(new Room(x, y, tiles[index]));
        }
    }

    return rooms;
}

export { loadMap };