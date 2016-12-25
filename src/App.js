import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';

class Square extends React.Component {
  render() {
    return (
      <button className="square">
        {this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {

  constructor() {
    super();
    // Create the board
    this.state = {
      location_x: 0, // X coordinate of X
      location_y: 0, // Y coordinate of X
      board_width:  15, // width of the board
      board_length: 20, // length of the board
      num_os : 5, // Number of os on the board
      level_openness: 0.5, // How many squares will be maze
      o_array: [], // Array containing location of the os
    };
    this.board = [];
    for (var x = 0; x < this.state.board_width; x++) {
      this.board.push([]);
      for (var y = 0; y < this.state.board_length; y++) {
        this.board[x].push(null);
      }
    }
    this.generateMaze()
    this.state.o_array = this.generateOs(this.state.num_os)
    this.board[0][0] = 'X';
    // Ensures we can access this object in the callback method 
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  renderSquare(contains) {
    return <Square value={contains} />;
  }

  // Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

  generateOs(noOs) {
    var o_array = this.state.o_array.slice()
    for (var i = 0; i < noOs; i++) {
      while (true) {
        var x = this.getRandomInt(0, this.state.board_width);
        var y = this.getRandomInt(0, this.state.board_length);
        // Check if this point is occupied
        if (this.board[x][y] == null) { break; }
      }
      var point = [x, y];
      o_array.push(point);
      this.board[x][y] = 'O'
    }
    return o_array;
  }

  updateOs() {
    var o_array = this.state.o_array.slice()
    console.log(o_array.length)
    for (var i = 0; i < o_array.length; i++) {
      this.moveOTowardsUser(i)
    }
  }

  moveOTowardsUser(oIndex) {
    var o_array = this.state.o_array.slice()
  
    var oX = o_array[oIndex][0];
    var oY = o_array[oIndex][1];
    var upDown = Math.random() > 0.5;
    if (this.state.location_x > oX && upDown) {
      o_array[oIndex][0] += 1;
    } else if (this.state.location_x < oX && upDown) {
      o_array[oIndex][0] -= 1;
    } else if (this.state.location_y > oY ) {
      o_array[oIndex][1] += 1;
    } else {
      o_array[oIndex][1] -= 1;
    }

    var new_oX = o_array[oIndex][0];
    var new_oY = o_array[oIndex][1];

    // Check this new move is legit
    if (this.isSpaceFree(new_oX, new_oY)) {
      this.board[oX][oY] = null;
      this.board[new_oX][new_oY] = 'O';
      this.setState({o_array : o_array })    
    }
  }

  move(x, y) {
    var new_x = this.state.location_x + x;
    var new_y = this.state.location_y + y;
    // Check we're still on the map
    if (!this.isSpaceFree(new_x, new_y)) { return }
    // If the user has dropped a blocker, we need to put it here
    if (this.state.x_blocker_dropped) {
      this.board[this.state.location_x][this.state.location_y] = '-';
      this.setState({"x_blocker_dropped" : false});
    } else {
      this.board[this.state.location_x][this.state.location_y] = null;
    }
    this.board[new_x][new_y] = 'X';
    this.setState({"location_x" : new_x, "location_y" : new_y})

    this.updateOs()

  }

  isSpaceFree(x, y) {
    // Checks if a move is legit
    if (this.board[x][y] != null) { return false }
        // Check we're still on the map
    if (x < 0 || y < 0 || this.state.board_length <= y ||
        this.state.board_width <= x) { return false }

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
    if (Math.random() > this.state.level_openness) {
      return 1;
    } else {
      return -1;
    }
  }

  generateMaze() {
    var visited_cells = new Set();
    var current_point = {x: 0, y: 0};
    var goal = {x: this.state.board_width-1, y: this.state.board_length-1};
    for (var x = 0; x < this.state.board_width; x++) {
      for (var y = 0; y < this.state.board_length; y++) {
        this.board[x][y] = 'I';
      }
    }
    var count = 0;
    var prev_prob = 0.5;
    while (current_point.x != goal.x || current_point.y != goal.y) {
      this.board[current_point.x][current_point.y] = null;

      // Pick an adjacent cell
      var new_point;
      if (Math.random() > prev_prob) {
        // Change y
        var new_y = current_point.y + this.generateNextMazePoint();
        // Check the bounds
        if (new_y < 0 || new_y >= this.state.board_length) {
          continue
        } 
        prev_prob = 0.5;
        new_point = { x: current_point.x, y:new_y };
      } else {
        // Change x
        var new_x = current_point.x + this.generateNextMazePoint();
        if (new_x < 0 || new_x >= this.state.board_width) {
          continue
        } 
        new_point = { x: new_x, y:current_point.y };
        prev_prob = 0.5;
      }

      if (!visited_cells.has(new_point)) {
        current_point = new_point;
        visited_cells.add(current_point);
      }

      count += 1;
    }

    this.board[goal.x][goal.y] = null;

  }
  renderRow(row_y, row_size) {
    var rows = [];
    for (var i=0; i < row_size; i++) {
        rows.push(this.renderSquare(this.board[i][row_y]));
    }
    return (
      <div className="board-row">
      {rows}
      </div>
    );
  }

  render() {
    var rows = [];
    for (var i=0; i < this.state.board_length; i++) {
      rows.push(this.renderRow(i, this.state.board_width));
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
