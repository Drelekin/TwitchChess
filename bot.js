// Define configuration options
const opts = {
  /*identity: {
    username: <BOT_USERNAME>,
    password: <OAUTH_TOKEN>
  },*/
  channels: [
    'indrek'
  ]
};

const CHAT_SIDE = 'b';

// Create a client with our options
const client = new tmi.client(opts);
let moveHistory = {};

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Update stats on sidebar
function updateSidebar() {
  let html = '';

  for (const san in moveHistory) {
    html += `${san}: ${moveHistory[san]}<br>`;
  }

  $('#stats').html(html);
}

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  if (game.turn() !== CHAT_SIDE) {
    return;
  }

  const move = game.move(msg, { sloppy: true });
  
  if (move) {
    if (move.san in moveHistory) {
      moveHistory[move.san] += 1;
    } else {
      moveHistory[move.san] = 1;
    }

    game.undo();

    updateSidebar();
  }
}

function indexOfMax(arr) {
  if (arr.length === 0) {
      return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
          maxIndex = i;
          max = arr[i];
      }
  }

  return maxIndex;
}

function updateMove() {
  const keys = Object.keys(moveHistory);
  const values = Object.values(moveHistory);

  if (!keys.length) {
    return;
  }
  
  const index = indexOfMax(values);
  const san = keys[index];

  game.move(san);
  board.position(game.fen());

  moveHistory = {};
  updateSidebar();
}

setInterval(updateMove, 20000);

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var board = null
var game = new Chess()
var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'

function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
}

function greySquare (square) {
  var $square = $('#myBoard .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function onDragStart (source, piece) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // or if it's not that side's turn
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  removeGreySquares()

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'
}

function onMouseoverSquare (square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true
  })

  // exit if there are no moves available for this square
  if (moves.length === 0) return

  // highlight the square they moused over
  greySquare(square)

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to)
  }
}

function onMouseoutSquare (square, piece) {
  removeGreySquares()
}

function onSnapEnd () {
  board.position(game.fen())
}

var config = {
  draggable: true,
  position: 'start',
  position: 'start',
  pieceTheme: 'libs/chessboardjs-1.0.0/img/chesspieces/wikipedia/{piece}.png',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
}

board = Chessboard('myBoard', config)

// test
board.position(game.fen());
