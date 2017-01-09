import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import SimpleObject from './SimpleObject'
class Square extends React.Component {
  render() {
    return (
      <button className="square" key={this.props.id}>
        {this.props.value}
      </button>
    );
  }
}

class ReplayButton extends React.Component {
  render () {
    return <button className="replay_button" onClick={() => location.reload()} >
    Replay!
    </button>
  }
}

class NextLevelButton extends React.Component {
  render () {
    return <button className="next_level_button" onClick={() => window.location = "http://localhost:3000/?level="+this.props.level} >
    Next Level
    </button>
  }
}


class Board extends React.Component {

  constructor(props) {
    super(props);
    
    // This contains a lookup table for level values
    var level_vals = [
       [5, 0.48], [6, 0.48], [6, 0.49], [7, 0.49]
    ];

    if (props.level == null || props.level=="undefined") {
      this.level = 1;
    } else {
      this.level = props.level;

      if (this.level < 1) {
        this.level = 1;
      } else if (this.level >= level_vals.length) {
        this.level = level_vals.length - 1;
      }
    }

    var location_x = 0;
    var location_y = 0;
    this.board_width = 15;
    this.board_length = 20;
    this.goal = [this.board_width-1, this.board_length-1]; // Place we want to reach

    // Let's figure out the difficulty
    this.num_os = level_vals[this.level-1][0];
    this.level_openness = level_vals[this.level][1]; // How many squares will be maze

    var board = this.generateMaze()
    this.maze = board;
    var object_array = this.generateOs(this.num_os, this.board_width, this.board_length, board)
    // Create the board
    this.state = {
      location_x: location_x, // X coordinate of X
      location_y: location_y, // Y coordinate of X
      object_array: object_array, // Array containing location of the os
      won: false, // Whether the user has won
      lost: false, // If the user has lost
    };

    // Ensures we can access this object in the callback method 
    this.handleKeyPress = this.handleKeyPress.bind(this)
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

    for (var i = 0; i < noOs; i++) {
      while (true) {
        var x = this.getRandomInt(0, board_width);
        var y = this.getRandomInt(0, board_length);
        // Check if this point is occupied
        if (this.isSpaceFree(x, y, board)) { break; }
      }
      var object = new SimpleObject(x, y)
      o_array.push(object);
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

  hasUserLost(x, y, board) {
    // Check if the user can move - if they can't they've lost
    return !this.isSpaceFree(x+1, y, board) &&
           !this.isSpaceFree(x-1, y, board) &&
           !this.isSpaceFree(x, y+1, board) &&
           !this.isSpaceFree(x, y-1, board);
  }

  move(x, y) {
    var board = this.deepCopyArray(this.state.board);
    var new_x = this.state.location_x + x;
    var new_y = this.state.location_y + y;
    var won = this.state.won;
    var lost = this.state.lost;

    if (new_x == this.goal[0] && new_y == this.goal[1]) {
      alert('You won!')
      won = true;
    } else if (!won && !lost && this.hasUserLost(this.state.location_x, this.state.location_y, board)) {
      alert('You lost! :(')
      lost = true;
    }

    

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
      this.setState({location_x : new_x, location_y : new_y, board : board, o_array : new_o_array, won: won, lost:lost})
    } else {
      this.setState({won: won, lost:lost})
    }

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

  generateNextMazePoint() {
    if (Math.random() > this.level_openness) {
      return 1;
    } else {
      return -1;
    }
  }

  generateMaze() {
    var visited_cells = new Set();
    var current_point = {x: 0, y: 0};
    var goal = {x: this.board_width-1, y: this.board_length-1};
    var board = [];

    for (var x = 0; x < this.board_width; x++) {
      board.push([]);
      for (var y = 0; y < this.board_length; y++) {
        board[x].push(null);
      }
    }

    for (x = 0; x < this.board_width; x++) {
      for (y = 0; y < this.board_length; y++) {
        board[x][y] = 'I';
      }
    }

    while (current_point.x != goal.x || current_point.y != goal.y) {
      board[current_point.x][current_point.y] = null;

      // Pick an adjacent cell
      var new_point;
      if (Math.random() > 0.5) {
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

    board[goal.x][goal.y] = <img src="flag_24.png" />;
    return board;
  }

  /**
   * Generates a board from the maze and object arary
   */
  generateBoard(object_array) {
    var board = this.deepCopyArray(this.maze)
    for (var i = 0; i < object_array.length; i++) {
      board[object_array[i].x][object_array[i].y] = object_array[i].logo;
    }
    board[this.state.location_x][this.state.location_y] = 'X';
    console.log(board)
    return board;
  }

  renderSquare(contains, id) {
    return <Square value={contains} key={id} />;
  }

  renderRow(board, y) {
    var rows = [];
    for (var i=0; i < board.length; i++) {
        rows.push(this.renderSquare(board[i][y], i+y*board.length));
    }
    return (
      <div className="board-row">
      {rows}
      </div>
    );
  }

  render() {
    var rows = [];
    console.log(this.state.object_array)
    var board = this.generateBoard(this.state.object_array);
    for (var i=0; i < this.board_length; i++) {
      rows.push(this.renderRow(board, i));
    }
    var button = null;
    console.log(this.state.lost)
    if (this.state.lost) {
      button = <ReplayButton />;
    } else if (this.state.won) {
      var nextLevel = Number(this.level) + 1
      button = <NextLevelButton level={nextLevel}/>
    }
    return (
      <div id="board">
        <div id="buttons">
          {button}
        </div>
        <div id="rows" onKeyUp={this.handleKeyPress}>
          {rows}
        </div>
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
getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}
  render() {
    var level = this.getURLParameter("level")
    return (
      <div className="game">
        <div className="game-board">
          <Board level={level} />
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
