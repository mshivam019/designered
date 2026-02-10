import { useCallback, useRef } from 'react';
import type Konva from 'konva';
import type { CanvasObject } from '@/features/editor/types';

const GUIDELINE_OFFSET = 5; // snap threshold in px

interface Guide {
    lineGuide: number;
    offset: number;
    orientation: 'V' | 'H';
    snap: 'start' | 'center' | 'end';
}

/**
 * Provides drag-snap alignment guides for Konva objects.
 *
 * Usage:
 *   const { onDragMove, onDragEnd, guides } = useSnapping({ objects, pageWidth, pageHeight });
 *   // Render guide <Line> components from `guides`
 *   // Attach onDragMove / onDragEnd to each draggable shape
 */
export const useSnapping = ({
    objects,
    pageWidth,
    pageHeight
}: {
    objects: CanvasObject[];
    pageWidth: number;
    pageHeight: number;
}) => {
    const guidesRef = useRef<Guide[]>([]);

    /**
     * Collect all possible snap lines from page edges, page center,
     * and other objects' edges/centers.
     */
    const getLineGuideStops = useCallback(
        (skipId: string) => {
            const vertical: number[] = [0, pageWidth / 2, pageWidth];
            const horizontal: number[] = [0, pageHeight / 2, pageHeight];

            for (const obj of objects) {
                if (obj.id === skipId) continue;

                const w = (obj.width ?? 0) * obj.scaleX;
                const h = (obj.height ?? 0) * obj.scaleY;

                // Circles use radius
                if (obj.type === 'circle') {
                    const r = (obj.radius ?? 0) * obj.scaleX;
                    vertical.push(obj.x - r, obj.x, obj.x + r);
                    horizontal.push(obj.y - r, obj.y, obj.y + r);
                } else {
                    vertical.push(obj.x, obj.x + w / 2, obj.x + w);
                    horizontal.push(obj.y, obj.y + h / 2, obj.y + h);
                }
            }

            return { vertical, horizontal };
        },
        [objects, pageWidth, pageHeight]
    );

    /**
     * Get snapping edges of the node being dragged.
     */
    const getObjectSnappingEdges = useCallback((node: Konva.Node) => {
        const box = node.getClientRect({ relativeTo: node.getLayer()! });

        return {
            vertical: [
                {
                    guide: box.x,
                    offset: node.x() - box.x,
                    snap: 'start' as const
                },
                {
                    guide: box.x + box.width / 2,
                    offset: node.x() - box.x - box.width / 2,
                    snap: 'center' as const
                },
                {
                    guide: box.x + box.width,
                    offset: node.x() - box.x - box.width,
                    snap: 'end' as const
                }
            ],
            horizontal: [
                {
                    guide: box.y,
                    offset: node.y() - box.y,
                    snap: 'start' as const
                },
                {
                    guide: box.y + box.height / 2,
                    offset: node.y() - box.y - box.height / 2,
                    snap: 'center' as const
                },
                {
                    guide: box.y + box.height,
                    offset: node.y() - box.y - box.height,
                    snap: 'end' as const
                }
            ]
        };
    }, []);

    /**
     * Find the closest guides within the snap threshold.
     */
    const getGuides = useCallback(
        (
            lineGuideStops: { vertical: number[]; horizontal: number[] },
            itemBounds: ReturnType<typeof getObjectSnappingEdges>
        ): Guide[] => {
            const resultV: Guide[] = [];
            const resultH: Guide[] = [];

            for (const itemEdge of itemBounds.vertical) {
                for (const lineGuide of lineGuideStops.vertical) {
                    const diff = Math.abs(lineGuide - itemEdge.guide);
                    if (diff < GUIDELINE_OFFSET) {
                        resultV.push({
                            lineGuide,
                            offset: itemEdge.offset,
                            orientation: 'V',
                            snap: itemEdge.snap
                        });
                    }
                }
            }

            for (const itemEdge of itemBounds.horizontal) {
                for (const lineGuide of lineGuideStops.horizontal) {
                    const diff = Math.abs(lineGuide - itemEdge.guide);
                    if (diff < GUIDELINE_OFFSET) {
                        resultH.push({
                            lineGuide,
                            offset: itemEdge.offset,
                            orientation: 'H',
                            snap: itemEdge.snap
                        });
                    }
                }
            }

            // Pick the closest snap per orientation
            const closestV = resultV.sort(
                (a, b) =>
                    Math.abs(a.lineGuide - a.offset) -
                    Math.abs(b.lineGuide - b.offset)
            )[0];
            const closestH = resultH.sort(
                (a, b) =>
                    Math.abs(a.lineGuide - a.offset) -
                    Math.abs(b.lineGuide - b.offset)
            )[0];

            const guides: Guide[] = [];
            if (closestV) guides.push(closestV);
            if (closestH) guides.push(closestH);
            return guides;
        },
        [getObjectSnappingEdges]
    );

    const onDragMove = useCallback(
        (e: Konva.KonvaEventObject<DragEvent>) => {
            const node = e.target;
            const nodeId = node.id();

            const lineGuideStops = getLineGuideStops(nodeId);
            const itemBounds = getObjectSnappingEdges(node);
            const guides = getGuides(lineGuideStops, itemBounds);

            guidesRef.current = guides;

            // Apply snapping
            for (const lg of guides) {
                if (lg.orientation === 'V') {
                    node.x(lg.lineGuide + lg.offset);
                } else {
                    node.y(lg.lineGuide + lg.offset);
                }
            }

            // Force redraw the layer so guide lines render
            node.getLayer()?.batchDraw();
        },
        [getLineGuideStops, getObjectSnappingEdges, getGuides]
    );

    const onDragEnd = useCallback(() => {
        guidesRef.current = [];
    }, []);

    return { onDragMove, onDragEnd, guidesRef };
};
