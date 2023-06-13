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
} from "./src/controllers/glasto_lineup_controller.js"

const app = express()
const port = 3000

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
app.get("/getGenres", refreshStoredLineupGenres)

app.post("/findArtistsFromPlaylists", findArtistsFromPlaylists)
app.post("/findArtistsFromGenre", findArtistsFromGenre)

app.post("/getAllSongsForArtistsFromArtists", getAllSongsForArtistsFromArtists)
app.post("/getAllSongsForArtistsFromGenre", getAllSongsForArtistsFromGenre)

app.get("/getAllLineupSongs", getAllLineupSongs)

app.listen(port, "0.0.0.0", () => {
	console.log(`glastobuddy-backend listening at https://localhost:${port}`)
})
