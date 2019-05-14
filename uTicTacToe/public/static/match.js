var activeButton = "moveButton";

var Game;
var moveBanner;
var serverCheckInterval;

function makeRequest(url, method, data=""){
    if (method == "GET") {
        return fetch(url, {
            method: method
        })
        .then(function(response){
            return response.json();
        })
    } else {
        return fetch(url, {
            method: method,
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        })
        .then(function(response){
            return response.json();
        })
    }
}

window.onload = function() {
    if (sessionStorage.gameType == "online") {
        console.log(sessionStorage.thisPlayer)
        Game = new GameOnline(sessionStorage.gameId,
         sessionStorage.thisPlayer);
    } else {
        Game = new GameLocal();
    }
    checkServer();
    moveBanner = document.getElementById("gameText");
    drawGrid();

    serverCheckInterval = setInterval(checkServer, 1000);
}

window.onbeforeunload = function() {
    if (Game.isOnline()) {
        makeRequest("/game/"+Game.getGameId(), "DELETE");
    }
}

function checkServer() {
    if (Game.canRequest()) {
        Game.updateBoard().then(updateBoardDisplay);
    }
}

function drawGrid() {

    // create the html for the board
    board = document.getElementById("board")
    for (var b = 0; b < 9; b++) { // create each sub-box element
        var newBox = document.createElement("div");

        newBox.classList.add("nestedBoard");
        newBox.classList.add("activeBox");
        newBox.dataset.boxid = b;
        for (var t = 0; t < 9; t++) {
            var newTile = document.createElement("div");

            newTile.classList.add("tile");
            newTile.dataset.tileid = t;

            newTile.addEventListener("click", function(){
                selectTile(this);
            });

            // add a border to the tile
            newTile.style.border = "solid 1px"
            // remove the border from one side if on the edge of the square
            if (t%3 == 0) { // left side
                newTile.style.borderLeft = "none";
            }
            else if (t%3 == 2) { // right side
                newTile.style.borderRight = "none";
            }
            if (t<3) { // top
                newTile.style.borderTop = "none";
            }
            else if (t>5) { // bottom
                newTile.style.borderBottom = "none";
            }


            newBox.appendChild(newTile);
        }
        board.appendChild(newBox);
    }
}

function selectTile(tile) {
    if (!Game.gameOver()) {
        tileid = tile.dataset.tileid;
        boxid = tile.parentElement.dataset.boxid;
        if (activeButton == "moveButton") {
            if (Game.makeMove(boxid, tileid) == 1) {
                updateBoardDisplay(tile, tileid)               
            }
        } else if (!(tile.classList.contains("tile1") || tile.classList.contains("tile2"))) {
            if (activeButton == "focusButton") {
                tile.classList.remove("tileAvoid");
                tile.classList.toggle("tileFocus");
            } else {
                tile.classList.remove("tileFocus");
                tile.classList.toggle("tileAvoid");
            }
        }
        updateGameWin();
    }
}

function updateBoardDisplay(tile, tileid) {
    updateTiles(tile);
    updateBoard();
    updateBox(tileid);
    updateBoxWins();
}

function updateTiles(tile) {
    // retrieve needed info from the game object
    var last = Game.lastTile();
    var allBoxes = document.getElementsByClassName("nestedBoard")
    var bState = Game.boardState();

    // go through each tile and set it to the value retrieved from the game class
    for (var b = 0; b < allBoxes.length; b++) {
        var allTiles = allBoxes[b].children;
        for (var t = 0; t < allTiles.length; t++) {    
            // reset classes
            allTiles[t].classList.remove("tile1","tile2")
            allTiles[t].classList.remove("tileLast1", "tileLast2")

            // Add the needed classes
            if (bState[b][t] != 0) {
                allTiles[t].classList.remove("tileAvoid", "tileRemove");
                allTiles[t].classList.add("tile"+bState[b][t]);
            }
            if (b == last[0] && t == last[1]) {
                allTiles[t].classList.add("tileLast"+bState[b][t]);
            }
        }
    }
}

function updateBoard() {
    // toggle too the next player
    document.getElementById("board").classList.remove("boardFull");
    moveBanner.innerHTML = Game.getBannerString();
    document.body.classList.remove("move1", "move2");
    if (Game.gameOver()) {
        document.body.classList.add("move"+Game.checkGameWinState())
    } else {
        document.body.classList.add("move"+Game.player());
    }
}

