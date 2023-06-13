import { setAuthToken, getAuthToken } from "../db/redis_db.js"

export const getAccessToken = async () => {
	// if the token exists in redis, lets retrieve it from there instead
	const authToken = await getAuthToken("spotify")
	if (authToken !== null) {
		return authToken
	}

	const clientId = process.env.SPOTIFY_CLIENT_ID
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
	const baseUrl = "https://accounts.spotify.com/api/token"

	const params = new URLSearchParams()
	params.append("grant_type", "client_credentials")
	const encodedIdAndSecret = Buffer.from(
		`${clientId}:${clientSecret}`
	).toString("base64")
	const options = {
		method: "POST",
		body: params,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${encodedIdAndSecret}`,
		},
	}

	const res = await fetch(baseUrl, options)
	const resJSON = await res.json()
	await setAuthToken("spotify", resJSON.access_token, resJSON.expires_in)
	return resJSON.access_token
}

export const searchForArtist = async (artist) => {
	const baseUrl = "https://api.spotify.com/v1/search"
	const parameterisedUrl = `${baseUrl}?q=${artist}&type=artist`

	const accessToken = await getAccessToken()
	const options = {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	}

	const searchResult = await fetch(parameterisedUrl, options)
	const searchResultJson = await searchResult.json().catch((e) => {})

	const filteredArtists = searchResultJson?.artists?.items
		.filter(
			({ name: artistName }) =>
				artistName.toString().toLowerCase() ===
				artist.toString().toLowerCase()
		)
		.sort((a, b) => b?.followers?.total ?? 0 - a?.followers?.total ?? 0)
	return filteredArtists ? filteredArtists[0] : []
}

export const getArtistsTopTracks = async (artist) => {
	const baseUrl = "https://api.spotify.com/v1/artists"
	const parameterisedUrl = `${baseUrl}/${artist}/top-tracks?country=GB`

	const accessToken = await getAccessToken()
	const options = {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	}

	const topTracks = await fetch(parameterisedUrl, options)
	const topTracksJson = await topTracks.json().catch((e) => {})
	return topTracksJson.tracks.map(({ uri }) => uri)
}
