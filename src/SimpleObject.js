class SimpleObject {
    /**
     * Represents a simple object that moves towards the user everytime they move
     */

    /**
     * Creates the object - pass it the starting location
     */
    constructor(starting_x, starting_y, board_width, board_length) {
        this.x = starting_x;
        this.y = starting_y;
    }

    /**
     * Updates the simple_object, should be called everytime the user moves
     * x_x - x location of the user
     * x_y - y location of the user
     * 
     */
    update(x_x, x_y, object_array) {
        var new_oX = this.x;
        var new_oY = this.y;
        var xMovePossible = false;
        var yMovePossible = false;

        // Figure out which direction we want to move in
        if (x_x > this.x) {
            new_oX += 1;
        } else if (x_x < this.x) {
            new_oX -= 1;
        } 
        if (x_y > this.y ) {
            new_oY += 1;
        } else if (x_y < this.y) {
            new_oY -= 1;
        }

        // Figure out which direction we can move in
        if (this.isSpaceFree(new_oX, oY, board, object_array)) {
            xMovePossible = true;
        } 
        if (this.isSpaceFree(oX, new_oY, board, object_array)) {
            yMovePossible = true;
        }

        // Select a direction to move in
        // if we can only move in 1 direction, do that
        if (xMovePossible && !yMovePossible) {
            new_oY = oY;
        } else if (!xMovePossible && yMovePossible) {
            new_oX = oX;
        } else if (xMovePossible && yMovePossible) {
        // If we can move in both, chose one!
        var directionToMove = Math.random() > 0.5;

        if (directionToMove) {
            new_oY = oY;
        } else {
            new_oX = oX;
        }
        } else {
            new_oX = oX;
            new_oY = oY;
        }

        this.x = new_oX;
        this.y = new_oY;
    }

    /**
     * Checks if a space is free
     */
    isSpaceFree(x, y, board, object_array) {
        // Check we're still on the map
        if (x < 0 || y < 0 || board.length() <= y ||
            board[0].length() <= x) { return false }

        // Are we moving into the maze?
        if (board[x][y] != null) { return false }

        for (var i in object_array) {
            if (object_array[i].x == x && object_array[i].u == y) {
                return false;
            }
        }

        return true;
    }
}