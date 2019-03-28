Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  post "/game", to: "game#newGame"
  patch "/game/:gameid", to: "game#joinGame"

  post "/game/:gameid", to: "game#makeMove"
  get "/game/:gameid", to: "game#sendBoard"

  get "/game", to: "game#getSessions"
  delete "/game/:gameid", to: "game#destroyGame"
end
