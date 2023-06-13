import {
	searchForArtist,
	getArtistsTopTracks,
} from "../services/spotify_service.js"
import { retrieveArray, storeArray, storeObject } from "../db/redis_db.js"

export const searchAndStoreArtistInfo = async (lineup) => {
	for (const artistName of lineup) {
		const artistInfo = await searchForArtist(artistName)
		const artistFields = {
			followers: artistInfo?.followers?.total,
			genres: artistInfo?.genres,
			href: artistInfo?.href,
			artwork: artistInfo?.images
				? artistInfo?.images[0]?.url
				: undefined,
			name: artistInfo?.name,
		}
		await storeObject(
			"glasto_lineup_spotify",
			"failed_glasto_lineup_spotify",
			artistName,
			artistFields
		)
		await new Promise((resolve) => setTimeout(resolve, 300))
	}
}

export const searchAndStoreMultipleArtistsTopTracks = async (artistIds) => {
	for (const artistId of artistIds) {
		const currentTopSongs = await retrieveArray(artistId)
		if (!currentTopSongs || currentTopSongs.length === 0) {
			const topTracks = await getArtistsTopTracks(artistId)
			await storeArray(artistId, topTracks)
			await new Promise((resolve) => setTimeout(resolve, 300))
		}
	}
}
