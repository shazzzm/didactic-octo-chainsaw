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

var generator = new LevelGenerator()
generator.generateMaze()
generator.printBoard()