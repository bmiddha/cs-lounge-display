# cs-lounge-display

A web app that displays info and upcoming events about the CS department and CS student organizations at UIC

# Features

- Weather (Open Weather Map)
- Time and Date
- Upcoming events from organization calendars
- Personalized MOTD and highlights

# Dependencies

- nodeJS
- `cors` `dotenv` `express` `ical` npm packages

# How to use

- Clone and navigate into the repo
- Run `npm install`
- Create a `.env` file and add your Open Weather Map API key
`OPEN_WEATHER_MAP_API_KEY=<key>`. Use .env.default for a template
- Edit the JSON in main.js to edit/add organization info
- Run `npm run start` to start the node server
- Navigate browser to `index.html`
