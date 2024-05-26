import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/hooks/use-store.jsx';

import DynamicWeek from '@/Components/DynamicWeek';

import useAPI from '@/hooks/use-api.js';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/Components/ui/card';

const WeekContainer = ({ date, className }) => {
	return (
		<div className={`!overflow-y-hidden flex-grow`}>
			{/* <DynamicWeek date={date} /> */}
		</div>
	);
};

export const WeekCard = ({ date, className }) => {
	const [store, setStore] = useStore();
	const { data, error, loading, doRefresh } = useAPI(`week-total/${date}`);

	useEffect(() => {
		doRefresh();
	}, [store.forceRefresh]);

	return (
		<div
			className={`p-4 pb-0 h-fit max-w-[400px] min-w-[300px] ${className}`}
		>
			<Card className={`bg-accent ${className}`}>
				<CardHeader>
					<CardTitle>This Week</CardTitle>
				</CardHeader>

				<CardContent>
					{data && !loading ? (
						<>
							<p className="text-lg">
								Total Hours: {(+data.totalHours).toFixed(1)}
							</p>
							<p className="text-lg">
								Total Pay: ${(+data.totalPay).toFixed(2)}
							</p>
						</>
					) : (
						<></>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default WeekContainer;
