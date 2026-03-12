import { useState, useEffect } from 'react';

const COMPACT_WIDTH_THRESHOLD = 240;
const COMPACT_HEIGHT_THRESHOLD = 220;
const MIN_DOCK_TILE_SIZE = 28; // px
const MAX_DOCK_TILE_SIZE = 200; // px
const DEFAULT_TILE_SIZE = 56; // px (matches 3.5rem default)
const DOCK_TILE_VIEWPORT_RATIO = 0.8; // change this ratio to adjust dock tile scaling

function getLayoutState() {
    if (typeof window === 'undefined') {
        return { isCompact: false, isHorizontal: false, dockTileSize: DEFAULT_TILE_SIZE };
    }

    const viewportWidth = window.document.documentElement.clientWidth || window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isWidthCompact = viewportWidth < COMPACT_WIDTH_THRESHOLD;
    const isHeightCompact = viewportHeight < COMPACT_HEIGHT_THRESHOLD;
    const isCompact = isWidthCompact || isHeightCompact;
    const isHorizontal = viewportWidth >= viewportHeight;

    let dockTileSize = DEFAULT_TILE_SIZE;
    if (isCompact) {
        const baseDimension = Math.min(viewportWidth, viewportHeight);
        const ratioSize = baseDimension * DOCK_TILE_VIEWPORT_RATIO;
        dockTileSize = Math.max(
            MIN_DOCK_TILE_SIZE,
            Math.min(MAX_DOCK_TILE_SIZE, ratioSize)
        );
    }

    return { isCompact, isHorizontal, dockTileSize };
}

export function useWindowLayout() {
    const [layout, setLayout] = useState(getLayoutState());

    useEffect(() => {
        const handleResize = () => setLayout(getLayoutState());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return layout;
}
