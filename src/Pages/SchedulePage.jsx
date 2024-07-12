import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/hooks/use-store.jsx';

import useAPI from '@/hooks/use-api.js';

import { Schedule } from '@/Components/Schedule.jsx';

export const SchedulePage = () => {
	return <Schedule date={Date.now()} />;
};

export default SchedulePage;