function updateBox(tileid) {
    // update the box that can be played next
    var currBox = Game.getCurrBox();
    var allBoxes = document.getElementsByClassName("nestedBoard");
    for (let i = 0; i < allBoxes.length; i++) {
        allBoxes[i].classList.remove("activeBox");
    }

    // update the next box marked for moving in
    if (currBox >= 0) { // there is a valid place in the next box
        allBoxes[currBox].classList.add("activeBox");
    } else {
        document.getElementById("board").classList.add("boardFull");
        for (let j = 0; j < allBoxes.length; j++) {
            allBoxes[j].classList.add("activeBox");
        }
    }
}

function updateBoxWins() {
    var allBoxes = document.getElementsByClassName("nestedBoard");
    for (let k = 0; k < allBoxes.length; k++) {
        var boxWin = Game.checkBoxWinState(k);
        if (boxWin != 0) {
            var allTiles = allBoxes[k].children;
            for (var child = 0; child < allTiles.length; child++) {
                allTiles[child].classList.add("tileWin" + boxWin);
            }
        }
    }
}

function updateGameWin() {
    var allBoxes = document.getElementsByClassName("nestedBoard");
    var gameWinner = Game.checkGameWinState();
    if (gameWinner != 0) {
        moveBanner.innerHTML = Game.getBannerString();
        for (var l = 0; l < allBoxes.length; l++) {
            allBoxes[l].classList.remove("activeBox")
            document.getElementById("board").classList.remove("boardFull");
        }
    }
}

function selectMode(button) {
    document.getElementById("moveButton").classList.remove("buttonActive");
    document.getElementById("focusButton").classList.remove("buttonActive");
    document.getElementById("avoidButton").classList.remove("buttonActive");

    document.getElementById(button).classList.add("buttonActive");
    activeButton = button;
}

function exitGame() {
    //document.getElementsByTagName('link')[0].disabled = true;
    window.location.href = "/index.html"
}








// Game class used for online game
class GameOnline {
    constructor(id, player) {
        this.gameId = id;
        this.currPlayer = -1;
        this.myPlayer = player;
        this.board = new Board
    }

    getBannerString() {
        var s;
        if (this.gameOver()) {
            if (this.checkGameWinState() == this.myPlayer) {
                s = "You Win!";
            } else if (this.checkGameWinState() == -1) {
                s = "Draw"
            } else {
                s = "You Loose";
            }
        } else {
            if (this.currPlayer == this.myPlayer) {
                s = "Your Turn";
            } else {
                s = "Opponents Turn";
            }
        }
        return s
    }

    getGameId() {
        return this.gameId;
    }

    isOnline() {
        return 1;
    }

    canRequest() {
        return (this.currPlayer != this.myPlayer);
    }

    player() {
        return this.currPlayer;
    }

    updatePlayer(player) {
        this.currPlayer = player;
    }

    getCurrBox() {
        return this.board.getCurrBox();
    }

    updateBoard() {
        return makeRequest("/game/"+this.gameId, "GET")
        .then(j => this.readBoardState(j))
        // .catch(function(e) {
        //     exitGame();
        // })
    }

    readBoardState(state) {
        this.currPlayer = state.currPlayer
        this.board.updateBoard(state.board)
    }

    boardState() {
        return this.board.boardState()
    }

    gameOver() {
        return (this.checkGameWinState() != 0);
    }

    lastTile() {
        return this.board.lastTile();
    }

    checkBoxWinState(boxid) {
        return this.board.boxWin(boxid);
    }

    checkGameWinState() {
        return this.board.gameWin();
    }

    makeMove(box, tile) {
        var v;
        if (this.myPlayer != this.currPlayer) {
            v = 0
        } else {
            v = this.board.validMove(box, tile)
        }
        if (v == 1) {
            this.board.makeMove(box, tile, this.currPlayer);
            this.tilesRemaining--;
            this.currPlayer = (this.currPlayer%2) + 1;
            var data = {
                player: this.myPlayer,
                board: this.board.getStringState()
            };
            makeRequest("/game/"+this.gameId, "POST", data)
            // .catch(function(e) {
            //     exitGame();
            // });
        }
        return v;
    }
}

// game class used for local play
class GameLocal {
    constructor() {
        this.currPlayer = 1;
        this.board = new Board
    }

