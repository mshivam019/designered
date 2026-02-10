import { useCallback, useRef } from 'react';
import { v4 as uuid } from 'uuid';

import { type CanvasObject } from '@/features/editor/types';

interface UseClipboardProps {
    objects: CanvasObject[];
    setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    save: () => void;
}

export const useClipboard = ({
    objects,
    setObjects,
    selectedIds,
    setSelectedIds,
    save
}: UseClipboardProps) => {
    const clipboard = useRef<CanvasObject[]>([]);

    const copy = useCallback(() => {
        const selected = objects.filter((o) => selectedIds.includes(o.id));
        clipboard.current = structuredClone(selected);
    }, [objects, selectedIds]);

    const paste = useCallback(() => {
        if (clipboard.current.length === 0) return;

        const pasted = clipboard.current.map((obj) => ({
            ...structuredClone(obj),
            id: uuid(),
            x: (obj.x ?? 0) + 10,
            y: (obj.y ?? 0) + 10
        }));

        setObjects((prev) => [...prev, ...pasted]);
        setSelectedIds(pasted.map((o) => o.id));

        // Offset clipboard for next paste
        clipboard.current = clipboard.current.map((o) => ({
            ...o,
            x: (o.x ?? 0) + 10,
            y: (o.y ?? 0) + 10
        }));

        save();
    }, [setObjects, setSelectedIds, save]);

    return { copy, paste };
};
