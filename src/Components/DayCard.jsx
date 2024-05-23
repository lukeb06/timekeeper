import React, { useState, useEffect, useMemo } from 'react';

import useAPI from '@/hooks/use-api.js';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/Components/ui/card';

import { Button } from '@/Components/ui/button';

import fetcher from '@/Utils/fetcher.js';

import { useStore } from '@/hooks/use-store.jsx';

const DayCard = ({ daySummary, featured, refresh }) => {
	const [store, setStore] = useStore();

	const { data, error, loading, doRefresh } = useAPI(
		`last-clock-in/${daySummary.unix}`,
	);

	const clockIn = async e => {
		e.target.disabled = true;

		const response = await fetcher('clock-in', { method: 'POST' });
		if (response.error) alert(response.error);

		e.target.disabled = false;

		doRefresh();
		store.clockRefresh();
	};

	const clockOut = async e => {
		e.target.disabled = true;

		const response = await fetcher('clock-out', { method: 'POST' });
		if (response.error) alert(response.error);

		e.target.disabled = false;

		refresh();
		doRefresh();
		store.clockRefresh();
	};

	return (
		<div className="p-4 h-fit max-w-[400px] min-w-[300px]">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle>
						{featured ? 'Today' : daySummary.title}
					</CardTitle>
					<CardDescription>{daySummary.description}</CardDescription>
				</CardHeader>

				<CardContent className="text-lg">
					<p>Pay: ${(+daySummary.pay).toFixed(2)}</p>
					<p>Hours Worked: {(+daySummary.totalHours).toFixed(1)}</p>
				</CardContent>

				<CardFooter className="flex flex-row justify-between">
					{featured ? (
						data && !loading && !error ? (
							<>
								<Button variant="outline">View Details</Button>
								{data.lastClockIn ? (
									<Button onClick={clockOut}>
										Clock Out
									</Button>
								) : (
									<Button onClick={clockIn}>Clock In</Button>
								)}
							</>
						) : (
							<></>
						)
					) : (
						<>
							<Button>View Details</Button>
							<Button variant="outline">Edit Hours</Button>
						</>
					)}
				</CardFooter>
			</Card>
		</div>
	);
};

export default DayCard;
