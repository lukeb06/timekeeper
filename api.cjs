const express = require('express');
const { get } = require('http');
const app = express();
const PORT = process.env.PORT || 3001;
const { google } = require('googleapis');

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization',
	);
	res.setHeader('Access-Control-Allow-Credentials', 'true');

	next();
});

app.get('/status', (req, res) => {
	res.status(200).json({ status: 'API active' });
});

app.use(express.json());

const JSONdb = require('simple-json-db');
const db = new JSONdb('./db.json');
const scheduleDB = new JSONdb('./schedule.json');

const EVENT = {
	CLOCK_IN: 1,
	CLOCK_OUT: 2,
	EDIT_HOURS: 3,
};

const createEvent = type => {
	return {
		type,
		timestamp: Date.now(),
	};
};

const formatDate = date => {
	return new Date(date.toDateString());
};

const formatDateString = dateString => {
	return formatDate(new Date(isNaN(+dateString) ? dateString : +dateString));
};

const getTotalHours = date => {
	date = `${date.getTime()}`;
	const dateData = db.has(date) ? db.get(date)['hours'] : [];
	let totalHours = 0;

	if (dateData.length == 0) return 0;

	dateData.forEach(entry => {
		totalHours += entry;
	});

	return totalHours;
};

const getEventLog = date => {
	date = `${date.getTime()}`;
	return db.has(date) ? db.get(date)['events'] : [];
};

const getLastClockIn = date => {
	date = `${date.getTime()}`;
	return db.has(date) ? db.get(date)['last_clock_in'] : null;
};

const HOURLY_PAY = 12;

const getDaySummary = _date => {
	const targetDate = formatDateString(_date);

	return {
		date: targetDate.toDateString(),
		day: targetDate.getDay(),
		dayString: targetDate.toLocaleString('default', { weekday: 'short' }),
		month: targetDate.getMonth(),
		monthString: targetDate.toLocaleString('default', { month: 'short' }),
		year: targetDate.getFullYear(),
		unix: targetDate.getTime(),
		dayOfTheMonth: targetDate.getDate(),

		title: targetDate.toLocaleString('default', { weekday: 'short' }),
		description:
			targetDate.toLocaleString('default', { month: 'short' }) +
			' ' +
			targetDate.getDate(),

		totalHours: getTotalHours(targetDate),
		eventLog: getEventLog(targetDate),
		lastClockIn: getLastClockIn(targetDate),
		pay: getTotalHours(targetDate) * HOURLY_PAY,
	};
};

app.get('/day-summary/:date', (req, res) => {
	const returnData = getDaySummary(req.params.date);
	res.status(200).json(returnData);
});

const getWeekSummary = _date => {
	const week = [];

	for (let i = 0; i < 7; i++) {
		const date = new Date(_date);
		date.setDate(date.getDate() - date.getDay() + 1 + i);
		week.push(getDaySummary(date));
	}

	return week;
};

const getWeekOffset = (_date, weeks = 0) => {
	const mult = weeks * 7;
	const date = new Date(_date);
	date.setDate(date.getDate() - date.getDay() + mult);

	return date;
};

const getFirstDayOfWeek = _date => {
	const date = new Date(_date);
	date.setDate(date.getDate() - date.getDay() + 1);

	return date;
};

app.get('/week-summary/:date', (req, res) => {
	const targetDate = formatDateString(req.params.date);
	const offset = +req.query?.offset || 0;
	const week = getWeekSummary(getWeekOffset(targetDate, offset));

	res.status(200).json(week);
});

app.get('/week-total/:date', (req, res) => {
	const targetDate = formatDateString(req.params.date);
	const offset = +req.query?.offset || 0;
	const week = getWeekSummary(getWeekOffset(targetDate, offset));
	let totalHours = 0;

	week.forEach(day => {
		totalHours += day.totalHours;
	});

	let totalPay = totalHours * HOURLY_PAY;

	res.status(200).json({ totalHours, totalPay });
});

const getSchedule = weekID => {
	return scheduleDB.has(weekID) ? scheduleDB.get(weekID) : [];
};

const {
	authorize,
	createWorkEvent,
	clearCalendar,
	getCalendarIdFromName,
	deleteWorkEventByStartAndEndTimes,
} = require('./google-api.cjs');

