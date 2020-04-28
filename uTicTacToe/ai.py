from Game import *
import time
import math
import random
import requests
import sys
import time

def minRand(l, key=lambda x:x):
    m = min(l, key=key)

    p = []
    for i in l:
        if key(i) == key(m):
            p.append(i)
    return random.choice(p)

def maxRand(l, key=lambda x:x):
    m = max(l, key=key)

    p = []
    for i in l:
        if key(i) == key(m):
            p.append(i)
    return random.choice(p)

def makeGetRequest(route='/', data={}):
    r = requests.get('http://127.0.0.1:3000/game'+route,
     params=data,
     headers={'Content-Type': "application/json"})
    assert(r.status_code == 200)
    return r.json()

def makePostRequest(route='/', data={}):
    r = requests.post('http://127.0.0.1:3000/game'+route,
     params=data,
     headers={'Content-Type': "application/json"})
    assert(r.status_code == 200)
    return r.json()

def makePatchRequest(route='/', data={}):
    r = requests.patch('http://127.0.0.1:3000/game'+route,
     params=data,
     headers={'Content-Type': "application/json"})
    assert(r.status_code == 200)
    return r.json()

def makeDeleteRequest(route='/', data={}):
    r = requests.delete('http://127.0.0.1:3000/game'+route,
     params=data,
     headers={'Content-Type': "application/json"})
    assert(r.status_code == 200)
    return r.json()

class GameManager():
    def __init__(self, game):
        self.board = Board()
        self.ai1 = AI(2)
        self.ai2 = AI(1)
        self.currPlayer = 1
        r = makePatchRequest('/'+str(game))
        self.gId = game

    def playGame(self):
        winner = 0
        while not winner:
            if self.currPlayer == self.ai1.id:
                print("Deciding on a move to make")
                box = 0
                tile = 0
                if self.currPlayer == 1:
                    box, tile = self.ai1.makeMove(self.board.duplicate())
                elif self.currPlayer == 2:
                    box, tile = self.ai2.makeMove(self.board.duplicate())
                winner = self.board.makeMove(box, tile)
                b = self.board.getBoard()

                # add the move made into the board
                i = box*9 + tile
                c = b[i]
                c = chr(ord(c) + 2)
                b = b[:i] + c + b[i+1:]
                d = {
                    'player': self.currPlayer,
                    'board': b
                }
                makePostRequest(route='/'+str(self.gId), data=d)
                self.currPlayer = self.board.player
                self.board.showBoard()
            else:
                time.sleep(1)
                r = makeGetRequest(route='/'+str(self.gId))
                self.board.player = r['currPlayer']
                self.board.updateBoard(r['board'])
                self.currPlayer = self.board.player
        print(winner)



class AI():
    def __init__(self, pNum):
        self.id = pNum
        self.tree = None

    def makeMove(self, board):
        sTime = time.time()
        if self.tree:
            self.tree = self.tree.selectChild(board)
            print(self.tree.depth)
        else:
            self.tree = TreeNode((0, 0), board)
            self.tree.createChildren()

        while time.time() - sTime < 5:
            self.tree.iterate()
        print(self.tree.iterations)
        # move the tree to the move being made
        self.tree = maxRand(self.tree.children, key=lambda x : x.score())
        # print(choice.move, board.player)
        return self.tree.move

class TreeNode():
    def __init__(self, move, board, depth=0):
        self.board = board
        self.move = move
        self.visits = 0
        self.value = 0
        self.player = board.player%2 + 1
        self.populate = False
        self.children = []

        self.depth = depth
        self.iterations = 0

    def createChildren(self):
        for move in self.board.getMoves():
            newBoard = self.board.duplicate()
            newBoard.makeMove(move[0], move[1])
            self.children.append(TreeNode(move, newBoard, self.depth+1))
        self.populate = True

    def score(self):
        return self.value/self.visits if self.visits > 0 else 0

    def iterate(self):
        self.iterations += 1
        self.value += 1
        self.visits += 2
        if self.board.winner:
            return self.board.winner

        # find a leaf node
        nextNode = None
        if self.populate == True:
            score = 0
            child = 0
            # print("Running selection")
            for n, c in enumerate(self.children):
                if c.visits == 0:
                    child = n
                    break
                newScore = c.score() + 2*math.sqrt(math.log(self.visits)/c.visits)
                # print(newScore, c.score(), math.sqrt(math.log(self.visits)/c.visits))
                if newScore > score:
                    child = n
                    score = newScore

            nextNode = self.children[child]
        else:
            self.createChildren()
            nextNode = random.choice(self.children)

        result = nextNode.iterate()
        if result == self.player:
            self.value += 1
        elif result != -1:
            self.value -= 1
        return result

    def selectChild(self, board):
        for child in self.children:
            if child.board == board:
                return child

if __name__ == "__main__":
    i = int(sys.argv[1])
    manager = GameManager(i)
    manager.playGame()