require "boxObject"
require "tileObject"

class GameObject
    def self.newGame
        # create a new game, and return the id. Returns -1 in case of failure
    end

    def self.makeMove(gameid, box, tile)
    end

    def self.destroyGame(gameid)
        # removes a game from memory
    end
end