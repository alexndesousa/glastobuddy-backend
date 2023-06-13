import { createClient } from "redis"

/**
 * Stores an auth token in the redis server for the given platform with the given timeout
 * then closes the connection
 * @param {string} platform - The platform for which the auth token belongs to
 * @param {string} authToken - The auth token used for authorizing requests
 * @param {number} timeout - The time in seconds that the auth token will remain valid for
 */
export const setAuthToken = async (platform, authToken, timeout) => {
	const client = createClient()
	await client.connect()
	const key = `${platform}_auth`
	console.log("timeout")
	console.log(timeout)

	await client.set(key, authToken, "EX", timeout)
	console.log(`stored ${platform} authentication token`)

	client.disconnect()
}

/**
 * Retrieves an auth token from the redis server for the given platform
 * @param {string} platform - The platform for which we want to retrieve an auth token for
 * @returns A string of the auth token
 */
export const getAuthToken = async (platform) => {
	const client = createClient()
	await client.connect()
	const key = `${platform}_auth`

	const authToken = await client.get(key)
	if (authToken === null) {
		console.log(`${platform} authentication token doesnt exist in redis`)
	} else {
		console.log(`retrieved ${platform} authentication token from redis`)
	}

	client.disconnect()

	return authToken
}

/**
 * Stores an array of elements in redis
 * @param {String} key - Key that array should be stored against
 * @param {Array} elements - An array of things to store
 */
export const storeArray = async (key, elements) => {
	// if no elements are provided we do nothing
	if (elements.length === 0) {
		return
	}
	const client = createClient()
	await client.connect()

	await client.sAdd(key, elements)
	console.log(`stored new batch of ${key} elements`)

	client.disconnect()
}

/**
 * Stores an object in redis
 * @param {String} successKey - Key that fieldvalue should be stored against if we have data
 * @param {String} failKey - Key that fieldvalue should be stored against if we we couldnt find anything
 * @param {String} field - A field to store
 * @param {String} value - A value to store against given field
 */
export const storeObject = async (successKey, failKey, field, value) => {
	// if no elements are provided we do nothing
	const stringified = JSON.stringify(value)
	if (stringified === "{}") {
		console.log(
			`no field/value provided. storing in ${failKey}. field: ${field}. value: ${stringified}`
		)
		storeArray(failKey, field)
		return
	}

	const client = createClient()
	await client.connect()

	await client.hSet(successKey, field, stringified)
	console.log(`stored new ${successKey} object`)

	client.disconnect()
}

/**
 * Retrieves stored array
 * @param {String} key - Key of array that should be retrieved
 * @returns An Array
 */
export const retrieveArray = async (key) => {
	const client = createClient()
	await client.connect()

	const elements = await client.sMembers(key)
	if (elements === null) {
		console.log(`unable to retrieve ${key} elements from redis`)
	} else {
		console.log(`successfully retrieved ${key} elements from redis`)
	}

	client.disconnect()

	return elements
}

/**
 * Retrieves stored object
 * @param {String} key - Key of object that should be retrieved
 * @returns An Object
 */
export const retrieveObject = async (key) => {
	const client = createClient()
	await client.connect()

	const elements = await client.hGetAll(key)
	// need to transform this back into a proper object maybe?
	if (elements === null) {
		console.log(`unable to retrieve ${key} object from redis`)
	} else {
		console.log(`successfully retrieved ${key} object from redis`)
	}

	client.disconnect()

	return elements
}
