import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '@/hooks/use-store.jsx';

import useAPI from '@/hooks/use-api.js';

import { Button } from '@/Components/ui/button';

import fetcher from '@/Utils/fetcher.js';

import { useNavigate } from 'react-router-dom';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/Components/ui/card';

function _copyToClipboard(string) {
	let textarea;
	let result;

	try {
		textarea = document.createElement('textarea');
		textarea.setAttribute('readonly', true);
		textarea.setAttribute('contenteditable', true);
		textarea.style.position = 'fixed'; // prevent scroll from jumping to the bottom when focus is set.
		textarea.value = string;

		document.body.appendChild(textarea);

		textarea.focus();
		textarea.select();

		const range = document.createRange();
		range.selectNodeContents(textarea);

		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);

		textarea.setSelectionRange(0, textarea.value.length);
		result = document.execCommand('copy');
	} catch (err) {
		console.error(err);
		result = null;
	} finally {
		document.body.removeChild(textarea);
	}

	// manual copy fallback using prompt
	if (!result) {
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
		const copyHotkey = isMac ? '⌘C' : 'CTRL+C';
		result = prompt(`Press ${copyHotkey}`, string); // eslint-disable-line no-alert
		if (!result) {
			return false;
		}
	}
	return true;
}

// Convert from 17:30 to 5:30 PM
const formatTime = (time, showPeriod = true) => {
	const [hours, minutes] = time.split(':');
	const hour = hours % 12 || 12;
	const period = hours >= 12 ? ' PM' : ' AM';

	return `${hour}:${minutes}${showPeriod ? period : ''}`;
};

export const Schedule = ({ date }) => {
	const navigate = useNavigate();

	const buttonRef = useRef();

	const [store, setStore] = useStore();
	const { data } = useAPI(
		`schedule/${date}?offset=${encodeURIComponent(store?.offset || 0)}`,
	);

	const totalHours = useMemo(() => {
		if (!data) return 0;

		return data.schedule.reduce((acc, day) => {
			return acc + day.totalHours;
		}, 0);
	});

	const copyToClipboard = () => {
		let copy = [...data.schedule]
			.map(day => {
				return `${day.title}: ${formatTime(new Date(day.start_time).toLocaleTimeString(), false)}-${formatTime(new Date(day.end_time).toLocaleTimeString(), false)}`;
			})
			.join('\n');

		let copyText = `Schedule ${data.schedule[0].month + 1}/${data.schedule[0].dayOfTheMonth}-${data.schedule[data.schedule.length - 1].month + 1}/${data.schedule[data.schedule.length - 1].dayOfTheMonth}`;
		_copyToClipboard(`${copyText}\n${copy}`);
	};

	const remove = async () => {
		buttonRef.current.disabled = true;

		const response = await fetcher(
			`remove-schedule/${date}?offset=${encodeURIComponent(store?.offset || 0)}`,
			{
				method: 'POST',
			},
		);

		buttonRef.current.disabled = false;

		if (response.error) {
			alert(response.error);
			return;
		}

		navigate('/');
	};

	return (
		<div className="px-4 pt-4">
			<div className="mb-4 flex flex-row justify-between items-center">
				<Button
					onClick={() => {
						navigate('/');
					}}
					variant="destructive"
				>
					Go back
				</Button>

				<div>
					{totalHours} Hours {store.weekTitle || 'This Week'}
				</div>

				<Button ref={buttonRef} onClick={remove}>
					Delete
				</Button>
			</div>

			{data?.schedule?.map((day, index) => {
				return <DaySection key={index} day={day} />;
			})}

			{data && data.schedule && data.schedule.length < 1 ? (
				<div className="pt-[20vh]">
					<h1 className="text-xl text-center mb-3">
						No schedule found for this week.
					</h1>

					<Button
						onClick={() => {
							navigate('/schedule/create');
						}}
						className="mx-auto block"
					>
						Create Schedule
					</Button>
				</div>
			) : (
				<></>
			)}
		</div>
	);
};

const DaySection = ({ day }) => {
	return (
		<Card className="p-4 flex flex-row justify-between mb-3">
			<div>
				<CardTitle>{day.title}</CardTitle>
				<CardDescription>{day.description}</CardDescription>
				<CardDescription>{day.totalHours} hrs</CardDescription>
			</div>

			<div className="flex flex-col">
				<span>Start Time</span>
				<span>
					{formatTime(
						new Date(day.start_time).getHours() +
							':' +
							(`${new Date(day.start_time).getMinutes()}`.length <
							2
								? `0${new Date(day.start_time).getMinutes()}`
								: new Date(day.start_time).getMinutes()),
						true,
					)}
				</span>
			</div>

			<div className="flex flex-col">
				<span>End Time</span>
				<span>
					{formatTime(
						new Date(day.end_time).getHours() +
							':' +
							(`${new Date(day.end_time).getMinutes()}`.length < 2
								? `0${new Date(day.end_time).getMinutes()}`
								: new Date(day.end_time).getMinutes()),
						true,
					)}
				</span>
			</div>
		</Card>
	);
};
