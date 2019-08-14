class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 3;
    }

    move(amount) {
        this.x += amount * this.speed;
    }
}

export { Player };