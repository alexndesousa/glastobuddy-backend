import "dotenv/config"
import express from "express"
import cors from "cors"
import {
	fetchLineup,
	refreshStoredLineupGenres,
	findArtistsFromGenre,
	findArtistsFromPlaylists,
	getAllSongsForArtistsFromGenre,
	getAllLineupSongs,
	getAllSongsForArtistsFromArtists,
	storeLineup,
} from "./src/controllers/glasto_lineup_controller.js"

const app = express()
const port = 8080

const corsOptions = {
	origin: [
		"http://localhost:3000",
		"https://localhost:3000",
		"http://localhost:5000",
		"https://alexndesousa.github.io",
	],
}
app.use(cors(corsOptions))
app.use(express.json())

app.get("/getLineup", fetchLineup)
app.get("/storeLineup", storeLineup)
app.get("/getGenres", refreshStoredLineupGenres)

app.post("/findArtistsFromPlaylists", findArtistsFromPlaylists)
app.post("/findArtistsFromGenre", findArtistsFromGenre)

app.post("/getAllSongsForArtistsFromArtists", getAllSongsForArtistsFromArtists)
app.post("/getAllSongsForArtistsFromGenre", getAllSongsForArtistsFromGenre)

app.get("/getAllLineupSongs", getAllLineupSongs)

app.listen(port)
console.log("Listening on port 8080")
