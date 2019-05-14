function returnResp(resp) {
    if (!resp.ok) {
        throw Error;
    }
    return resp.json();
}

function makeRequest(url, method, data=""){
    if (method == "GET") {
        return fetch(url, {
            method: method
        })
        .then(returnResp)
    } else {
        return fetch(url, {
            method: method,
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        })
        .then(returnResp)
    }
}

window.onload = getCurrLobbyList();

function getCurrLobbyList() {
    console.log("Looking for lobbies")
    makeRequest("/game", "GET").then(j => updateLobbies(j));
}

function updateLobbies(lobbies) {
    var container = document.getElementById("lobbyContainer");
    // Reset the container
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    for (var i = 0; i < lobbies.length; i++) {
        if (lobbies[i].joinAvailable) {
            var box = document.createElement("div");

            box.dataset.id = lobbies[i].id;
            box.addEventListener("click", function() {
                routeOnline(this)
            });

            box.innerHTML = lobbies[i].owner;
            box.classList.add("lobbyBox")
            container.appendChild(box);
        } else {
            console.log("Rejecting game "+lobbies[i].id)
        }
    }
}


function launchGame(game) {
    sessionStorage.gameType = "online"
    sessionStorage.gameId = game.id;
    window.location.href = "/match.html"
}

function createGame(hasAi) {
    sessionStorage.thisPlayer = 1;
    nField = document.getElementById("nameField")
    data = {
        user: nField.value,
        ai: hasAi
    };
    makeRequest("/game", "POST", data).then(launchGame);
}

function routeLocal() {
    sessionStorage.gameType = "local";
    window.location.href = "/match.html"
}

function routeOnline(link) {
    sessionStorage.thisPlayer = 2;
    makeRequest("/game/"+link.dataset.id, "PATCH")
    .then(launchGame)
    .catch(function(e) {
        getCurrLobbyList();
    });
}

