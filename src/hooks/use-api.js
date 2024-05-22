import { useState, useEffect } from 'react';

import fetcher from '@/Utils/fetcher.js';

function useAPI(url) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(Math.random());

    const doRefresh = () => setRefresh(Math.random());

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const fetchData = async () => {
            try {
                const _data = await fetcher(url);
                if (_data.error) {
                    throw new Error(_data.error);
                }
                setData(_data);
                setIsLoading(false);
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [url, refresh]);

    return { data, isLoading, error, doRefresh };
}

export default useAPI;