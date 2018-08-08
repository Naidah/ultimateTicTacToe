const BOARD_SIZE = 3; // width of the board

// TODO
/*
    - network for multi computer playing
*/

var activeButton = "moveButton";

var Game;
var moveBanner;

window.onload = function() {
    Game = new GameLocal();
    moveBanner = document.getElementById("gameText");
    drawGrid();
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
                updateTiles(tile);
                updateBoard();
                updateBox(tileid);
                updateBoxWins();                
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
                allTiles[t].classList.add("tile"+bState[b][t])
            }
            if (b == last[0] && t == last[1]) {
                allTiles[t].classList.add("tileLast"+bState[b][t])
            }
        }
    }
}

function updateBoard() {
    // toggle too the next player
    document.getElementById("board").classList.remove("boardFull");
    if (Game.player() == 1) {
        moveBanner.innerHTML = "Yellow's move";
    } else {
        moveBanner.innerHTML = "Blue's move";
    }
    document.body.classList.remove("move1", "move2");
    document.body.classList.add("move"+Game.player());
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
        if (gameWinner == 2) {
            moveBanner.innerHTML = "Blue Wins!";
        } else {
            moveBanner.innerHTML = "Yellow Wins!";
        }
        for (var l = 0; l < allBoxes.length; l++) {
            allBoxes[l].classList.remove("activeBox")
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








// Game class used for online game
class GameOnline {
    constructor() {
        this.player = 0;
    }

    player() {
        return 0;
    }

    getCurrBox() {
        return -1;
    }

    boardState() {
        // returns a 2d array of each tile in the game
        return [];
    }

    gameOver() {
        return 0;
    }

    lastTile() {
        return 0;
    }

    checkBoxWinState(boxid) {
        return 0;
    }

    checkGameWinState() {
        // check for horizontal cases
        return 0
    }

    makeMove(box, tile) {
        // Makes a move by player on [box][tile].
        // Returns 1 if move successful, 0 if unsuccessful
        return 0;
    }
}

// game class used for local play
class GameLocal {
    constructor() {
        this.currPlayer = 1;
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
    }

    player() {
        return this.currPlayer;
    }

    getCurrBox() {
        return this.currBox;
    }

    boardState() {
        // returns a 2d array of each tile in the game
        var bState = [];
        for (var b = 0; b < this.board.length; b++) {
            bState.push(this.board[b].getTileOwners())
        }
        return bState;
    }

    gameOver() {
        return (this.checkGameWinState() != 0);
    }

    lastTile() {
        return this.last;
    }

    checkBoxWinState(boxid) {
        return this.board[boxid].updateWinState();
    }

    checkGameWinState() {
        var winner = 0;
        // check for horizontal cases
        for (var a = 0; a < 9; a++)
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
        return winner;
    }

    makeMove(box, tile) {
        // Makes a move by player on [box][tile].
        // Returns 1 if move successful, 0 if unsuccessful
        var valid = 0;
        if (box == this.currBox || this.currBox == -1) {
            // move is valid to the selected box
            valid =  this.board[box].makeMove(this.currPlayer, tile);
            if (valid == 1) {
                // toggle the player between 1 and 2
                this.currPlayer = (this.currPlayer%2) + 1;
                this.currBox = tile;

                // update the object containing the last tile pressed
                this.last[0] = box;
                this.last[1] = tile;

                if (this.board[this.currBox].emptyTiles() == 0) { // check if a valid move is possible
                    this.currBox = -1;
                }
            }
        }
        return valid;
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

    makeMove(player, tile) {
        // Makes a move by player on [tile].
        // Returns 1 if move successful, 0 if unsuccessful
        var valid = this.tiles[tile].makeMove(player);
        if (valid == 1) {
            this.tilesRemaining--;
        }
        return valid;
    }
}

class Tile {
    constructor() {
        this.owner = 0;
    }

    getOwner() {
        return this.owner;
    }

    makeMove(player) {
        var valid = 0;
        if (this.owner == 0) {
            this.owner = player;
            valid = 1;
        }
        return valid;
    }
}