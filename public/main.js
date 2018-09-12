const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

var config;

function getApiData(type, arg, value) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		let url = "http://localhost:8080/api/" + type + "/?" + arg + "=" + value;
		xhr.open("GET", url, true);
		xhr.send();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && xhr.status == 200) {
				let data;
				if (xhr.responseText) {
					try {
						data = JSON.parse(xhr.responseText);
					} catch (e) {
						console.log(e);
					}
				}
				resolve(data);
			}
		};
	});
}

function addZero(i) {
	return (i < 10) ? ("0" + i) : i;
}

function timeAndDate() {
	let today = new Date();
	let hour = today.getHours();
	let min = today.getMinutes();
	let date = today.getDate();
	let month = today.getMonth();
	let day = DAYS[today.getDay()];
	hour = (hour > 12) ? (hour - 12) : hour;
	min = addZero(min);
	hour = addZero(hour);
	document.querySelector("#time>p").innerHTML = hour + ":" + min + " " + day + ", " + MONTHS[month] + " " + date;
	setTimeout(timeAndDate, 2000);
}

function getEvents(cal) {
	document.querySelector("#hero>p").classList = "cal";
	document.querySelector("#hero>p").innerHTML = "";
	getApiData("calendar", "cal", cal).then((result) => {
		let k = 0;
		let content = "<h2>Upcoming Events</h2>";
		let dtNow = new Date();
		let oldEvents = 0;
		while (k < result.length) {
			if (k > 4 + oldEvents) break;
			let dtStart = new Date(result[k].timeStart);
			if (dtStart < dtNow) {
				oldEvents++;
				k++;
				continue;
			}
			let tmStartHour = dtStart.getHours();
			let tmStartAmPm = "AM";
			if (tmStartHour > 12) {
				tmStartHour -= 12;
				tmStartAmPm = "PM";
			}
			tmStartHour = addZero(tmStartHour);
			let tmStart = DAYS[dtStart.getDay()] + ", " + MONTHS[dtStart.getMonth()] + " " + dtStart.getDate() + " " + tmStartHour + ":" + addZero(dtStart.getMinutes()) + tmStartAmPm;
			let dtEnd = new Date(result[k].timeEnd);
			let tmEndHour = dtEnd.getHours();
			let tmEndAmPm = "AM";
			if (tmEndHour > 12) {
				tmEndHour -= 12;
				tmEndAmPm = "PM";
			}
			tmEndHour = addZero(tmEndHour);
			let tmEnd = DAYS[dtEnd.getDay()] + ", " + MONTHS[dtEnd.getMonth()] + " " + dtEnd.getDate() + " " + tmEndHour + ":" + addZero(dtEnd.getMinutes()) + tmEndAmPm;
			content += "<li>";
			content += "<span class=summary>" + result[k].summary + "</span>";
			content += "<span class=location>" + result[k].location + "</span>";
			content += "<span class=timeStart>" + tmStart + "</span>";
			content += "<span class=timeEnd>" + tmEnd + "</span>";
			content += "</li>";
			document.querySelector("#hero>p").innerHTML = content;
			k++;
		}
	});
}

function getMotd(file) {
	getApiData("file", "file", file).then((result) => {
		document.querySelector("#motd>p").innerHTML = result.data;
	});
}

function getWeather() {
	getApiData("weather", "city", config.city).then((result) => {
		let temp = result.main.temp;
		let tempF = Math.round(temp * 9 / 5 - 459.67);
		let tempC = Math.round(temp - 273.15);
		let timeNow = new Date();
		let dayNight = (timeNow.getHours() >= 19 || timeNow.getHours() <= 4) ? "n" : "d";
		document.querySelector("#weather>p").innerHTML = "<i class='owf owf-" + result.weather[0].id + "-" + dayNight + "'></i><span>" + result.weather[0].main + "</span><span>" + tempF + "&#176;F | " + tempC + "&#176;C</span>";
	});
	setTimeout(getWeather, 60000);
}

function getAd(file) {
	getApiData("file", "file", file).then((result) => {
		document.querySelector("#hero>p").classList = "ad";
		let content = result.data;
		document.querySelector("#hero>p").innerHTML = content;
	});
}

var activeOrg = 0;
var counter = 0;

function updateActiveOrg() {
	activeOrg = counter % config.orgData.length;
	counter++;
	getMotd(config.orgData[activeOrg].motd);
	if (config.orgData[activeOrg].type == "cal")
		getEvents(config.orgData[activeOrg].calendar);
	else if (config.orgData[activeOrg].type == "ad")
		getAd(config.orgData[activeOrg].adData);
	document.querySelector("#org-logo>img").alt = config.orgData[activeOrg].name;
	document.querySelector("#org-logo>img").src = config.orgData[activeOrg].logo;
	let divChild = activeOrg + 1;
	let divPreviousChild = (divChild == 1) ? config.orgData.length : divChild - 1;
	document.querySelector("#org-list>span:nth-child(" + divPreviousChild + ")").classList.remove("active");
	document.querySelector("#org-list>span:nth-child(" + divChild + ")").classList.add("active");
	setTimeout(updateActiveOrg, config.orgTimeout * 1000);
}

function footerImages() {
	document.querySelector("#org-list").innerHTML = "";
	for (let j = 0; j < config.orgData.length; j++)
		document.querySelector("#org-list").innerHTML += "<span><img src='" + config.orgData[j].logo + "'alt='" + config.orgData[j].name + "'></span>";
}

fetch("config.json").then(response => response.json()).then((json) => {
	config = json;
	getWeather();
	timeAndDate();
	footerImages();
	updateActiveOrg();
});