const syncScheduleWithCalendar = async (week, remove = false) => {
	const auth = await authorize();
	week = [...week];

	// const calendarId = await getCalendarIdFromName(auth, 'Luke Work');

	// await clearCalendar(auth, calendarId);

	if (remove) {
		for await (const day of week) {
			await deleteWorkEventByStartAndEndTimes(
				auth,
				day.start_time,
				day.end_time,
			);
		}

		console.log('Removed schedule from Google Calendar');

		return;
	}

	for await (const day of week) {
		await createWorkEvent(
			auth,
			new Date(day.start_time),
			new Date(day.end_time),
		);
	}

	console.log('Synced schedule with Google Calendar');

	return;
};

const fullSyncScheduleWithCalendar = async () => {
	const auth = await authorize();

	const calendarId = await getCalendarIdFromName(auth, 'Luke Work');

	await clearCalendar(auth, calendarId);

	console.log('Cleared calendar');

	console.log('Syncing schedule with Google Calendar');

	for await (const week of Object.values(scheduleDB.JSON())) {
		for await (const day of week) {
			await createWorkEvent(
				auth,
				new Date(day.start_time),
				new Date(day.end_time),
			);
		}
	}

	console.log('Synced schedule with Google Calendar');

	return;
};

app.get('/schedule/:date', (req, res) => {
	const targetDate = formatDateString(req.params.date);
	const offset = +req.query?.offset || 0;
	const weekID = getFirstDayOfWeek(
		getWeekOffset(targetDate, offset),
	).getTime();

	const schedule = getSchedule(weekID);

	res.status(200).json({ schedule });
});

const getScheduleDefault = req => {
	const targetDate = formatDateString(req.params.date);
	const offset = +req.query?.offset || 0;
	const weekID = getFirstDayOfWeek(
		getWeekOffset(targetDate, offset),
	).getTime();

	let schedule = {};

	if (scheduleDB.has(weekID)) {
		schedule = scheduleDB.get(weekID);
	} else {
		schedule = createSchedule(weekID, [
			['09:00', '17:30'],
			['09:00', '17:30'],
			['09:00', '17:30'],
			['09:00', '17:30'],
			['09:00', '17:30'],
		]);
	}

	return schedule;
};

app.get('/schedule-d/:date', (req, res) => {
	const schedule = getScheduleDefault(req, res);

	res.status(200).json({ schedule });
});

app.get('/week-hour-est/:date', (req, res) => {
	const schedule = getScheduleDefault(req, res);
	let totalHours = 0;

	schedule.forEach(day => {
		const daySummary = getDaySummary(day.unix);
		if (daySummary.totalHours > 0) {
			totalHours += daySummary.totalHours;
		} else {
			totalHours += day.totalHours;
		}
	});

	res.status(200).json({ totalHours });
});

app.get('/total-hours', (req, res) => {
	let totalHours = 0;

	Object.values(db.JSON()).forEach(day => {
		day.hours.forEach(hour => {
			totalHours += hour;
		});
	});

	res.status(200).json({ totalHours });
});

const createScheduleDay = (date, start_time_str, end_time_str) => {
	const start_time = new Date(
		`${date.toLocaleDateString()} ${start_time_str}`,
	);
	const end_time = new Date(`${date.toLocaleDateString()} ${end_time_str}`);

	const totalHours = (end_time - start_time) / 1000 / 60 / 60;

	return {
		date: date.toDateString(),
		day: date.getDay(),
		dayString: date.toLocaleString('default', { weekday: 'short' }),
		month: date.getMonth(),
		monthString: date.toLocaleString('default', { month: 'short' }),
		year: date.getFullYear(),
		unix: date.getTime(),
		dayOfTheMonth: date.getDate(),

		title: date.toLocaleString('default', { weekday: 'short' }),
		description:
			date.toLocaleString('default', { month: 'short' }) +
			' ' +
			date.getDate(),

		totalHours,
		start_time: start_time.getTime(),
		end_time: end_time.getTime(),
	};
};

const createSchedule = (weekID, days) => {
	const schedule = [];

	days.forEach((day, index) => {
		const date = new Date(weekID);
		date.setDate(date.getDate() + index);

		schedule.push(createScheduleDay(date, day[0], day[1]));
	});

	return schedule;
};

