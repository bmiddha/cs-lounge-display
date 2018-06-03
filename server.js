require("dotenv").config();
const ical = require('ical');
const http = require("http");
const fs = require("fs");
const express = require("express");
const app = express();
const port = 8080;
const openWeatherApiKey = process.env.OPEN_WEATHER_MAP_API_KEY;
app.listen(port);
console.log("Server started on port " + port);

function getEvents(calendarUrl) {
	return new Promise((resolve, reject) => {
		ical.fromURL(calendarUrl, {}, (err, data) => {
			let eventData = [];
			for (let k in data) {
				if (data.hasOwnProperty(k)) {
					let ev = data[k];
					let event = {
						summary: ev.summary,
						timeStart: ev.start,
						timeEnd: ev.end,
						location: ev.location,
						description: ev.description
					};
					eventData.push(event);
				}
			}
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
		var weatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + openWeatherApiKey;
		getFromUrl(weatherUrl).then((result) => {
			let weatherJson = JSON.parse(result);
			resolve(weatherJson);
		});
	});
}

function getFile(file) {
	return new Promise((resolve, reject) => {
		let fileData = {};
		fs.readFile(file, 'utf8', (err, data) => {
			data = data.replace(/(?:\r\n|\r|\n)/g, '<br>');
			fileData = {
				data: data
			};
			resolve(fileData);
		});
	});
}

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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