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
    var num_levels = 10;
    if (props.level == null || props.level=="undefined") {
      this.level = 1;
    } else {
      this.level = props.level;

      if (this.level < 1) {
        this.level = 1;
      } else if (this.level > num_levels) {
        this.level = num_levels;
      }
    }

    var level = require('./levels/' +this.level+".js")

    var location_x = 0;
    var location_y = 0;
    this.board_width = 15;
    this.board_length = 20;
    this.goal = [this.board_width-1, this.board_length-1]; // Place we want to reach

    var board = level.level;
    board[this.goal[0]][this.goal[1]] = <img src="flag_24.png" />
    this.maze = board;
    var object_array = this.generateOs(board)
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

/**
 * Finds the os on the board - bit of a hack atm
 */
generateOs(board) {
    var object_array = [];

    for (var x = 0; x < board.length; x++) {
      for (var y = 0; y < board[x].length; y++) {
        if (board[x][y] == 'O') {
          board[x][y] = null;
          var o = new SimpleObject(x, y, this.board_width, this.board_length)
          object_array.push(o);
        }
      }
    }

    return object_array;
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
    return !this.isSpaceFree(x+1, y, board, this.state.object_array) &&
           !this.isSpaceFree(x-1, y, board, this.state.object_array) &&
           !this.isSpaceFree(x, y+1, board, this.state.object_array) &&
           !this.isSpaceFree(x, y-1, board, this.state.object_array);
  }

  move(x, y) {
    var new_x = this.state.location_x + x;
    var new_y = this.state.location_y + y;
    var won = this.state.won;
    var lost = this.state.lost;

    if (new_x == this.goal[0] && new_y == this.goal[1]) {
      alert('You won!')
      won = true;
    } else if (!won && !lost && this.hasUserLost(this.state.location_x, this.state.location_y, this.maze)) {
      alert('You lost! :(')
      lost = true;
    }

    // Check we're still on the map
    if (this.isSpaceFree(new_x, new_y, this.maze, this.state.object_array)) {
      // Update the objects
      for (var i = 0; i < this.state.object_array.length; i++) {
        this.state.object_array[i].update(this.state.location_x, this.state.location_y, new_x, new_y, this.state.object_array, this.maze);
      }
      this.setState({location_x : new_x, location_y : new_y, object_array : this.state.object_array, won: won, lost:lost})
    } else {
      this.setState({won: won, lost:lost})
    }

  }

  isSpaceFree(x, y, board, object_array) {
    // Check we're still on the map
    if (x < 0 || y < 0 || this.board_length <= y ||
        this.board_width <= x) { return false }

    // Check we're not moving to the goal, as there will be a flag in the way
    var positionIsNotGoal = !(x == this.goal && y == this.goal);

    // Checks if a move is legit
    if (positionIsNotGoal && board[x][y] != null) { return false }

    for (var i in object_array) {
      if (object_array[i].x == x && object_array[i].y == y) {
        return false;
      } 
    }

    return true;
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
    var board = this.generateBoard(this.state.object_array);
    for (var i=0; i < this.board_length; i++) {
      rows.push(this.renderRow(board, i));
    }
    var button = null;
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
