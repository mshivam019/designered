import {
    Copy,
    Clipboard,
    CopyPlus,
    ArrowUp,
    ArrowDown,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Trash2
} from 'lucide-react';
import { useEffect, useRef } from 'react';

import { type CanvasObject } from '@/features/editor/types';
import { cn } from '@/lib/utils';

interface CanvasContextMenuProps {
    visible: boolean;
    x: number;
    y: number;
    targetObjectId: string | null;
    targetObject: CanvasObject | null;
    onCopy: () => void;
    onPaste: () => void;
    onDuplicate: () => void;
    onBringForward: () => void;
    onSendBackward: () => void;
    onToggleLock: (id: string) => void;
    onToggleVisibility: (id: string) => void;
    onDelete: () => void;
    onClose: () => void;
}

export const CanvasContextMenu = ({
    visible,
    x,
    y,
    targetObjectId,
    targetObject,
    onCopy,
    onPaste,
    onDuplicate,
    onBringForward,
    onSendBackward,
    onToggleLock,
    onToggleVisibility,
    onDelete,
    onClose
}: CanvasContextMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (visible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [visible, onClose]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (visible) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [visible, onClose]);

    if (!visible) return null;

    const isObjectSelected = !!targetObjectId && !!targetObject;
    const isLocked = targetObject?.locked ?? false;
    const isVisible = targetObject?.visible ?? true;

    // Adjust position if near screen edges
    const menuWidth = 220;
    const menuHeight = 300; // Approximate
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

    const adjustedX = x + menuWidth > screenWidth ? x - menuWidth : x;
    const adjustedY = y + menuHeight > screenHeight ? y - menuHeight : y;

    return (
        <div
            ref={menuRef}
            className="fixed z-50 min-w-[180px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            style={{ top: adjustedY, left: adjustedX }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Copy */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    if (isObjectSelected) {
                        onCopy();
                        onClose();
                    }
                }}
                className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100',
                    !isObjectSelected && 'cursor-not-allowed opacity-50'
                )}
            >
                <Copy className="size-4" />
                <span>Copy</span>
            </div>

            {/* Paste */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onPaste();
                    onClose();
                }}
                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100"
            >
                <Clipboard className="size-4" />
                <span>Paste</span>
            </div>

            {/* Duplicate */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    if (isObjectSelected) {
                        onDuplicate();
                        onClose();
                    }
                }}
                className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100',
                    !isObjectSelected && 'cursor-not-allowed opacity-50'
                )}
            >
                <CopyPlus className="size-4" />
                <span>Duplicate</span>
            </div>

            <div className="my-1 border-t border-slate-100" />

            {/* Bring Forward */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    if (isObjectSelected) {
                        onBringForward();
                        onClose();
                    }
                }}
                className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100',
                    !isObjectSelected && 'cursor-not-allowed opacity-50'
                )}
            >
                <ArrowUp className="size-4" />
                <span>Bring Forward</span>
            </div>

            {/* Send Backward */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    if (isObjectSelected) {
                        onSendBackward();
                        onClose();
                    }
                }}
                className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100',
                    !isObjectSelected && 'cursor-not-allowed opacity-50'
                )}
            >
                <ArrowDown className="size-4" />
                <span>Send Backward</span>
            </div>

            <div className="my-1 border-t border-slate-100" />

            {/* Lock/Unlock */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    if (isObjectSelected && targetObjectId) {
                        onToggleLock(targetObjectId);
                        onClose();
                    }
                }}
                className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100',
                    !isObjectSelected && 'cursor-not-allowed opacity-50'
                )}
            >
                {isLocked ? (
                    <Unlock className="size-4" />
                ) : (
                    <Lock className="size-4" />
                )}
                <span>{isLocked ? 'Unlock' : 'Lock'}</span>
            </div>

            {/* Hide/Show */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    if (isObjectSelected && targetObjectId) {
                        onToggleVisibility(targetObjectId);
                        onClose();
                    }
                }}
                className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100',
                    !isObjectSelected && 'cursor-not-allowed opacity-50'
                )}
            >
                {isVisible ? (
                    <EyeOff className="size-4" />
                ) : (
                    <Eye className="size-4" />
                )}
                <span>{isVisible ? 'Hide' : 'Show'}</span>
            </div>

            <div className="my-1 border-t border-slate-100" />

            {/* Delete */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    if (isObjectSelected) {
                        onDelete();
                        onClose();
                    }
                }}
                className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-slate-100',
                    !isObjectSelected && 'cursor-not-allowed opacity-50'
                )}
            >
                <Trash2 className="size-4" />
                <span>Delete</span>
            </div>
        </div>
    );
};
