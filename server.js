require("dotenv").config();
const ical = require("ical");
const http = require("https");
const fs = require("fs");
const express = require("express");
const app = express();
const port = 8080;
const openWeatherApiKey = process.env.OPEN_WEATHER_MAP_API_KEY;
app.listen(port);
console.log("Server started on port " + port);

/**
 * @typedef {object} ShortEvent
 * @prop {string} summary
 * @prop {string} timeStart
 * @prop {string} timeEnd
 * @prop {string} location
 * @prop {string} description
 * @param {string} calendarUrl 
 * @return {Promise<Array<ShortEvent>>}
 */
function getEvents(calendarUrl) {
	return new Promise((resolve, reject) => {
		ical.fromURL(calendarUrl, {}, (err, data) => {
			if (err) reject(err);
			const dtNow = new Date();
			const eventData = Object.values(data).filter((event) => {
				return (new Date(event.start)) > dtNow;
			}).sort((event1, event2) => {
				const e1Time = (new Date(event1.start)).getTime();
				const e2Time = (new Date(event2.start)).getTime();
				return e1Time - e2Time;
			}).map((ev) => ({
				summary: ev.summary,
				timeStart: ev.start,
				timeEnd: ev.end,
				location: ev.location,
				description: ev.description,
			}));
			console.log(eventData);
			resolve(eventData);
		});
	});
}

function getFromUrl(url) {
	return new Promise((resolve, reject) => {
		http.request(url, (response) => {
			var str = "";
			response.on("data", (chunk) => {
				str += chunk;
			});
			response.on("end", () => {
				resolve(str);
			});
		}).end();
	});
}

function getWeather(city) {
	return new Promise((resolve, reject) => {
		var weatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + openWeatherApiKey;
		getFromUrl(weatherUrl).then((result) => {
			let weatherJson = JSON.parse(result);
			resolve(weatherJson);
		});
	});
}

function getFile(file) {
	return new Promise((resolve, reject) => {
		let fileData = {};
		fs.readFile(file, "utf8", (err, data) => {
			if (err) {
				throw err;
			}
			if (!data) resolve({
				data: " "
			});
			else {
				fileData = {
					data: data,
				};
				resolve(fileData);
			}
		});
	});
}

const cors = require("cors");
app.use(cors());
app.use(express.static("public"));
app.use(function (req, res, next) {
	next();
});

app.get("/api/calendar", (req, res) => {
	let cal = req.query.cal;
	getEvents(cal).then((result) => {
		res.send(result);
	});
});
app.get("/api/file", (req, res) => {
	let file = req.query.file;
	getFile(file).then((result) => {
		res.send(result);
	});
});
app.get("/api/weather", (req, res) => {
	let city = req.query.city;
	getWeather(city).then((result) => {
		res.send(result);
	});
});