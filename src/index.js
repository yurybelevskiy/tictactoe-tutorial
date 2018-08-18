import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
      <button
        className={"square" + (props.isHighlighted ? " square-winner" : "")}
        onClick={props.handleClick}
      >
        {props.value}
      </button>
    );
  }
  
  class Board extends React.Component {

    renderSquare(i) {
      return (
          <Square 
            value={this.props.squares[i]}
            isHighlighted={this.props.winnerSquares.indexOf(i) > -1}
            handleClick={() => this.props.handleClick(i)} 
          />
      );
    }

    createBoard = (sideLength) => {
      let board = [];

      for(let i=0; i < sideLength; i++) {
        let rows = [];
        for(let j=0; j < sideLength; j++) {
          rows.push(this.renderSquare(i*sideLength + j));
        }
        board.push(<div className="board-row">{rows}</div>);
      }

      return board;
    };
  
    render() {
      
      return (
        <div>
          {this.createBoard(3)}
        </div>
      );
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        movesHistory: [{
          squares: Array(9).fill(null),
        }],
        xIsNext: true,
        stepNumber: 0,
        isSortReversed: false
      };
    }

    handleClick(i) {
      const history = this.state.movesHistory.slice(0, this.state.stepNumber + 1);
      const lastMove = history[history.length-1];
      const squares = lastMove.squares.slice();

      // return early if there is already a winner or square is filled
      if(squares[i] || calculateWinner(squares)) {
        return;
      }

      squares[i]=this.state.xIsNext ? 'X' : 'O';
      this.setState({
        movesHistory: history.concat([{
          squares: squares,  
        }]),
        xIsNext: !this.state.xIsNext,
        stepNumber: history.length
      });
    }

    jumpTo(stepNum) {
      this.setState({
        xIsNext: (stepNum % 2) === 0,
        stepNumber: stepNum
      });
    }

    sortMoves() {
      this.setState({
        isSortReversed: !this.state.isSortReversed
      });
    }

    render() {
      const history = this.state.movesHistory;
      const currentMove = history[this.state.stepNumber];
      const winnerSquares = calculateWinner(currentMove.squares);

      let isDraw=false;
      if(!winnerSquares) {
        isDraw = calculateIfDraw(currentMove.squares);
      }

      var prevMove = Array(9).fill(null);
      var moves = history.map((move, moveNum) => {
        var desc = moveNum ?
          'Go to move #' + moveNum :
          'Go to game start';

        var changedIdx = -1;
        for(let i = 0; i < move.squares.length; i++) {
          if(prevMove[i] != move.squares[i])
          {
            changedIdx = i;
          }
        }

        // determine column and row where move occurred 
        var col = 0;
        if (changedIdx % 3 === 0) {
          col = 1;
        } else if (changedIdx % 3 === 1) {
          col = 2;
        } else if (changedIdx % 3 === 2) {
          col = 3;
        }
        var row = 0;
        if(changedIdx >=0 && changedIdx <= 2) {
          row = 1;
        } else if(changedIdx >= 3 && changedIdx <= 5) {
          row = 2;
        } else if(changedIdx >= 6 && changedIdx <= 8) {
          row = 3;
        }

        desc += " (Column: " + col + ", Row: " + row + ")";

        prevMove = move.squares;

        // boldify last move's text
        if(moveNum === history.length-1) {
          return (
            <li key={moveNum}>
              <button onClick={() => this.jumpTo(moveNum)}><b>{desc}</b></button>
            </li>
          );
        } else {
          return (
            <li key={moveNum}>
              <button onClick={() => this.jumpTo(moveNum)}>{desc}</button>
            </li>
          );
        }
      })

      let sortDesc;
      if(this.state.isSortReversed) {
        sortDesc = "Sort: Descending";
        moves = moves.reverse();
      } else {
        sortDesc = "Sort: Ascending";
      }

      let status;
      if(winnerSquares) {
        const winner = currentMove.squares[winnerSquares[0]];
        status = 'Winner: ' + winner;
      } else {
        status = isDraw ? 'Draw' : 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }

      return (
        <div className="game">
          <div className="game-board">
            <Board 
              squares={currentMove.squares}
              winnerSquares={winnerSquares ? winnerSquares : []}
              handleClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <p>{sortDesc}</p>
            <button onClick={() => this.sortMoves()}>Toggle Sort</button>
            <ol>{moves}</ol>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );

  // =========== HELPER FUNCTIONS ===========

  function calculateWinner(array) {
    const lines = [
      [0,1,2],
      [3,4,5],
      [6,7,8],
      [0,4,8],
      [2,4,6],
      [0,3,6],
      [1,4,7],
      [2,5,8],
    ];

    for(let i=0; i < lines.length; i++) {
      const [a,b,c] = lines[i];
      if(array[a] && array[a]===array[b] && array[a]===array[c]) {
        return [a,b,c];
      }
    }
    return null;
  }

  function calculateIfDraw(array) {
    for(let i=0; i < array.length; i++) {
      if(!array[i]) {
        return false;
      }
    }
    return true;
  }
  