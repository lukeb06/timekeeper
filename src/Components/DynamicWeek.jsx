import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/hooks/use-store.jsx';

import DayCard from '@/Components/DayCard.jsx';

import useAPI from '@/hooks/use-api';

const DynamicWeek = ({ date }) => {
	const { data, error, loading } = useAPI(`week-summary/${date}`);

	return (
		<div className="w-full flex-grow max-h-[100%] flex flex-row flex-wrap overflow-y-auto gap-1 justify-center">
			{data && !loading && data.length > 0 ? (
				data.map((daySummary, index) => {
					return <DayCard key={index} daySummary={daySummary} />;
				})
			) : (
				<></>
			)}
		</div>
	);
};

export default DynamicWeek;
