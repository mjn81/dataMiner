const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const path = require("path");

const { blocked_domains, MAX, MIN } = require("./constants");
const crawler_config = require("./config/crawler");
const sequelize = require("./config/db");

const Music = require("./models/MusicModel");

const logger = require("node-color-log");

const start = async () => {
	await sequelize.sync();
	puppeteer.use(StealthPlugin());
	const browser = await puppeteer.launch(crawler_config);
	const page = await browser.newPage();
	await page.setRequestInterception(true);
	page.on("request", (req) => {
		const url = req.url();
		if (
			req.resourceType() == "stylesheet" ||
			req.resourceType() == "font" ||
			req.resourceType() == "image" ||
			blocked_domains.some((domain) => url.includes(domain))
		) {
			req.abort();
		} else {
			req.continue();
		}
	});
	/// main code

	for (let i = MAX; i >= MIN; i--) {
		try {
			await page.goto(`https://mp3lyric.us/Global/Musics/OneMusic/${i}`, {
				waitUntil: "networkidle0",
			});
			const track = await page.evaluate(() => {
				const title = document.querySelector(
					".page-one-music-title"
				).textContent;
				const artist_c = document.querySelectorAll(
					".col-md-12 > h4:nth-child(1) > a"
				);
				const genre_c = document.querySelectorAll(
					".col-md-7 > h4:nth-child(1) > a"
				);

				const artists = Array.from(artist_c).map((a) => a.textContent);
				const genres = Array.from(genre_c).map((a) => a.textContent);

				const year = document.querySelector(
					"h4.pull-right > a:nth-child(1)"
				).textContent;
				const source = document.querySelector("#jp_audio_0").src;
				return {
					title,
					artists,
					genres,
					year,
					source,
				};
			});

			await Music.create({
				title: track.title,
				artists: track.artists,
				genres: track.genres,
				year: track.year,
				source: track.source,
			});
			console.log(track);
		} catch (error) {
			logger.color("cyan").italic().log("not found");
		}
	}

	await browser.close();
};

start();

// await page.goto("https://mp3lyric.us/Global/Musics?musicOrderBy=");
// const track_list = await page.evaluate(function () {
// 	const cs = document.querySelectorAll(
// 		"#jp_container_2 > div:nth-child(1) > div:nth-child(1) > div:nth-child(4) > ul:nth-child(1) > li"
// 	);

// 	const t = [];
// 	cs.forEach((item) => {
// 		const t_name = item.querySelector(".jp-title").textContent;
// 		const t_artist = item.querySelector(".jp-artist").textContent;
// 		const t_genres = Array.from(
// 			item.querySelectorAll(".jp-playlist-item-genre")
// 		).map((i) => i.textContent);

// 		const t_year = item.querySelector(".jp-playlist-item-year").textContent;
// 		const t_link = item.querySelector(".jp-playlist-item-pageLink").href;
// 		t.push({
// 			name: t_name,
// 			artist: t_artist,
// 			genres: t_genres,
// 			year: t_year,
// 			link: t_link,
// 		});
// 	});
// 	return t;
// });

// const final = [];
// for (let i = 0; i < track_list.length; i++) {
// 	const track = track_list[i];
// 	await page.goto(track.link, {
// 		waitUntil: "domcontentloaded",
// 	});
// 	const src = await page.evaluate(
// 		() => document.querySelector("#jp_audio_0").src
// 	);
// 	final.push({ ...track, src });
// }
