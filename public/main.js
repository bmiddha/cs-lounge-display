const city= "chicago";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
const orgs = ["acm", "lug", "wics", "uiccs", "uiccs2"];
const orgData = [];
orgData["acm"] = {
	type: "cal",
	name: "Association for Computing Machinery",
	logo: "images/acmLogo.png",
	acronym: "ACM",
	motd: "files/acm.motd",
	calendar: "https://calendar.google.com/calendar/ical/kc72g1ctfg8b88df34qqb62d1s%40group.calendar.google.com/public/basic.ics",
};
orgData["lug"] = {
	type: "cal",
	name: "Linux Users Group",
	logo: "images/lugLogo.png",
	acronym: "LUG",
	motd: "files/lug.motd",
	calendar: "https://calendar.google.com/calendar/ical/ca149os3pmnh0dcopr1jn2negg%40group.calendar.google.com/public/basic.ics",
};
orgData["wics"] = {
	type: "cal",
	name: "Women in Computer Science",
	logo: "images/wicsLogo.png",
	acronym: "WiCS",
	motd: "files/wics.motd",
	calendar: "https://calendar.google.com/calendar/ical/uicwics%40gmail.com/public/basic.ics",
};
orgData["uiccs"] = {
	type: "cal",
	name: "UIC Computer Science",
	logo: "images/uiccsLogo.png",
	acronym: "CS",
	motd: "files/uiccs.motd",
	calendar: "https://calendar.google.com/calendar/ical/cik4lv50p4jrkn9a723a4bjjr0%40group.calendar.google.com/public/basic.ics",
};
orgData["uiccs2"] = {
	type: "ad",
	name: "UIC Computer Science",
	logo: "images/uiccsLogo.png",
	acronym: "CS",
	motd: "files/uiccs.motd",
	adData: "files/uiccs.ad",
};

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
		let k = 1;
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
	getApiData("weather", "city", city).then((result) => {
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
	activeOrg = counter % orgs.length;
	counter++;
	getMotd(orgData[orgs[activeOrg]].motd);
	if (orgData[orgs[activeOrg]].type == "cal")
		getEvents(orgData[orgs[activeOrg]].calendar);
	else if (orgData[orgs[activeOrg]].type == "ad")
		getAd(orgData[orgs[activeOrg]].adData);
	document.querySelector("#org-logo>img").alt = orgData[orgs[activeOrg]].name;
	document.querySelector("#org-logo>img").src = orgData[orgs[activeOrg]].logo;
	let divChild = activeOrg + 1;
	let divPreviousChild = (divChild == 1) ? orgs.length : divChild - 1;
	document.querySelector("#org-list>span:nth-child(" + divPreviousChild + ")").classList.remove("active");
	document.querySelector("#org-list>span:nth-child(" + divChild + ")").classList.add("active");
	setTimeout(updateActiveOrg, 10000);
}

function footerImages() {
	document.querySelector("#org-list").innerHTML = "";
	for (let j = 0; j < orgs.length; j++)
		document.querySelector("#org-list").innerHTML += "<span><img src='" + orgData[orgs[j]].logo + "'alt='" + orgData[orgs[j]].name + "'></span>";
}

getWeather();
timeAndDate();
footerImages();
updateActiveOrg();