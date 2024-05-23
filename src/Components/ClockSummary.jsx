import React, { useState, useEffect, useMemo } from 'react';

import DynamicWeek from '@/Components/DynamicWeek.jsx';

import useAPI from '@/hooks/use-api';

import { useStore } from '@/hooks/use-store.jsx';

const ClockSummary = ({ date }) => {
	const [store, setStore] = useStore();

	const { data, error, loading, doRefresh } = useAPI(`last-clock-in/${date}`);

	useEffect(() => {
		let interval;

		if (doRefresh) {
			setStore('clockRefresh', doRefresh);

			interval = setInterval(doRefresh, 1000);

			return () => clearInterval(interval);
		}
	}, [data, error, loading]);

	// hh:mm:ss
	const timeSince = date => {
		const now = new Date();
		const diff = now - date;
		const hours = Math.floor(diff / 1000 / 60 / 60);
		const minutes = Math.floor(diff / 1000 / 60) - hours * 60;
		const seconds =
			Math.floor(diff / 1000) - hours * 60 * 60 - minutes * 60;
		return `${hours.toString().padStart(2, '0')}:${minutes
			.toString()
			.padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	};

	const hoursSince = date => {
		const now = new Date();
		const diff = now - date;
		const hours = diff / 1000 / 60 / 60;
		return hours;
	};

	return !loading && (error || data?.lastClockIn == null) ? (
		<DynamicWeek date={date} />
	) : (
		<div className="w-full flex-grow max-h-[100%] pt-3">
			<h2 className="text-4xl text-center">Clocked In</h2>

			<div className="flex flex-col items-center justify-center gap-1">
				<p className="text-xl mt-5">You clocked in at:</p>
				<p className="text-3xl">
					{new Date(data.lastClockIn).toLocaleTimeString()}
				</p>

				<p className="text-xl mt-5">You have been clocked in for:</p>
				<p className="text-3xl">
					{timeSince(new Date(data.lastClockIn))}
				</p>

				<p className="text-xl mt-5">You have earned:</p>
				<p className="text-3xl">
					{`$${(hoursSince(new Date(data.lastClockIn)) * 12).toFixed(
						2,
					)}`}
				</p>
			</div>
		</div>
	);
};

export default ClockSummary;
