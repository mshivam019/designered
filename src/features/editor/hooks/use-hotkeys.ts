import { useEvent } from 'react-use';

import { type CanvasObject } from '@/features/editor/types';

interface UseHotkeysProps {
    undo: () => void;
    redo: () => void;
    save: (skip?: boolean) => void;
    copy: () => void;
    paste: () => void;
    objects: CanvasObject[];
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
}

export const useHotkeys = ({
    undo,
    redo,
    save,
    copy,
    paste,
    objects,
    selectedIds,
    setSelectedIds,
    setObjects
}: UseHotkeysProps) => {
    useEvent('keydown', (event: KeyboardEvent) => {
        const isCtrlKey = event.ctrlKey || event.metaKey;
        const isBackspace = event.key === 'Backspace';
        const isInput = ['INPUT', 'TEXTAREA'].includes(
            (event.target as HTMLElement).tagName
        );

        if (isInput) return;

        if (isBackspace) {
            setObjects((prev) =>
                prev.filter((o) => !selectedIds.includes(o.id))
            );
            setSelectedIds([]);
        }

        if (isCtrlKey && event.key === 'z') {
            event.preventDefault();
            undo();
        }

        if (isCtrlKey && event.key === 'y') {
            event.preventDefault();
            redo();
        }

        if (isCtrlKey && event.key === 'c') {
            event.preventDefault();
            copy();
        }

        if (isCtrlKey && event.key === 'v') {
            event.preventDefault();
            paste();
        }

        if (isCtrlKey && event.key === 's') {
            event.preventDefault();
            save(true);
        }

        if (isCtrlKey && event.key === 'a') {
            event.preventDefault();
            setSelectedIds(objects.map((o) => o.id));
        }
    });
};