app.post('/create-schedule/:date', async (req, res) => {
	if (!req?.body?.schedule)
		return res.status(400).json({ error: 'No schedule provided' });
	const targetDate = formatDateString(req.params.date);
	const offset = +req.query?.offset || 0;
	const weekID = getFirstDayOfWeek(
		getWeekOffset(targetDate, offset),
	).getTime();

	const schedule = createSchedule(weekID, req.body.schedule);

	scheduleDB.set(weekID, schedule);

	await syncScheduleWithCalendar(schedule);

	res.status(200).json({ schedule });
});

app.post('/remove-schedule/:date', async (req, res) => {
	const targetDate = formatDateString(req.params.date);
	const offset = +req.query?.offset || 0;
	const weekID = getFirstDayOfWeek(
		getWeekOffset(targetDate, offset),
	).getTime();

	if (!scheduleDB.has(weekID))
		return res.status(400).json({ error: 'No schedule found' });

	let sched = scheduleDB.get(weekID);

	scheduleDB.delete(weekID);

	await syncScheduleWithCalendar(sched, true);

	res.status(200).json({ removed: true });
});

app.get('/resync', async (req, res) => {
	await fullSyncScheduleWithCalendar();

	res.status(200).json({ resynced: true });
});

app.get('/wakeup-time', (req, res) => {
	console.log('GET /wakeup-time');
	const targetDate = formatDateString(Date.now());
	const weekID = getFirstDayOfWeek(targetDate).getTime();
	const schedule = getSchedule(weekID);
	const currentDay = new Date(targetDate).getDay() - 1;

	const workStartTime = schedule[currentDay]?.start_time || null;

	if (workStartTime == null)
		return res.status(400).json({ error: 'No schedule found' });

	// Subtract 1 hour and 35 minutes from work start time
	const wakeupDate = new Date(workStartTime - 1.6 * 60 * 60 * 1000);

	const wakeupTime = wakeupDate.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});

	res.status(200).json({ wakeupTime });
});

app.get('/last-clock-in/:date', (req, res) => {
	const targetDate = formatDateString(req.params.date);
	const lastClockIn = getLastClockIn(targetDate);

	res.status(200).json({ lastClockIn });
});

app.post('/clock-in', (req, res) => {
	const targetDate = formatDate(new Date());
	const nowDate = Date.now();

	if (!db.has(targetDate.getTime())) {
		const newData = {
			hours: [],
			events: [createEvent(EVENT.CLOCK_IN)],
			last_clock_in: nowDate,
		};

		db.set(targetDate.getTime(), newData);

		res.status(200).json(newData);

		return;
	}

	if (db.get(targetDate.getTime())['last_clock_in'] != null)
		return res.status(400).json({ error: "You've already clocked in" });

	const newData = { ...db.get(targetDate.getTime()) };
	newData['events'].push(createEvent(EVENT.CLOCK_IN));
	newData['last_clock_in'] = nowDate;

	db.set(targetDate.getTime(), newData);

	res.status(200).json(newData);
});

app.post('/clock-out', (req, res) => {
	const targetDate = formatDate(new Date());
	const nowDate = Date.now();

	if (
		!db.has(targetDate.getTime()) ||
		db.get(targetDate.getTime())['last_clock_in'] == null
	)
		return res.status(400).json({ error: "You haven't clocked in yet" });

	if (db.get(targetDate.getTime())['last_clock_in'] == null)
		return res.status(400).json({ error: "You've already clocked out" });

	const newData = { ...db.get(targetDate.getTime()) };

	newData['hours'].push(
		(nowDate - newData['last_clock_in']) / 1000 / 60 / 60,
	);

	newData['events'].push(createEvent(EVENT.CLOCK_OUT));
	newData['last_clock_in'] = null;

	db.set(targetDate.getTime(), newData);

	res.status(200).json(newData);
});

app.post('/edit-hours', (req, res) => {
	const { date, hours } = req.body;
	const targetDate = formatDateString(date);

	if (!db.has(targetDate.getTime())) {
		db.set(targetDate.getTime(), {
			hours: [hours],
			events: [createEvent(EVENT.EDIT_HOURS)],
			last_clock_in: null,
		});

		return;
	}

	const newData = { ...db.get(targetDate.getTime()) };
	newData['hours'] = [hours];
	newData['events'].push(createEvent(EVENT.EDIT_HOURS));

	db.set(targetDate.getTime(), newData);

	res.status(200).json(newData);
});

app.listen(PORT, () => {
	console.log(`API active on port ${PORT}`);
});

// fullSyncScheduleWithCalendar();
