const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

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

const JSONdb = require('simple-json-db');
const db = new JSONdb('./db.json');

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

app.get('/week-summary/:date', (req, res) => {
	const targetDate = formatDateString(req.params.date);
	const week = getWeekSummary(targetDate);

	res.status(200).json(week);
});

app.get('/week-total/:date', (req, res) => {
	const targetDate = formatDateString(req.params.date);
	const week = getWeekSummary(targetDate);
	let totalHours = 0;

	week.forEach(day => {
		totalHours += day.totalHours;
	});

	let totalPay = totalHours * HOURLY_PAY;

	res.status(200).json({ totalHours, totalPay });
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

app.use(express.json());

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
