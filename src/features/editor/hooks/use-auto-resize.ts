import { useCallback, useState } from 'react';

interface UseAutoResizeProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    pageWidth: number;
    pageHeight: number;
}

export const useAutoResize = ({
    containerRef,
    pageWidth,
    pageHeight
}: UseAutoResizeProps) => {
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
    const [zoom, setZoom] = useState(1);

    const autoZoom = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        if (containerWidth === 0 || containerHeight === 0) return;

        const zoomRatio = 0.95;
        const scaleX = containerWidth / pageWidth;
        const scaleY = containerHeight / pageHeight;
        const newZoom = Math.min(scaleX, scaleY) * zoomRatio;

        setStageSize({ width: containerWidth, height: containerHeight });
        setZoom(newZoom);
    }, [containerRef, pageWidth, pageHeight]);

    return { autoZoom, stageSize, zoom };
};
