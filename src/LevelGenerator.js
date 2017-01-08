/**
 * Use this to pre generate levels for the game
 * 
 */
"use strict"
class LevelGenerator
{
    constructor() {
        this.board_width = 15;
        this.board_length = 20;
        var board = [];
        for (var x = 0; x < this.board_width; x++) {
            board.push([]);
            for (var y = 0; y < this.board_length; y++) {
                board[x].push(null);
            }
        }

        this.board = board;
        this.level_openness = 0.5;
        this.o_array = [];

    }
   generateNextMazePoint() {
    if (Math.random() > this.level_openness) {
      return 1;
    } else {
      return -1;
    }
  }

  generateMaze() {
    var board = this.board;
    var visited_cells = new Set();
    var current_point = {x: 0, y: 0};
    var goal = {x: this.board_width-1, y: this.board_length-1};
    for (var x = 0; x < this.board_width; x++) {
      for (var y = 0; y < this.board_length; y++) {
        board[x][y] = 'I';
      }
    }
    var prev_prob = 0.5;
    while (current_point.x != goal.x || current_point.y != goal.y) {
      board[current_point.x][current_point.y] = null;

      // Pick an adjacent cell
      var new_point;
      if (Math.random() > prev_prob) {
        // Change y
        var new_y = current_point.y + this.generateNextMazePoint();
        // Check the bounds
        if (new_y < 0 || new_y >= this.board_length) {
          continue
        } 
        new_point = { x: current_point.x, y:new_y };
      } else {
        // Change x
        var new_x = current_point.x + this.generateNextMazePoint();
        if (new_x < 0 || new_x >= this.board_width) {
          continue
        } 
        new_point = { x: new_x, y:current_point.y };
      }

      if (!visited_cells.has(new_point)) {
        current_point = new_point;
        visited_cells.add(current_point);
      }
    }

    board[goal.x][goal.y] = null;
    this.board = board;
    return board;
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  generateOs(noOs) {
    var o_array = [];
    var noOs = 5;

    for (var i = 0; i < noOs; i++) {
      while (true) {
        var x = this.getRandomInt(0, this.board_width);
        var y = this.getRandomInt(0, this.board_length);
        // Check if this point is occupied
        if (this.isSpaceFree(x, y, this.board)) { break; }
      }
      var point = [x, y];
      this.board[x][y] = 'O';
      o_array.push(point);
    }
    return o_array;
  }

  isSpaceFree(x, y, board, o_array) {
    // Check we're still on the map
    if (x < 0 || y < 0 || this.board_length <= y ||
        this.board_width <= x) { return false }

    // Check we're not moving to the goal, as there will be a flag in the way
    var positionIsNotGoal = !(x == this.goal && y == this.goal);

    // Checks if a move is legit
    if (positionIsNotGoal && board[x][y] != null) { return false }

    for (var i in o_array) {
      if (o_array[i][0] == x && o_array[i][1] == y) {
        return false;
      } 
    }

    return true;
  }

  printBoard() {
      var outp = "";
      for (var i = 0; i < this.board_length+2; i++) {
          outp += "-"
      }
      outp +="\n"
      for (var i = 0; i < this.board_width; i++) {
        outp += "|"
        for (var j = 0; j < this.board_length; j++) {
            if (this.board[i][j] != null) {
                outp += String(this.board[i][j]);
            } else {
                outp += " "
            }
        }
        outp += "|"
        outp += "\n";
      }
      for (var i = 0; i < this.board_length+2; i++) {
        outp += "-"
      }

      console.log(outp)
  }
}
var fs = require('fs');
var readline = require('readline');
var generator = new LevelGenerator()
generator.generateMaze()
generator.generateOs()
generator.printBoard()
console.log("Do you like this board?")

var jsonString = JSON.stringify(generator.board)
fs.writeFile("level.json", jsonString, function (err) {
    if (err) return console.log(err);
    console.log("Level generated")
});