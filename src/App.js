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
      location_x: 0,
      location_y: 0,
      board_width:  10,
      board_length: 10,
    };
    this.board = [];
    for (var x = 0; x < this.state.board_width; x++) {
      this.board.push([]);
      for (var y = 0; y < this.state.board_length; y++) {
        this.board[x].push(null);
      }
    }
    this.generateMaze()
    this.board[0][0] = 'X';
    // Ensures we can access this object in the callback method 
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  renderSquare(contains) {
    return <Square value={contains} />;
  }

  move(x, y) {
    var new_x = this.state.location_x + x;
    var new_y = this.state.location_y + y;
    // Check we're still on the map
    if (new_x < 0 || new_y < 0 || this.state.board_length <= new_y ||
        this.state.board_width <= new_x) { return }

    // Check we're not going into the maze
    if (this.board[new_x][new_y] != null) { return }
    this.board[this.state.location_x][this.state.location_y] = null;
    this.board[new_x][new_y] = 'X';
    this.setState({"location_x" : new_x, "location_y" : new_y})
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

  getRandomInt() {
    if (Math.random() > 0.5) {
      return 1;
    } else {
      return -1;
    }
  }

  generateMaze() {
    var visited_cells = new Set();
    var current_point = {x: 0, y: 0};
    var goal = {x:9, y:9};

    for (var x = 0; x < this.state.board_width; x++) {
      for (var y = 0; y < this.state.board_length; y++) {
        this.board[x][y] = 'I';
      }
    }
    var count = 0;
    while (current_point.x != goal.x || current_point.y != goal.y) {
      this.board[current_point.x][current_point.y] = null;

      // Pick an adjacent cell
      var new_point;
      if (Math.random() > 0.5) {
        // Change y
        var new_y = current_point.y + this.getRandomInt();
        // Check the bounds
        if (new_y < 0 || new_y >= this.state.board_length) {
          continue
        } 
        new_point = { x: current_point.x, y:new_y };
      } else {
        // Change x
        var new_x = current_point.x + this.getRandomInt();
        if (new_x < 0 || new_x >= this.state.board_width) {
          continue
        } 
        new_point = { x: new_x, y:current_point.y };
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
