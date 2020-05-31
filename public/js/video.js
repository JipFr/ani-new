
let hideControlsTimeout;

document.addEventListener("mousemove", updateControlTimeout);
document.addEventListener("click", updateControlTimeout);
document.addEventListener("touchdown", updateControlTimeout);

function updateControlTimeout() {
	document.querySelectorAll(".videoControls").forEach(el => {
		el.classList.add("visible");
	});
	if(hideControlsTimeout) clearTimeout(hideControlsTimeout);
	hideControlsTimeout = setTimeout(() => {
		document.querySelectorAll(".videoControls.visible").forEach(el => {
			el.classList.remove("visible");
		});
	}, 2e3);
}

/**
 * Open video player
 * @param slug Show's ID
 * @param episode Episode's number
 */
async function playVideo(id, episode) {
	// Verify input is valid
	if(Number(id) && Number(episode)) {
		id = Number(id);
		episode = Number(episode);
	} else {
		return 400;
	}
	// Have it show the stuff & clean up
	console.log(id, episode);
	document.body.classList.add("showVideo");
	document.querySelectorAll("header .videoOverlay").forEach(el => el.remove());

	// Get video node
	let videoNode = document.importNode(document.querySelector(".templates .videoOverlay").content, true).querySelector("*");

	// Update controls
	videoNode.querySelector("video").addEventListener("play", updateVideo);
	videoNode.querySelector("video").addEventListener("pause", updateVideo);
	function updateVideo() {
		videoNode.setAttribute("data-paused", !!videoNode.querySelector("video").paused);
	}

	// Play / pause
	videoNode.querySelector(".toggleButtons").addEventListener("click", () => {
		let video = videoNode.querySelector("video");
		video[video.paused ? "play" : "pause"]();
	});

	// Close player
	videoNode.querySelector(".closeButton").addEventListener("click", () => {
		document.body.classList.remove("showVideo");
		document.querySelectorAll("header .videoOverlay").forEach(el => el.remove());
	});
	
	// Update progress
	videoNode.querySelector("video").addEventListener("timeupdate", () => {
		let vid = videoNode.querySelector("video");
		videoNode.querySelector(".startTime").innerText = toMinSec(vid.currentTime);
		videoNode.querySelector(".endTime").innerText = toMinSec(vid.duration);

		let progress = vid.currentTime / vid.duration;
		let percentage = (progress * 100) + "%";
		videoNode.querySelector(".dot").style.setProperty("margin-left", percentage);
		videoNode.querySelector(".bar").style.setProperty("background", `linear-gradient(to right, gray ${percentage}, #4c4c4c ${percentage})`);

	});

	// Seek
	videoNode.querySelector(".progressBar").addEventListener("click", (evt) => {
		let rect = evt.target.getBoundingClientRect();
		let x = evt.clientX - rect.left;
		let percentage = x / evt.target.scrollWidth;
		let vid = videoNode.querySelector("video");
		vid.currentTime = percentage * vid.duration;
	})


	// Add video to DOM
	document.querySelector("header").appendChild(videoNode);

	// Load & append streams
	let streams = await (await fetch("/api/getStreams", {
		method: "POST",
		headers: {
			"content-type": "application/json"
		},
		body: JSON.stringify({
			id,
			episode
		})
	})).json();
	videoNode.querySelectorAll(".videos source").forEach(el => el.remove());

	for(let stream of streams.data) {
		let source = document.createElement("source");
		source.src = stream.file;
		videoNode.querySelector("video").appendChild(source);
	}

	videoNode.querySelector("video").play();

}

function toMinSec(seconds) {
	let minutes = Math.floor(seconds / 60);
	let updatedSeconds = seconds - (minutes * 60);
	return `${minutes.toString().padStart(2, "0")}:${Math.floor(updatedSeconds).toString().padStart(2, "0")}`;
}