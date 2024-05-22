import React, { useState, useEffect, createContext, useContext } from 'react';

const LocalStorageContext = createContext();

export const LocalStorageProvider = ({ children }) => {
    const [state, setState] = useState({});

    useEffect(() => {
        const storage = localStorage.getItem('state');
        if (storage) {
            setState(JSON.parse(storage));
        }
    }, []);

    const set = (key, value) => {
        const newState = { ...state, [key]: value };
        localStorage.setItem('state', JSON.stringify(newState));
        setState(newState);
    }

    return (
        <LocalStorageContext.Provider value={[state, set]}>
            {children}
        </LocalStorageContext.Provider>
    );
};

export const useLocalStorage = () => {
    return useContext(LocalStorageContext);
};