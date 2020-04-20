const fs = require('fs');
const { google } = require('googleapis');
const express = require('express');
//const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
let oAuth2Client, authUrl;
const PORT = process.env.PORT || 5000;
app.use(cookieParser());
//app.use(bodyParser.urlencoded({ extended: false }))
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
function init() {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content));
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        return getAccessToken(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client) {
    authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
}

/**
 * Lists the next 200 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth, response) {
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 200,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        let ret = [];
        events.map((event, i) => {
            let title = event.summary;
            let body = event.description;
            let begin = event.start.dateTime || event.start.date;
            let end = event.end.dateTime || event.end.date;
            let obj = { title: title, body: body, begin: begin, end: end }
            ret.push(obj);
        });
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(ret));
    });
}
init();
app.get('/', (req, res, next) => {
    res.redirect(authUrl);
});
app.get('/run', (req, res, next) => {
    let code = req.query.code;
    oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        res.cookie("User", JSON.stringify(token)).redirect('/ret');
    });
});
app.get('/ret', (req, res, next) => {
    let authtemp = req.cookies.User;
    if (!authtemp) {
        res.send('<h1>Invalid Data</h1><hr><a href="/">Click Here To get Valid Data</a>');
    } else {
        oAuth2Client.setCredentials(JSON.parse(authtemp));
        listEvents(oAuth2Client, res);
    }
});
app.listen(PORT, () => { console.log('App running at ' + PORT) });