const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
	try {
		const content = await fs.readFile(TOKEN_PATH);
		const credentials = JSON.parse(content);
		return google.auth.fromJSON(credentials);
	} catch (err) {
		return null;
	}
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
	const content = await fs.readFile(CREDENTIALS_PATH);
	const keys = JSON.parse(content);
	const key = keys.installed || keys.web;
	const payload = JSON.stringify({
		type: 'authorized_user',
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	});
	await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
	let client = await loadSavedCredentialsIfExist();
	if (client) {
		return client;
	}
	client = await authenticate({
		scopes: SCOPES,
		keyfilePath: CREDENTIALS_PATH,
	});
	if (client.credentials) {
		await saveCredentials(client);
	}
	return client;
}

const CALENDAR_NAME = 'Luke Work';

async function createEvent(auth) {
	const calendar = google.calendar({ version: 'v3', auth });

	const res = await calendar.events.insert({
		calendarId: 'primary',
		requestBody: {
			summary: 'Work',
			location: '1387 Drexel Rd, Valdese, NC 28690',
			start: {
				dateTime: '2024-06-18T09:00:00-07:00',
				timeZone: 'America/New_York',
			},
			end: {
				dateTime: '2024-06-18T17:00:00-07:00',
				timeZone: 'America/New_York',
			},
		},
	});

	console.log('Event created: %s', res.data.htmlLink);

	return auth;
}

async function createWorkEvent(auth, start_time, end_time) {
	const calendar = google.calendar({ version: 'v3', auth });

	const calendarId = await getCalendarIdFromName(auth, CALENDAR_NAME);

	const res = await calendar.events.insert({
		calendarId,
		requestBody: {
			summary: CALENDAR_NAME,
			location: '1387 Drexel Rd, Valdese, NC 28690',
			start: {
				dateTime: new Date(start_time).toISOString(),
				timeZone: 'America/New_York',
			},
			end: {
				dateTime: new Date(end_time).toISOString(),
				timeZone: 'America/New_York',
			},
		},
	});

	return auth;
}

async function getCalendarIdFromName(auth, calendarName) {
	const calendar = google.calendar({ version: 'v3', auth });
	const res = await calendar.calendarList.list();
	const calendars = res.data.items;
	const calendarId = calendars.find(
		calendar => calendar.summary === calendarName,
	).id;
	console.log(calendars);
	return calendarId;
}

async function clearCalendar(auth, calendarId) {
	console.log('Clearing Calendar');
	const calendar = google.calendar({ version: 'v3', auth });

	const res = await calendar.events.list({
		auth,
		calendarId,
	});

	console.log(res.data.items);
	const events = res.data.items;
	if (!events || events.length === 0) {
		return;
	}

	for await (const event of events) {
		await calendar.events.delete({
			calendarId,
			eventId: event.id,
		});
	}

	return;
}

async function deleteWorkEvent(auth, eventId) {
	const calendar = google.calendar({ version: 'v3', auth });
	const calendarId = await getCalendarIdFromName(auth, CALENDAR_NAME);
	await calendar.events.delete({
		calendarId,
		eventId,
	});
}

async function deleteWorkEventByStartAndEndTimes(auth, start_time, end_time) {
	const calendar = google.calendar({ version: 'v3', auth });
	const calendarId = await getCalendarIdFromName(auth, CALENDAR_NAME);
	const res = await calendar.events.list({
		calendarId,
		timeMin: new Date(start_time).toISOString(),
		timeMax: new Date(end_time).toISOString(),
	});

	const events = res.data.items;
	if (!events || events.length === 0) {
		return;
	}

	events.forEach(async event => {
		await calendar.events.delete({
			calendarId,
			eventId: event.id,
		});
	});

	return;
}

module.exports = {
	authorize,
	createWorkEvent,
	clearCalendar,
	getCalendarIdFromName,
	deleteWorkEventByStartAndEndTimes,
};
