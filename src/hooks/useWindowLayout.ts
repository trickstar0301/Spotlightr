import { useState, useEffect } from 'react';

const COMPACT_THRESHOLD = 400;

export function useWindowLayout() {
    const [isCompact, setIsCompact] = useState(
        window.innerWidth < COMPACT_THRESHOLD || window.innerHeight < COMPACT_THRESHOLD
    );
    const [isHorizontal, setIsHorizontal] = useState(window.innerWidth >= window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setIsCompact(
                window.innerWidth < COMPACT_THRESHOLD || window.innerHeight < COMPACT_THRESHOLD
            );
            setIsHorizontal(window.innerWidth >= window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { isCompact, isHorizontal };
}
