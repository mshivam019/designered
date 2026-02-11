'use client';

import { useCallback, useState } from 'react';
import {
    Eye,
    EyeOff,
    GripVertical,
    Lock,
    Trash2,
    Unlock,
    Type,
    Image as ImageIcon,
    Square,
    Circle,
    Star,
    ArrowRight,
    Hexagon,
    Pencil
} from 'lucide-react';

import {
    type ActiveTool,
    type CanvasObject,
    type Editor
} from '@/features/editor/types';
import { ToolSidebarClose } from '@/features/editor/components/tool-sidebar-close';
import { ToolSidebarHeader } from '@/features/editor/components/tool-sidebar-header';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface LayersSidebarProps {
    editor: Editor | undefined;
    objects: CanvasObject[];
    setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
}

const getObjectIcon = (type: CanvasObject['type']) => {
    switch (type) {
        case 'rect':
            return Square;
        case 'circle':
            return Circle;
        case 'text':
            return Type;
        case 'image':
            return ImageIcon;
        case 'star':
            return Star;
        case 'arrow':
            return ArrowRight;
        case 'regularPolygon':
            return Hexagon;
        case 'line':
        case 'polygon':
            return Pencil;
        default:
            return Square;
    }
};

const getObjectLabel = (obj: CanvasObject): string => {
    if (obj.name) return obj.name;
    switch (obj.type) {
        case 'rect':
            return obj.cornerRadius ? 'Rounded Rect' : 'Rectangle';
        case 'circle':
            return 'Circle';
        case 'text':
            return obj.text ? obj.text.slice(0, 20) : 'Text';
        case 'image':
            return 'Image';
        case 'star':
            return 'Star';
        case 'arrow':
            return 'Arrow';
        case 'regularPolygon':
            return `Polygon (${obj.sides ?? 6})`;
        case 'line':
            return obj.closed ? 'Shape' : 'Line';
        case 'polygon':
            return 'Polygon';
        default:
            return 'Object';
    }
};

export const LayersSidebar = ({
    editor,
    objects,
    setObjects,
    selectedIds,
    setSelectedIds,
    activeTool,
    onChangeActiveTool
}: LayersSidebarProps) => {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const onClose = () => {
        onChangeActiveTool('select');
    };

    const handleSelect = useCallback(
        (id: string) => {
            setSelectedIds([id]);
        },
        [setSelectedIds]
    );

    const handleDelete = useCallback(
        (id: string) => {
            setObjects((prev) => prev.filter((o) => o.id !== id));
            setSelectedIds([]);
        },
        [setObjects, setSelectedIds]
    );

    const handleToggleVisibility = useCallback(
        (id: string) => {
            editor?.toggleObjectVisibility(id);
        },
        [editor]
    );

    const handleToggleLock = useCallback(
        (id: string) => {
            editor?.toggleObjectLock(id);
        },
        [editor]
    );

    const handleDragStart = useCallback((index: number) => {
        setDragIndex(index);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    }, []);

    const handleDrop = useCallback(
        (dropIndex: number) => {
            if (dragIndex === null || dragIndex === dropIndex) {
                setDragIndex(null);
                setDragOverIndex(null);
                return;
            }

            setObjects((prev) => {
                const next = [...prev];
                const [moved] = next.splice(dragIndex, 1);
                if (moved) {
                    next.splice(dropIndex, 0, moved);
                }
                return next;
            });

            setDragIndex(null);
            setDragOverIndex(null);
        },
        [dragIndex, setObjects]
    );

    // Display in reverse order (top layer first, like Figma)
    const reversedObjects = [...objects].reverse();

    return (
        <aside
            className={cn(
                'bg-white relative border-r z-[40] w-[360px] h-full flex flex-col',
                activeTool === 'layers' ? 'visible' : 'hidden'
            )}
        >
            <ToolSidebarHeader
                title="Layers"
                description={`${objects.length} object${objects.length !== 1 ? 's' : ''}`}
            />
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                    {reversedObjects.length === 0 && (
                        <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                            No objects on canvas
                        </div>
                    )}
                    {reversedObjects.map((obj, visualIndex) => {
                        const actualIndex = objects.length - 1 - visualIndex;
                        const isSelected = selectedIds.includes(obj.id);
                        const isHidden = obj.visible === false;
                        const isLocked = obj.locked === true;
                        const Icon = getObjectIcon(obj.type);
                        const label = getObjectLabel(obj);

                        return (
                            <div
                                key={obj.id}
                                draggable
                                onDragStart={() => handleDragStart(actualIndex)}
                                onDragOver={(e) =>
                                    handleDragOver(e, actualIndex)
                                }
                                onDrop={() => handleDrop(actualIndex)}
                                onDragEnd={() => {
                                    setDragIndex(null);
                                    setDragOverIndex(null);
                                }}
                                className={cn(
                                    'group flex items-center gap-1.5 rounded-md px-2 py-1.5 cursor-pointer transition-colors',
                                    isSelected
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'hover:bg-muted/50 border border-transparent',
                                    isHidden && 'opacity-40',
                                    dragOverIndex === actualIndex &&
                                        'border-t-2 border-t-blue-500'
                                )}
                                onClick={() => handleSelect(obj.id)}
                            >
                                {/* Drag handle */}
                                <GripVertical className="size-3.5 text-muted-foreground/50 shrink-0 cursor-grab active:cursor-grabbing" />

                                {/* Type icon */}
                                <div
                                    className={cn(
                                        'size-7 rounded flex items-center justify-center shrink-0',
                                        isSelected
                                            ? 'bg-blue-100'
                                            : 'bg-muted/80'
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'size-3.5',
                                            isSelected
                                                ? 'text-blue-600'
                                                : 'text-muted-foreground'
                                        )}
                                    />
                                </div>

                                {/* Label */}
                                <span
                                    className={cn(
                                        'text-xs font-medium truncate flex-1',
                                        isSelected
                                            ? 'text-blue-700'
                                            : 'text-foreground'
                                    )}
                                >
                                    {label}
                                </span>

                                {/* Actions */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleVisibility(obj.id);
                                        }}
                                    >
                                        {isHidden ? (
                                            <EyeOff className="size-3" />
                                        ) : (
                                            <Eye className="size-3" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleLock(obj.id);
                                        }}
                                    >
                                        {isLocked ? (
                                            <Lock className="size-3" />
                                        ) : (
                                            <Unlock className="size-3" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(obj.id);
                                        }}
                                    >
                                        <Trash2 className="size-3" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};
