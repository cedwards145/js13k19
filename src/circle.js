class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    collidesWithRectangle(rectangle) {
        var deltaX = this.x - Math.max(rectangle.x, Math.min(this.x, rectangle.x + rectangle.width));
        var deltaY = this.y - Math.max(rectangle.y, Math.min(this.y, rectangle.y + rectangle.height));
        return (deltaX * deltaX + deltaY * deltaY) < (this.radius * this.radius);
    }
}

export { Circle };