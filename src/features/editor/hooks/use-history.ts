import { type fabric } from 'fabric';
import { useCallback, useRef, useState } from 'react';

import { JSON_KEYS } from '@/features/editor/types';

interface UseHistoryProps {
    canvas: fabric.Canvas | null;
    saveCallback?: (values: {
        json: string;
        height: number;
        width: number;
    }) => void;
}

export const useHistory = ({ canvas, saveCallback }: UseHistoryProps) => {
    const [historyIndex, setHistoryIndex] = useState(0);
    const canvasHistory = useRef<string[]>([]);
    const skipSave = useRef(false);

    const canUndo = useCallback(() => {
        return historyIndex > 0;
    }, [historyIndex]);

    const canRedo = useCallback(() => {
        return historyIndex < canvasHistory.current.length - 1;
    }, [historyIndex]);

    const save = useCallback(
        (skip = false) => {
            if (!canvas) return;

            const currentState = canvas.toJSON(JSON_KEYS);
            const json = JSON.stringify(currentState);

            if (!skip && !skipSave.current) {
                canvasHistory.current.push(json);
                setHistoryIndex(canvasHistory.current.length - 1);
            }

            const workspace = canvas
                .getObjects()
                .find((object) => object.name === 'clip');
            const height = workspace?.height ?? 0;
            const width = workspace?.width ?? 0;

            saveCallback?.({ json, height, width });
        },
        [canvas, saveCallback]
    );

    const undo = useCallback(() => {
        if (canUndo()) {
            skipSave.current = true;
            canvas?.clear().renderAll();

            const previousIndex = historyIndex - 1;
            const previousStateString = canvasHistory.current[previousIndex];
            if (!previousStateString) return;
            const previousState = JSON.parse(
                previousStateString
            ) as fabric.Canvas;

            canvas?.loadFromJSON(previousState, () => {
                canvas.renderAll();
                setHistoryIndex(previousIndex);
                skipSave.current = false;
            });
        }
    }, [canUndo, canvas, historyIndex]);

    const redo = useCallback(() => {
        if (canRedo()) {
            skipSave.current = true;
            canvas?.clear().renderAll();

            const nextIndex = historyIndex + 1;
            const nextStateString = canvasHistory.current[nextIndex];
            if (!nextStateString) return;
            const nextState = JSON.parse(nextStateString) as fabric.Canvas;

            canvas?.loadFromJSON(nextState, () => {
                canvas.renderAll();
                setHistoryIndex(nextIndex);
                skipSave.current = false;
            });
        }
    }, [canvas, historyIndex, canRedo]);

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
