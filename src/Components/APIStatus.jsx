import React, { useState, useEffect } from 'react';
import useAPI from '@/hooks/use-api.js';

import LoadSpinner from '@/Components/LoadSpinner.jsx';

const APIStatus = () => {
	const { data, isLoading, error } = useAPI('status');

	return <>{isLoading ? <LoadSpinner /> : error ? error : data?.status}</>;
};

export default APIStatus;
