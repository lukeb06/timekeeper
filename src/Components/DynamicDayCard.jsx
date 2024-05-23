import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/hooks/use-store.jsx';

import DayCard from '@/Components/DayCard.jsx';

import useAPI from '@/hooks/use-api';

const DynamicDayCard = ({ date, featured }) => {
	const { data, error, loading, doRefresh } = useAPI(`day-summary/${date}`);

	return (
		<>
			<DayCard
				daySummary={data && !loading ? data : {}}
				featured={featured}
				refresh={doRefresh}
			/>
		</>
	);
};

export default DynamicDayCard;
