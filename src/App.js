import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';

class Square extends React.Component {
  render() {
    return (
      <button className="square" key={this.props.id}>
        {this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {

  constructor() {
    super();
    var location_x = 0;
    var location_y = 0;
    this.board_width = 15;
    this.board_length = 20;
    var num_os = 5;
    this.level_openness = 0.48; // How many squares will be maze
    var board = [];

    for (var x = 0; x < this.board_width; x++) {
      board.push([]);
      for (var y = 0; y < this.board_length; y++) {
        board[x].push(null);
      }
    }
    board = this.generateMaze(board)
    board[0][0] = 'X';

    var o_array = this.generateOs(num_os, this.board_width, this.board_length, board)
    console.log(o_array)
        // Create the board
    this.state = {
      location_x: location_x, // X coordinate of X
      location_y: location_y, // Y coordinate of X
      num_os : num_os, // Number of os on the board
      o_array: o_array, // Array containing location of the os
      board: board,
    };

    // Ensures we can access this object in the callback method 
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  renderSquare(contains, id) {
    return <Square value={contains} key={id} />;
  }

  // Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

generateOs(noOs, board_width, board_length, board) {
    var o_array = [];
    console.log(board)
    for (var i = 0; i < noOs; i++) {
      while (true) {
        var x = this.getRandomInt(0, board_width);
        var y = this.getRandomInt(0, board_length);
        // Check if this point is occupied
        if (this.isSpaceFree(x, y, board)) { break; }
      }
      var point = [x, y];
      board[x][y] = 'O';
      o_array.push(point);
    }
    return o_array;
  }

  deepCopyArray(array) {
    var new_arr = [];
    for (var i = 0; i < array.length; i++) {
      var tmp = [];
      for (var j = 0; j < array[i].length; j++) {
        tmp.push(array[i][j]);
      }
      new_arr.push(tmp);
    }
    return new_arr;
  }

  calculateOMoves(oIndex, board, new_o_array) {  
    var oX = new_o_array[oIndex][0];
    var oY = new_o_array[oIndex][1];
    var new_oX = oX;
    var new_oY = oY;
    var upDown = Math.random() > 0.5;
    if (this.state.location_x > oX) {
      new_oX += 1;
    } else if (this.state.location_x < oX) {
      new_oX -= 1;
    } else if (this.state.location_y > oY ) {
      new_oY += 1;
    } else if (this.state.location_y < oY) {
      new_oY -= 1;
    } else {
      console.log(oIndex)
      console.log("Is not moving")
    }

    // Check this new move is legit
    if (this.isSpaceFree(new_oX, new_oY, board)) {
      new_o_array[oIndex][0] = new_oX;
      new_o_array[oIndex][1] = new_oY;
    } 

    return new_o_array
  }

  moveOsOnBoard(board, old_o_array, new_o_array) {
    // Remove the old os
    for (var i = 0; i < old_o_array.length; i++) {
      board[old_o_array[i][0]][old_o_array[i][1]] = null;
    }

    // Create the new os
    for (var i = 0; i < new_o_array.length; i++) {
      board[new_o_array[i][0]][new_o_array[i][1]] = 'O';
    }

    return board;
  }

  countOsOnBoard(board) {
    var count = 0;
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {
        if (board[i][j] === 'O') {
          count++;
        }
      }
    }
    return count;
  }

  move(x, y) {
    var board = this.deepCopyArray(this.state.board);
    var new_x = this.state.location_x + x;
    var new_y = this.state.location_y + y;


    // Check we're still on the map
    if (this.isSpaceFree(new_x, new_y, board)) {
      // Clean up the user's X    
      board[this.state.location_x][this.state.location_y] = null;
      board[new_x][new_y] = 'X';
      // Move the os
      var new_o_array = this.deepCopyArray(this.state.o_array);
      for (var i = 0; i < new_o_array.length; i++) {
        new_o_array = this.calculateOMoves(i, board, new_o_array);
      }
      // Do the o movement
      board = this.moveOsOnBoard(board, this.state.o_array, new_o_array);
      //board = this.updateOs(board)
      this.setState({location_x : new_x, location_y : new_y, board : board, o_array : new_o_array})
    }

  }

  isSpaceFree(x, y, board) {
    // Check we're still on the map
    if (x < 0 || y < 0 || this.board_length <= y ||
        this.board_width <= x) { return false }
    // Checks if a move is legit
    if (board[x][y] != null) { return false }

    return true;
  }

  isSquareInMaze(x, y) {
    for (var i in this.maze) {
      var maze_point = this.maze[i];
      if (maze_point[0] === x && maze_point[1] === y) {
        return true
      }
    }
    return false
  }

  generateNextMazePoint() {
    if (Math.random() > this.level_openness) {
      return 1;
    } else {
      return -1;
    }
  }

  generateMaze(board) {
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
    return board;
  }
  renderRow(row_y, row_size) {
    var rows = [];
    for (var i=0; i < row_size; i++) {
        rows.push(this.renderSquare(this.state.board[i][row_y], i+row_y*row_size));
    }
    return (
      <div className="board-row">
      {rows}
      </div>
    );
  }

  render() {
    var rows = [];
    for (var i=0; i < this.board_length; i++) {
      rows.push(this.renderRow(i, this.board_width));
    }

    return (
     <div id="rows" onKeyUp={this.handleKeyPress}>
        {rows}
      </div>
    );
  }

  handleKeyPress(event) {
    if (event.key == 'w') {
      this.move(0, -1);
    } else if (event.key == 's') {
      this.move(0, 1);
    } else if (event.key == 'd') {
      this.move(1, 0);
    } else if (event.key == 'a') {
      this.move(-1, 0);
    } else if (event.key == 'q') {
      this.handleDropBlocker();
    } else if (event.key == 'z') {
    }
  }
}

class App extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('container')
);

export default App;
