import React, { useState, useEffect, useMemo, useRef } from 'react';
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

import { Button } from '@/Components/ui/button';

import { useNavigate } from 'react-router-dom';

import fetcher from '@/Utils/fetcher.js';

const WeekContainer = ({ date, className }) => {
	return (
		<div className={`!overflow-y-hidden flex-grow`}>
			{/* <DynamicWeek date={date} /> */}
		</div>
	);
};

export const WeekCard = ({ date, className }) => {
	const navigate = useNavigate();

	const buttonRef = useRef();

	const [store, setStore] = useStore();
	const { data, loading, doRefresh } = useAPI(
		`week-total/${date}?offset=${encodeURIComponent(store?.offset || 0)}`,
	);

	useEffect(() => {
		doRefresh();
	}, [store.forceRefresh]);

	useEffect(() => {
		setStore('offset', 0);
	}, []);

	useEffect(() => {
		const getTitle = () => {
			const offset = store?.offset || 0;
			if (offset == 0) return 'This Week';
			if (offset == 1) return 'Next Week';
			if (offset == -1) return 'Last Week';

			if (offset > 1) return `${offset} Weeks Ahead`;
			if (offset < -1) return `${Math.abs(offset)} Weeks Ago`;
		};

		setStore('weekTitle', getTitle());
	}, [store.offset]);

	const increaseOffset = () => {
		setStore('offset', (store?.offset || 0) + 1);
		doRefresh();
	};

	const decreaseOffset = () => {
		setStore('offset', (store?.offset || 0) - 1);
		doRefresh();
	};

	const resync = async () => {
		buttonRef.current.disabled = true;

		const response = await fetcher('resync');

		buttonRef.current.disabled = false;

		if (response.error) {
			alert(response.error);
			return;
		}
	};

	return (
		<div
			className={`p-4 pb-0 h-fit max-w-[400px] min-w-[300px] ${className}`}
		>
			<Card className={`bg-accent ${className}`}>
				<CardHeader className="pb-2">
					<CardTitle>{store.weekTitle || 'This Week'}</CardTitle>
				</CardHeader>

				<CardContent className="pb-3 flex flex-row md:flex-col items-start md:items-center justify-between">
					<div>
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
					</div>

					<div className="justify-center flex flex-col gap-1 -translate-y-7 md:-translate-y-0">
						<div className="flex flex-row items-center gap-2">
							<Button
								variant="ghost"
								className="text-xl aspect-square"
								onClick={decreaseOffset}
							>
								&lt;
							</Button>
							<span className="text-lg min-w-[2rem] text-center">
								{store?.offset || 0}
							</span>
							<Button
								variant="ghost"
								className="text-xl aspect-square"
								onClick={increaseOffset}
							>
								&gt;
							</Button>
						</div>
						<Button
							onClick={() => {
								navigate('/schedule');
							}}
						>
							View Schedule
						</Button>
						<Button
							variant="outline"
							className="bg-card disabled:bg-accent"
							onClick={resync}
							ref={buttonRef}
						>
							Sync Calendar
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default WeekContainer;
