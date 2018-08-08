class GameController < ApplicationController
    def newGame
        game = Game.new
        game.currPlayer = 1
        game.currBox = -1
        game.lastBox = -1
        game.lastTile = -1

        f = false

        if game.save
            for i in 0..8 do
                box = Box.new
                box.tilesRemaining = 9
                box.owner = 0
                box.game_id = game.id

                if box.save

                    for k in 0..8 do
                        tile = Tile.new
                        tile.owner = 0
                        tile.box_id = box.id

                        if !(tile.save)
                            f = true
                        end
                    end
                else
                    f = true
                end
            end
        else
            f = true
        end

        if f == true
            game.destroy
            json_response({}, :conflict)
        else
            json_response({}, :ok)
        end
    end

    def sendBoard
        json_response({})
    end

    def makeMove
        json_response({}, :conflict)
    end

    def getSessions
        games = Game.all
        json_response(games)
    end

    def destroyGame
        games = Game.where(id: params[:gameid])
        if games.empty?
            json_response({}, :bad_request)
        else
            games.destroy_all
            json_response({})
        end
    end
end
