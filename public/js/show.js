
let slug = location.pathname.split("/").filter(d => d).pop();
let data;

async function loadInfo() {
	let episodeData = await (await fetch(`/show/${slug}`, {
		method: "POST"
	})).json();
	console.log(episodeData);
	data = episodeData;
	render();
}

function render() {
	document.querySelector(".showCore").classList.remove("unloaded");

	document.querySelector(".bannerImage").src = data.attributes.coverImage.original;
	document.querySelector(".showPoster").src = data.attributes.posterImage.medium;

	document.querySelector(".showTitle").innerText = getTitle(data.attributes.titles);
	document.querySelector(".showDescription").innerText = data.attributes.synopsis;

	let episodeList = document.querySelector(".allEpisodes");
	episodeList.innerHTML = "";
	for(let episode of data.episodes) {
		console.log(episode);
		let node = document.importNode(document.querySelector(".templates .episodeItem").content, true).querySelector("*");

		if(episode.attributes.thumbnail) node.querySelector(".thumbnailImg").src = episode.attributes.thumbnail.original;
		node.querySelector(".episodeTitle").innerText = getTitle(episode.attributes.titles);
		node.querySelector(".episodeDescription").innerText = episode.attributes.synopsis;

		node.querySelector(".playButton").addEventListener("click", () => {
			playVideo(data.id, episode.attributes.number);
		});

		episodeList.appendChild(node);
	}


}

function getTitle(titleObj) {
	return titleObj.en_us || titleObj.en || titleObj.en_jp || titleObj.ja_jp
}

function init() {
	loadInfo();
}
window.addEventListener("load", init);