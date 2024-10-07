import { type fabric } from 'fabric';
import { useCallback, useRef } from 'react';

interface UseClipboardProps {
    canvas: fabric.Canvas | null;
}

export const useClipboard = ({ canvas }: UseClipboardProps) => {
    const clipboard = useRef<
        fabric.Object | fabric.ActiveSelection 
    >(null);

    const copy = useCallback(() => {
        canvas?.getActiveObject()?.clone((cloned: 
            fabric.Object | fabric.ActiveSelection 
        ) => {
            clipboard.current = cloned;
        });
    }, [canvas]);

    const paste = useCallback(() => {
        if (!clipboard.current) return;

        clipboard.current.clone((clonedObj: 
            fabric.Object | fabric.ActiveSelection 
        ) => {
            canvas?.discardActiveObject();
            clonedObj.set({
                left: (clonedObj.left ?? 0) + 10,
                top: (clonedObj.top ?? 0) + 10,
                evented: true
            });

            if (clonedObj.type === 'activeSelection') {
                clonedObj.canvas = canvas!;
                (clonedObj as fabric.ActiveSelection).forEachObject((obj: fabric.Object) => {
                    canvas?.add(obj);
                });
                clonedObj.setCoords();
            } else {
                canvas?.add(clonedObj);
            }

            clipboard.current && (clipboard.current.top = (clipboard.current.top ?? 0) + 10);
            clipboard.current && (clipboard.current.left = (clipboard.current.left ?? 0) + 10);
            canvas?.setActiveObject(clonedObj);
            canvas?.requestRenderAll();
        });
    }, [canvas]);

    return { copy, paste };
};
