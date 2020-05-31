const got = require("got");
const router = require("express").Router();
// Data URLS
const KITSU_URL_BASE = 'https://kitsu.io/api';
const ANIME_DETAILS_URL = `${KITSU_URL_BASE}/edge/anime`;

// Required headers for Kitsu
const KITSU_HEADERS = {
	'Accept': 'application/vnd.api+json',
	'Content-Type': 'application/vnd.api+json'
};

router.get("/show/:slug", (req, res) => {
	res.render("show", {
		layout: "main"
	});
});

router.post("/show/:slug", async (req, res) => {
	// Request the anime's data from Kitsu
	let slug = req.params.slug;
	const idRes = await got(`${ANIME_DETAILS_URL}?fields%5Bcategories%5D=slug%2Ctitle&filter%5Bslug%5D=${slug}&include=categories%2CanimeProductions.producer`, {
		json: true,
		headers: KITSU_HEADERS
	});
	const details = idRes.body.data[0];
	console.log(details);

	// Get episode data
	let id = Number(details.id);
	const episodeRes = await got(`${ANIME_DETAILS_URL}/${details.id}/episodes`, {
		json: true,
		headers: KITSU_HEADERS
	});
	const episodeList = episodeRes.body.data;
	
	details.episodes = episodeList;
	res.json(details);

});	

module.exports = router;