import { JSDOM } from "jsdom"

export const getLineup = async () => {
	const html = await fetch(
		"https://www.glastonburyfestivals.co.uk/line-up/line-up-2023/"
	)
	const text = await html.text()
	const dom = new JSDOM(text)
	const tables = dom.window.document.querySelectorAll(
		'.lineup_table_group .lineup_table_day tbody tr td:first-child[width="100%"] '
	)
	return [...tables].map((node) => {
		return node.textContent
	})
}
