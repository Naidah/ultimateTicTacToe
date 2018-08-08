Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  post "/game", to: "game#newGame"

  post "/game/:gameid", to: "game#makeMove"
  get "/game/:gameid", to: "game#sendBoard"

  get "/game", to: "game#getSessions" # intended for debugging
  delete "/game/:gameid", to: "game#destroyGame"
end
