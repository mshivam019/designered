'use client';

import { Rect, Circle, Text, Line, Image as KonvaImage } from 'react-konva';
import type Konva from 'konva';
import { type CanvasObject } from '@/features/editor/types';
import { KonvaImageNode } from './konva-image';

interface CanvasObjectRendererProps {
    obj: CanvasObject;
    isSelected: boolean;
    isEditing?: boolean;
    onSelect: (id: string) => void;
    onDragEnd: (id: string, x: number, y: number) => void;
    onTransformEnd: (
        id: string,
        attrs: {
            x: number;
            y: number;
            scaleX: number;
            scaleY: number;
            rotation: number;
            width?: number;
            height?: number;
        }
    ) => void;
    onDblClick?: (id: string, e: { target: unknown }) => void;
    onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

export const CanvasObjectRenderer = ({
    obj,
    isSelected,
    isEditing,
    onSelect,
    onDragEnd,
    onTransformEnd,
    onDblClick,
    onDragMove
}: CanvasObjectRendererProps) => {
    const commonProps = {
        id: obj.id,
        x: obj.x,
        y: obj.y,
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        dash: obj.dash,
        opacity: obj.opacity,
        rotation: obj.rotation,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        draggable: obj.draggable,
        onClick: () => onSelect(obj.id),
        onTap: () => onSelect(obj.id),
        onDragMove,
        onDragEnd: (e: { target: { x: () => number; y: () => number } }) => {
            onDragEnd(obj.id, e.target.x(), e.target.y());
        },
        onTransformEnd: (e: {
            target: {
                x: () => number;
                y: () => number;
                scaleX: () => number;
                scaleY: () => number;
                rotation: () => number;
                width: () => number;
                height: () => number;
            };
        }) => {
            onTransformEnd(obj.id, {
                x: e.target.x(),
                y: e.target.y(),
                scaleX: e.target.scaleX(),
                scaleY: e.target.scaleY(),
                rotation: e.target.rotation(),
                width: e.target.width(),
                height: e.target.height()
            });
        }
    };

    switch (obj.type) {
        case 'rect':
            return (
                <Rect
                    {...commonProps}
                    width={obj.width}
                    height={obj.height}
                    cornerRadius={obj.cornerRadius}
                />
            );
        case 'circle':
            return <Circle {...commonProps} radius={obj.radius} />;
        case 'text':
            return (
                <Text
                    {...commonProps}
                    text={obj.text}
                    fontSize={obj.fontSize}
                    fontFamily={obj.fontFamily}
                    fontStyle={obj.fontStyle === 'italic' ? 'italic' : 'normal'}
                    fontVariant={
                        typeof obj.fontWeight === 'number' &&
                        obj.fontWeight >= 700
                            ? 'bold'
                            : 'normal'
                    }
                    textDecoration={obj.textDecoration ?? ''}
                    align={obj.align ?? 'left'}
                    width={obj.width ?? 300}
                    visible={!isEditing}
                    onDblClick={(e: { target: unknown }) =>
                        onDblClick?.(obj.id, e)
                    }
                    onDblTap={(e: { target: unknown }) =>
                        onDblClick?.(obj.id, e)
                    }
                />
            );
        case 'image':
            return <KonvaImageNode obj={obj} commonProps={commonProps} />;
        case 'line':
        case 'polygon':
            return (
                <Line
                    {...commonProps}
                    points={obj.points ?? []}
                    closed={obj.closed ?? false}
                />
            );
        default:
            return null;
    }
};
