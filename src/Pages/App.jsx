import React, { useState, useEffect, useMemo } from 'react';

import DynamicWeek from '@/Components/DynamicWeek.jsx';
import { WeekCard } from '@/Components/WeekContainer';
import DynamicDayCard from '@/Components/DynamicDayCard';
import ClockSummary from '@/Components/ClockSummary.jsx';

import { useMediaQuery, query } from '@/hooks/use-media-query';

const App = () => {
	const isDesktop = useMediaQuery(query.md);

	return (
		<>
			{isDesktop ? (
				<div className="flex flex-row gap-10 justify-center border-b-2 border-b-accent">
					<WeekCard date={Date.now()} className="h-full pb-4" />
					<DynamicDayCard date={Date.now()} featured={true} />
				</div>
			) : (
				<div className="border-b-2 border-b-accent">
					<WeekCard date={Date.now()} />
					<DynamicDayCard date={Date.now()} featured={true} />
				</div>
			)}
			{/* <DynamicWeek date={Date.now()} /> */}

			<ClockSummary date={Date.now()} />
		</>
	);
};

export default App;
