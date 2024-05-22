import React, { createContext, useContext, useState } from 'react';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
    const [state, setState] = useState({});

    const set = (key, value) => {
        setState({ ...state, [key]: value });
    }
    
    return (
        <StoreContext.Provider value={[state, set]}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    return useContext(StoreContext);
};