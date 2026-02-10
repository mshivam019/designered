import { useCallback, useRef, useState } from 'react';

import { type CanvasObject, type PageJson } from '@/features/editor/types';

interface UseHistoryProps {
    objects: CanvasObject[];
    setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
    background: string;
    setBackground: (value: string) => void;
    saveCallback?: (values: {
        json: string;
        height: number;
        width: number;
        pageNumber: number;
    }) => void;
    pageWidth: number;
    pageHeight: number;
}

export const useHistory = ({
    objects,
    setObjects,
    background,
    setBackground,
    saveCallback,
    pageWidth,
    pageHeight
}: UseHistoryProps) => {
    const [historyIndex, setHistoryIndex] = useState(0);
    const canvasHistory = useRef<string[]>([
        JSON.stringify({ objects: [], background: 'white' })
    ]);
    const skipSave = useRef(false);

    // Refs for stable save callback — prevents save from changing identity
    // every time objects/background change, which would cascade through
    // buildEditor → editor useMemo → all children re-render.
    const objectsRef = useRef(objects);
    objectsRef.current = objects;
    const backgroundRef = useRef(background);
    backgroundRef.current = background;
    const historyIndexRef = useRef(historyIndex);
    historyIndexRef.current = historyIndex;
    const pageWidthRef = useRef(pageWidth);
    pageWidthRef.current = pageWidth;
    const pageHeightRef = useRef(pageHeight);
    pageHeightRef.current = pageHeight;

    const canUndo = useCallback(() => {
        return historyIndex > 0;
    }, [historyIndex]);

    const canRedo = useCallback(() => {
        return historyIndex < canvasHistory.current.length - 1;
    }, [historyIndex]);

    const save = useCallback(
        (skip = false) => {
            const data: PageJson = {
                objects: objectsRef.current,
                background: backgroundRef.current
            };
            const json = JSON.stringify(data);

            if (!skip && !skipSave.current) {
                canvasHistory.current = canvasHistory.current.slice(
                    0,
                    historyIndexRef.current + 1
                );
                canvasHistory.current.push(json);
                setHistoryIndex(canvasHistory.current.length - 1);
            }

            saveCallback?.({
                json,
                height: pageHeightRef.current,
                width: pageWidthRef.current,
                pageNumber: 1
            });
        },
        [saveCallback]
    );

    const undo = useCallback(() => {
        if (!canUndo()) return;

        skipSave.current = true;
        const previousIndex = historyIndex - 1;
        const previousStateString = canvasHistory.current[previousIndex];
        if (!previousStateString) return;

        const previousState = JSON.parse(previousStateString) as PageJson;
        setObjects(previousState.objects ?? []);
        setBackground(previousState.background ?? 'white');
        setHistoryIndex(previousIndex);
        skipSave.current = false;
    }, [canUndo, historyIndex, setObjects, setBackground]);

    const redo = useCallback(() => {
        if (!canRedo()) return;

        skipSave.current = true;
        const nextIndex = historyIndex + 1;
        const nextStateString = canvasHistory.current[nextIndex];
        if (!nextStateString) return;

        const nextState = JSON.parse(nextStateString) as PageJson;
        setObjects(nextState.objects ?? []);
        setBackground(nextState.background ?? 'white');
        setHistoryIndex(nextIndex);
        skipSave.current = false;
    }, [canRedo, historyIndex, setObjects, setBackground]);

    return {
        save,
        canUndo,
        canRedo,
        undo,
        redo,
        setHistoryIndex,
        canvasHistory
    };
};
