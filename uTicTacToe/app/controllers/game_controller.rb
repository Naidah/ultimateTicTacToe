class GameController < ApplicationController
    def newGame
        game = Game.new
        game.board = "0"*81
        game.currPlayer = 1

        if params[:user].blank? # assign the owner name if given, or a default if otherwise
            game.owner = "Untitled game"
        else
            game.owner = params[:user]
        end

        game.joinAvailable = true

        raise InvalidParameterError unless game.save
        json_response(game)
    rescue
        json_response({}, :conflict)
    end

    def joinGame
        games = Game.where(id: params[:gameid])
        raise InvalidParameterError if games.empty?
        game = games.first
        raise InvalidParameterError unless game.joinAvailable
        game.joinAvailable = false
        raise InvalidParameterError unless game.save
        json_response(game)
    rescue
        json_response({}, :bad_request)
    end

    def sendBoard
        games = Game.where(id: params[:gameid])
        raise InvalidParameterError if games.empty?
        game = games.first
        json_response(game)
    rescue
        json_response({}, :bad_request)
    end

    def makeMove
        games = Game.where(id: params[:gameid])
        raise InvalidParameterError if games.empty?
        puts params
        game = games.first
        raise InvalidParameterError unless game.currPlayer == params[:player].to_i
        raise InvalidParameterError if validBoard(params[:board]) == 0
        game.board = params[:board]
        raise InvalidParameterError unless game.save
        game.currPlayer = (game.currPlayer % 2) + 1
        raise InvalidParameterError unless game.save
        json_response({})
    rescue
        json_response({}, :bad_request)
    end

    def getSessions
        games = Game.all
        json_response(games)
    end

    def destroyGame
        games = Game.where(id: params[:gameid])
        raise InvalidParameterError if games.empty?
        games.destroy_all
        json_response({})
    rescue
        json_response({}, :bad_request)
    end
end

def validBoard(b)
    if b.length != 81
        return 0
    end
    return 1
end