    getBannerString() {
        var s;
        if (this.gameOver()) {
            if (this.checkGameWinState() == 2) {
                s = "Yellow Wins!";
            } else if (this.checkGameWinState() == 1) {
                s = "Blue Wins!";
            } else {
                s = "Draw!";
            }
        } else {
            if (this.currPlayer == 1) {
                s = "Yellow's Turn";
            } else {
                s = "Blue's Turn";
            }
        }
        return s
    }

    isOnline() {
        return 0;
    }

    canRequest() {
        return 0;
    }

    player() {
        return this.currPlayer;
    }

    getCurrBox() {
        return this.board.getCurrBox();
    }

    boardState() {
        return this.board.boardState()
    }

    gameOver() {
        return (this.checkGameWinState() != 0);
    }

    lastTile() {
        return this.board.lastTile();
    }

    checkBoxWinState(boxid) {
        return this.board.boxWin(boxid);
    }

    checkGameWinState() {
        return this.board.gameWin();
    }

    makeMove(box, tile) {
        var v = this.board.makeMove(box, tile, this.currPlayer)
        if (v == 1) {this.currPlayer = (this.currPlayer%2) + 1}
        return v;
    }
}

class Board {
    constructor() {
        // Board is an array of the sub boxes, structured so indexes appear as:
        /*
        0  1  2
        3  4  5
        6  7  8
        */
        this.board = [];
        for (var i = 0; i < 9; i++) {
            this.board.push(new Box);
        }
        this.currBox = -1;
        this.last = [-1, -1];
        this.tilesRemaining = 81
    }

    updateBoard(newBoard) {
        this.currBox = -1
        for (var b = 0; b < 9; b++) {
            for (var t = 0; t < 9; t++) {
                var c = parseInt(newBoard[b*9 + t])
                if (c > 2) { // see if the new last tile is found
                    this.last[0] = b;
                    this.last[1] = t;
                    c -= 2;
                    this.currBox = t;
                }
                this.tilesRemaining += this.board[b].setTile(t, c);
            }
        }
        if (this.currBox != -1) {
            if (this.board[this.currBox].emptyTiles() == 0) {
                this.currBox = -1;
            }
        }
    }

    boardState() {
        // returns a 2d array of each tile in the game
        var bState = [];
        for (var b = 0; b < this.board.length; b++) {
            bState.push(this.board[b].getTileOwners())
        }
        return bState;
    }

    getStringState() {
        var bState = "";
        for (var b = 0; b < this.board.length; b++) {
            var cBox = this.board[b].getTileOwners()
            for (var t = 0; t < cBox.length; t++) {
                if (b == this.last[0] && t == this.last[1]) {
                    bState += (cBox[t] + 2).toString()
                } else {
                    bState += cBox[t].toString()
                }
            }
        }
        return bState;
    }

    getCurrBox() {
        return this.currBox
    }

    lastTile() {
        return this.last;
    }

    validMove(box, tile) {
        // Makes a move by player on [box][tile].
        // Returns 1 if move successful, 0 if unsuccessful
        var valid = 0;
        if (box == this.currBox || this.currBox == -1) {
            // move is valid to the selected box
            valid = this.board[box].validMove(tile);
        }
        return valid;
    }

    makeMove(box, tile, player) {
        // Makes a move by player on [box][tile].
        // Returns 1 if move successful, 0 if unsuccessful
        var valid = this.validMove(box, tile);
        if (valid == 1) {
            // move is valid to the selected box
            this.board[box].makeMove(player, tile);
            this.tilesRemaining--;

            // toggle the player between 1 and 2
            this.currBox = tile;

            // update the object containing the last tile pressed
            this.last[0] = box;
            this.last[1] = tile;

            if (this.board[this.currBox].emptyTiles() == 0) {
                // check if a valid move is possible to the new tile
                this.currBox = -1;
            }
        }
        return valid;
    }

    boxWin(boxid) {
        return this.board[boxid].updateWinState();
    }

