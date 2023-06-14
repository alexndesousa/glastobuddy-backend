import { getLineup } from "../services/glastonbury_service.js"
import { storeArray, retrieveArray, retrieveObject } from "../db/redis_db.js"
import {
	searchAndStoreArtistInfo,
	searchAndStoreMultipleArtistsTopTracks,
} from "./spotify_controller.js"

export const fetchAndStoreArtistSpotifyInfo = async (req, res) => {
	const lineup = await retrieveArray("glasto_lineup")
	const rawLoadedLineup = await retrieveObject("glasto_lineup_spotify")
	const loadedLineup = Object.keys(rawLoadedLineup)
	const failedLoaded = await retrieveArray("failed_glasto_lineup_spotify")
	const artistsToIgnore = loadedLineup.concat(failedLoaded)
	const artistsToSearchFor = lineup.filter(
		(artist) => !artistsToIgnore.includes(artist.toString().toUpperCase())
	)
	searchAndStoreArtistInfo(artistsToSearchFor)
	res.send({ message: "processing" })
}

export const fetchAndStoreAllArtistsTopSongs = async (req, res) => {
	const rawLoadedLineup = await retrieveObject("glasto_lineup_spotify")
	const artistsIds = Object.values(rawLoadedLineup).map((value) => {
		const { href } = JSON.parse(value)
		return href.split("artists/")[1]
	})
	searchAndStoreMultipleArtistsTopTracks(artistsIds)
}

export const fetchLineup = async (req, res) => {
	const lineup = await retrieveArray("glasto_lineup")
	if (Object.keys(lineup).length === 0) {
		res.status(400).send({
			message: "couldnt find lineup. ask sous to fix it.",
		})
	} else {
		res.send({ body: lineup })
	}
}

export const fetchMissingLineup = async (req, res) => {
	const lineup = await retrieveArray("failed_glasto_lineup_spotify")
	res.send({ body: lineup })
}

export const storeLineup = async (req, res) => {
	const names = await getLineup()
	await storeArray("glasto_lineup", names)
	res.send({ message: "stored" })
}

export const refreshStoredLineupGenres = async (req, res) => {
	const rawLoadedLineup = await retrieveObject("glasto_lineup_spotify")
	const loadedGenres = Object.values(rawLoadedLineup)
		.map((stringified) => {
			const { genres } = JSON.parse(stringified)
			return genres
		})
		.flat()
	const uniqueAndSorted = [...new Set(loadedGenres)].sort()
	res.send({ body: uniqueAndSorted })
}

const artistsFromGenre = async (req) => {
	const rawLoadedLineup = await retrieveObject("glasto_lineup_spotify")
	console.log("artists from genre")
	return Object.values(rawLoadedLineup)
		.map((value) => JSON.parse(value))
		.filter(
			({ genres }) =>
				genres.length > 0 &&
				genres.filter((x) => req.body?.genres?.includes(x)).length > 0
		)
}

const artistsFromArtists = async (req) => {
	const rawLoadedLineup = await retrieveObject("glasto_lineup_spotify")
	return Object.values(rawLoadedLineup)
		.map((value) => JSON.parse(value))
		.filter(({ href }) => href && req.body?.artists?.includes(href))
}

export const findArtistsFromGenre = async (req, res) => {
	const artists = await artistsFromGenre(req)
	res.send({ body: artists })
}

export const getAllSongsForArtistsFromGenre = async (req, res) => {
	const artists = await artistsFromGenre(req)
	const artistsIds = artists.map(({ href }) => href.split("/artists/")[1])
	let allSongs = []
	for (const id of artistsIds) {
		const topSongs = await retrieveArray(id)
		allSongs = allSongs.concat(topSongs)
	}
	res.send({ body: { songs: allSongs, artists: artists } })
}

export const getAllSongsForArtistsFromArtists = async (req, res) => {
	const artists = await artistsFromArtists(req)
	console.log(artists)
	const artistsIds = artists.map(({ href }) => href.split("/artists/")[1])
	let allSongs = []
	for (const id of artistsIds) {
		const topSongs = await retrieveArray(id)
		allSongs = allSongs.concat(topSongs)
	}
	res.send({ body: { songs: allSongs, artists: artists } })
}

export const getAllLineupSongs = async (req, res) => {
	const rawLoadedLineup = await retrieveObject("glasto_lineup_spotify")
	const artistsIds = Object.values(rawLoadedLineup)
		.map((value) => JSON.parse(value))
		.map(({ href }) => href.split("/artists/")[1])
	let allSongs = []
	for (const id of artistsIds) {
		const topSongs = await retrieveArray(id)
		allSongs = allSongs.concat(topSongs)
	}
	res.send({ body: allSongs })
}

export const findArtistsFromPlaylists = async (req, res) => {}
