import { useState, useEffect } from 'react';

export function useMediaQuery(_query) {
    const [matches, setMatches] = useState(window.matchMedia(_query).matches);

    useEffect(() => {
        const media = window.matchMedia(_query);
        media.onchange = e => setMatches(e.matches);;

        return () => {
            media.onchange = null;
        };
    }, [_query]);

    return matches;
}

export const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
};

export const query = {
    sm: `(min-width: ${breakpoints.sm}px)`,
    md: `(min-width: ${breakpoints.md}px)`,
    lg: `(min-width: ${breakpoints.lg}px)`,
    xl: `(min-width: ${breakpoints.xl}px)`,
    xxl: `(min-width: ${breakpoints.xxl}px)`,
};