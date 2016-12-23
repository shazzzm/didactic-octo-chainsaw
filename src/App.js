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
    this.state = {
      location_x: 0,
      location_y: 0,
      board_width:  4,
      board_length: 4,
      squares: Array(9).fill(null)
    };
    this.handleKeyPress = this.handleKeyPress.bind(this)

  }

  renderSquare(contains_x) {
    return <Square value={contains_x} />;
  }

  move(x, y) {
    console.log("Move involked!")
    var new_x = this.state.location_x + x;
    var new_y = this.state.location_y + y;
    // Perform some bounds checking
    if (new_x >= 0 && new_y >= 0) {
      console.log("Moving x")
      console.log(new_x)
      console.log(new_y)
      this.setState({"location_x" : new_x, "location_y" : new_y})
    }
  }

  renderRow(row_y, row_size) {
    var rows = [];
    console.log("Rendering row")
    console.log(this.state.location_x)
    console.log(this.state.location_y)
    for (var i=0; i < row_size; i++) {
        var mark = null;
        if (row_y == this.state.location_y && i == this.state.location_x) {
          mark = 'X';

          console.log("X should be here")
        }
        rows.push(this.renderSquare(mark));
    }
    return (
      <div className="board-row">
      {rows}
      </div>
    );
  }

  render() {
    var rows = [];
    var count = 0;
    for (var i=0; i < this.state.board_length; i++) {
      rows.push(this.renderRow(i, this.state.board_width));
    }

    return (
     <div id="blah" onKeyUp={this.handleKeyPress}>
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

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default App;
