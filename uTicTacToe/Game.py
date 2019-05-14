class Board():
    def __init__(self):
        self.board = [Box(j) for j in range(9)]
        self.winner = 0
        self.activeBox = -1
        self.player = 1
        self.free = 81

    def showBoard(self):
        print("-------------------------------------------------")
        for i in [0, 3, 6]:
            for j in [0, 3, 6]:
                for k in [0, 1, 2]:
                    b = self.board[i+k]
                    print("{} {} {}  ".format(b.cells[j].value, b.cells[j+1].value, b.cells[j+2].value), end='')
                print("\n", end='')
            print("\n", end='')

    def duplicate(self):
        newBoard = Board()
        for i in range(9):
            newBoard.board[i] = self.board[i].duplicate()
        newBoard.activeBox = self.activeBox
        newBoard.winner = self.winner
        newBoard.player = self.player
        newBoard.free =self.free
        return newBoard
        
    def getWinner(self):
        if self.winner != 0:
            return
        w = 0
        # columns
        for c in range(3):
            if self.board[c].winner == self.board[c+3].winner and self.board[c].winner == self.board[c+6].winner:
                w = max(w, self.board[c].winner)

        # rows
        for c in [0, 3, 6]:
            if self.board[c].winner == self.board[c+1].winner and self.board[c].winner == self.board[c+2].winner:
                w = max(w, self.board[c].winner)

        #diagonals
        if self.board[0].winner == self.board[4].winner and self.board[0].winner == self.board[8].winner:
            w = max(w, self.board[0].winner)
        if self.board[2].winner == self.board[4].winner and self.board[2].winner == self.board[6].winner:
            w = max(w, self.board[2].winner)
        self.winner = w

    def getMoves(self):
        moves = []
        if self.activeBox == -1:
            for box in self.board:
                box.getMoves(moves)

        else:
            self.board[self.activeBox].getMoves(moves)
        return moves

    def makeMove(self, box, tile):
        assert(box == self.activeBox or self.activeBox == -1)
        winner = self.board[box].makeMove(tile, self.player)
        self.getWinner()
        self.player = self.player%2 + 1
        if self.board[tile].slots == 0:
            self.activeBox = -1
        else:
            self.activeBox = tile
        self.free -= 1
        if self.free == 0 and self.winner == 0:
            self.winner = -1
            return -1
        return self.winner

    def updateBoard(self, newBoard):
        self.activeBox = -1
        for b in range(9):
            for t in range(9):
                c = int(newBoard[b*9 + t])
                if c > 2: # see if the new last tile is found
                    c -= 2;
                    self.activeBox = t;
                self.free += self.board[b].setTile(t, c)
        if self.activeBox != -1:
            if self.board[self.activeBox].slots == 0:
                self.activeBox = -1
        for box in self.board:
            box.getWinner()
        self.getWinner()

    def getBoard(self):
        o = ''
        for box in self.board:
            o += box.getBox()
        return o

class Box():
    def __init__(self, id):
        self.cells = [Cell() for i in range(9)]
        self.winner = 0
        self.id = id
        self.slots = 9

    def duplicate(self):
        newBox = Box(self.id)

        for i in range(9):
            newBox.cells[i].value = self.cells[i].value
        newBox.winner = self.winner
        newBox.id = self.id
        newBox.slots = self.slots
        return newBox

    def getWinner(self):
        if self.winner:
            return 0 # no possible change, return
        w = 0
        # columns
        for c in range(3):
            if self.cells[c].value == self.cells[c+3].value and self.cells[c].value == self.cells[c+6].value:
                w = max(w, self.cells[c].value)

        # rows
        for c in [0, 3, 6]:
            if self.cells[c].value == self.cells[c+1].value and self.cells[c].value == self.cells[c+2].value:
                w = max(w, self.cells[c].value)

        #diagonals
        if self.cells[0].value == self.cells[4].value and self.cells[0].value == self.cells[8].value:
                w = max(w, self.cells[0].value)
        if self.cells[2].value == self.cells[4].value and self.cells[2].value == self.cells[6].value:
                w = max(w, self.cells[2].value)

        self.winner = w
        return self.winner == 0 # return if the square winner was found

    def makeMove(self, tile, player):
        assert(self.cells[tile].value == 0)
        self.cells[tile].value = player
        self.slots -= 1
        return self.getWinner()

    def getMoves(self, list):
        for n, cell in enumerate(self.cells):
            if cell.value == 0:
                list.append((self.id, n))

    def setTile(self, t, v):
        change = 0
        if v == 0 and self.cells[t].value != 0:
            self.slots += 1
            change = 1
        elif v != 0 and self.cells[t].value == 0:
            self.slots -= 1
            change = -1
        self.cells[t].value = v
        return change

    def getBox(self):
        return ''.join([str(c.value) for c in self.cells])

class Cell():
    def __init__(self):
        self.value = 0