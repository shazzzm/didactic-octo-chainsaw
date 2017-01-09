export default class SimpleObject {
    /**
     * Represents a simple object that moves towards the user everytime they move
     */

    /**
     * Creates the object - pass it the starting location
     */
    constructor(starting_x, starting_y, board_width, board_length) {
        this.x = starting_x;
        this.y = starting_y;
        this.logo = 'O';
    }

    /**
     * Updates the simple_object, should be called everytime the user moves
     * x_x - x location of the user
     * x_y - y location of the user
     * 
     */
    update(old_x_x, old_x_y, new_x_x, new_x_y, object_array, board) {
        var new_oX = this.x;
        var new_oY = this.y;
        var xMovePossible = false;
        var yMovePossible = false;

        // Figure out which direction we want to move in
        if (old_x_x > this.x) {
            new_oX += 1;
        } else if (old_x_x < this.x) {
            new_oX -= 1;
        } 
        if (old_x_y > this.y ) {
            new_oY += 1;
        } else if (old_x_y < this.y) {
            new_oY -= 1;
        }

        // Figure out which direction we can move in
        if (this.isSpaceFree(new_oX, this.y, new_x_x, new_x_y, board, object_array)) {
            xMovePossible = true;
        } 
        if (this.isSpaceFree(this.x, new_oY, new_x_x, new_x_y, board, object_array)) {
            yMovePossible = true;
        }

        // Select a direction to move in
        // if we can only move in 1 direction, do that
        if (xMovePossible && !yMovePossible) {
            new_oY = this.y;
        } else if (!xMovePossible && yMovePossible) {
            new_oX = this.x;
        } else if (xMovePossible && yMovePossible) {
        // If we can move in both, chose one!
        var directionToMove = Math.random() > 0.5;

        if (directionToMove) {
            new_oY = this.y;
        } else {
            new_oX = this.x;
        }
        } else {
            new_oX = this.x;
            new_oY = this.y
        }

        this.x = new_oX;
        this.y = new_oY;
    }

    /**
     * Checks if a space is free
     */
    isSpaceFree(x, y, x_x, x_y, board, object_array) {
        // Moving into the spot occupied by the X
        if (x == x_x && y == x_y) {
            return false;
        }

        // Check we're still on the map
        if (x < 0 || y < 0 || board.length <= y ||
            board[0].length <= x) { return false }

        // Are we moving into the maze?
        if (board[x][y] != null) { return false }

        for (var i in object_array) {
            if (object_array[i].x == x && object_array[i].y == y) {
                return false;
            }
        }

        return true;
    }
}