    gameWin() {
        var winner = 0;
        for (let b = 0; b < 9; b++) {
            this.board[b].updateWinState();
        }

        // check for horizontal cases
        for (let col = 0; col < 9 && winner == 0; col += 3) {
            if (this.board[col].getOwner()  == this.board[col+1].getOwner() &&
             this.board[col].getOwner() == this.board[col+2].getOwner() &&
             this.board[col].getOwner() != 0
            ){
                winner = this.board[col].getOwner()
            }
        }

        // check vertical cases
        for (let row = 0; row < 3 && winner == 0; row++) {
            if (this.board[row].getOwner()  == this.board[row+3].getOwner() &&
             this.board[row].getOwner() == this.board[row+6].getOwner() &&
             this.board[row].getOwner() != 0
            ){
                winner = this.board[row].getOwner()
            }
        }


        // check 0-8 diagonal
        if (this.board[0].getOwner()  == this.board[4].getOwner() &&
         this.board[0].getOwner() == this.board[8].getOwner() &&
         this.board[0].getOwner() != 0
        ){
            winner = this.board[0].getOwner()
        }


        // check 2-6 diagonal
        if (this.board[2].getOwner()  == this.board[4].getOwner() &&
         this.board[2].getOwner() == this.board[6].getOwner() &&
         this.board[2].getOwner() != 0
        ){
            winner = this.board[2].getOwner()
        }

        if (winner == 0 && this.tilesRemaining == 0) {
            winner = -1;
        }
        return winner;
    }
}

// Child classes used to get local game working
class Box {
    constructor() {
        // tiles is an array of each tile in the sub-box, structured by index as below:
        /*
        0 1 2
        3 4 5
        6 7 8
        */
        this.tiles = [];
        for (var i = 0; i < 9; i++) {
            this.tiles.push(new Tile);
        }
        this.tilesRemaining = 9; // how many empty tiles remain
        this.owner = 0; // player who won the box
    }

    emptyTiles() {
        return this.tilesRemaining;
    }

    getOwner() {
        return this.owner;
    }

    getTileOwners() {
        var t = []
        for (var i = 0; i < this.tiles.length; i++) {
            t.push(this.tiles[i].getOwner())
        }
        return t;
    }

    setTile(tile, value) {
        var change = 0;
        if (this.tiles[tile].getOwner() == 0 && value != 0) {
            this.tilesRemaining += 1;
            change = 1;
        } else if (this.tiles[tile].getOwner() != 0 && value == 0) {
            this.tilesRemaining -= 1;
            change = -1;
        }
        this.tiles[tile].setValue(value)
        return change;
    }

    updateWinState() {
        if (this.owner == 0) {
            // check for horizontal cases
            for (let col = 0; col < 9 && this.owner == 0; col += 3) {
                if (this.tiles[col].getOwner()  == this.tiles[col+1].getOwner() &&
                 this.tiles[col].getOwner() == this.tiles[col+2].getOwner() &&
                 this.tiles[col].getOwner() != 0
                ){
                    this.owner = this.tiles[col].getOwner()
                }
            }

            // check vertical cases
            for (let row = 0; row < 3 && this.owner == 0; row++) {
                if (this.tiles[row].getOwner()  == this.tiles[row+3].getOwner() &&
                 this.tiles[row].getOwner() == this.tiles[row+6].getOwner() &&
                 this.tiles[row].getOwner() != 0
                ){
                    this.owner = this.tiles[row].getOwner()
                }
            }


            // check 0-8 diagonal
            if (this.tiles[0].getOwner()  == this.tiles[4].getOwner() &&
             this.tiles[0].getOwner() == this.tiles[8].getOwner() &&
             this.tiles[0].getOwner() != 0
            ){
                this.owner = this.tiles[0].getOwner()
            }


            // check 2-6 diagonal
            if (this.tiles[2].getOwner()  == this.tiles[4].getOwner() &&
             this.tiles[2].getOwner() == this.tiles[6].getOwner() &&
             this.tiles[2].getOwner() != 0
            ){
                this.owner = this.tiles[2].getOwner()
            }
        }
        return this.owner;
    }

    validMove(tile) {
        // check if a move to [box][tile] is valid
        return this.tiles[tile].validMove();
    }

    makeMove(player, tile) {
        // Makes a move by player on [tile].
        this.tiles[tile].makeMove(player);
        this.tilesRemaining--;
    }
}

class Tile {
    constructor() {
        this.owner = 0;
    }

    getOwner() {
        return this.owner;
    }

    setValue(value) {
        this.owner = value;
    }

    validMove() {
        return (this.owner == 0);
    }

    makeMove(player) {
        this.owner = player;
    }
}