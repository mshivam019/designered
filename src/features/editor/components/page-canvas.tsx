'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Line, Transformer, Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import type Konva from 'konva';
import { v4 as uuid } from 'uuid';

import { type CanvasObject } from '@/features/editor/types';
import { CanvasObjectRenderer } from './canvas-object-renderer';
import { useSnapping } from '@/features/editor/hooks/use-snapping';

interface PageCanvasProps {
    objects: CanvasObject[];
    setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    background: string;
    pageWidth: number;
    pageHeight: number;
    stageRef: React.RefObject<Konva.Stage | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    stageSize: { width: number; height: number };
    zoom: number;
    isDrawingMode: boolean;
    drawingPoints: number[];
    setDrawingPoints: React.Dispatch<React.SetStateAction<number[]>>;
    setIsDrawingMode: (value: boolean) => void;
    save: () => void;
    strokeColor: string;
    strokeWidth: number;
    autoZoom: () => void;
}

export const PageCanvas = ({
    objects,
    setObjects,
    selectedIds,
    setSelectedIds,
    background,
    pageWidth,
    pageHeight,
    stageRef,
    containerRef,
    stageSize,
    zoom,
    isDrawingMode,
    drawingPoints,
    setDrawingPoints,
    setIsDrawingMode,
    save,
    strokeColor,
    strokeWidth,
    autoZoom
}: PageCanvasProps) => {
    const transformerRef = useRef<Konva.Transformer>(null);
    const isDrawing = useRef(false);

    // Inline text editing state
    const [editingTextId, setEditingTextId] = useState<string | null>(null);

    // Snapping
    const {
        onDragMove: snapDragMove,
        onDragEnd: snapDragEnd,
        guidesRef
    } = useSnapping({ objects, pageWidth, pageHeight });
    // Force re-render when guides change (guidesRef is a ref, so we track length)
    const [guidesVersion, setGuidesVersion] = useState(0);

    // Set up ResizeObserver on the container — this runs here because
    // PageCanvas is dynamically imported (ssr: false), so the container
    // DOM element only exists after this component mounts.
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        autoZoom();

        const ro = new ResizeObserver(() => {
            autoZoom();
        });
        ro.observe(container);

        return () => {
            ro.disconnect();
        };
    }, [containerRef, autoZoom]);

    // Attach transformer to selected nodes
    useEffect(() => {
        const tr = transformerRef.current;
        const stage = stageRef.current;
        if (!tr || !stage) return;

        const nodes = selectedIds
            .map((id) => stage.findOne(`#${id}`))
            .filter(Boolean) as Konva.Node[];
        tr.nodes(nodes);
        tr.getLayer()?.batchDraw();
    }, [selectedIds, stageRef, objects]);

    const handleStageClick = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
            if (isDrawingMode) return;
            // Click on empty space → deselect
            if (e.target === e.target.getStage()) {
                setSelectedIds([]);
                setEditingTextId(null);
                return;
            }
            // Click on background rect → deselect
            if (e.target.attrs?.name === 'background') {
                setSelectedIds([]);
                setEditingTextId(null);
                return;
            }
        },
        [setSelectedIds, isDrawingMode]
    );

    const handleSelect = useCallback(
        (id: string) => {
            if (isDrawingMode) return;
            setSelectedIds([id]);
        },
        [setSelectedIds, isDrawingMode]
    );

    const handleDragEnd = useCallback(
        (id: string, x: number, y: number) => {
            setObjects((prev) =>
                prev.map((o) => (o.id === id ? { ...o, x, y } : o))
            );
            snapDragEnd();
            setGuidesVersion((v) => v + 1);
            save();
        },
        [setObjects, save, snapDragEnd]
    );

    const handleDragMove = useCallback(
        (e: Konva.KonvaEventObject<DragEvent>) => {
            snapDragMove(e);
            setGuidesVersion((v) => v + 1);
        },
        [snapDragMove]
    );

    const handleTransformEnd = useCallback(
        (
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
        ) => {
            setObjects((prev) =>
                prev.map((o) =>
                    o.id === id
                        ? {
                              ...o,
                              x: attrs.x,
                              y: attrs.y,
                              scaleX: attrs.scaleX,
                              scaleY: attrs.scaleY,
                              rotation: attrs.rotation,
                              ...(attrs.width != null
                                  ? { width: attrs.width }
                                  : {}),
                              ...(attrs.height != null
                                  ? { height: attrs.height }
                                  : {})
                          }
                        : o
                )
            );
            save();
        },
        [setObjects, save]
    );

    // Inline text editing — double-click on a text node opens an HTML overlay
    const handleTextDblClick = useCallback(
        (id: string) => {
            if (isDrawingMode) return;
            const obj = objects.find((o) => o.id === id);
            if (!obj || obj.type !== 'text') return;

            setEditingTextId(id);
            setSelectedIds([]);
        },
        [isDrawingMode, objects, setSelectedIds]
    );

    const handleTextEditComplete = useCallback(
        (id: string, newText: string) => {
            setObjects((prev) =>
                prev.map((o) => (o.id === id ? { ...o, text: newText } : o))
            );
            setEditingTextId(null);
            save();
        },
        [setObjects, save]
    );

    // Free drawing handlers
    // Convert stage pointer position to Layer-local coordinates
    const getLayerPointerPos = useCallback(
        (stage: {
            getPointerPosition: () => { x: number; y: number } | null;
        }) => {
            const pos = stage.getPointerPosition();
            if (!pos) return null;
            const oX = (stageSize.width - pageWidth * zoom) / 2;
            const oY = (stageSize.height - pageHeight * zoom) / 2;
            return {
                x: (pos.x - oX) / zoom,
                y: (pos.y - oY) / zoom
            };
        },
        [stageSize, pageWidth, pageHeight, zoom]
    );

    const handleMouseDown = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
            if (!isDrawingMode) return;
            isDrawing.current = true;
            const stage = e.target.getStage();
            if (!stage) return;
            const pos = getLayerPointerPos(stage);
            if (!pos) return;
            setDrawingPoints([pos.x, pos.y]);
        },
        [isDrawingMode, setDrawingPoints, getLayerPointerPos]
    );

    const handleMouseMove = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
            if (!isDrawingMode || !isDrawing.current) return;
            const stage = e.target.getStage();
            if (!stage) return;
            const pos = getLayerPointerPos(stage);
            if (!pos) return;
            setDrawingPoints((prev) => [...prev, pos.x, pos.y]);
        },
        [isDrawingMode, setDrawingPoints, getLayerPointerPos]
    );

    const handleMouseUp = useCallback(() => {
        if (!isDrawingMode || !isDrawing.current) return;
        isDrawing.current = false;
        if (drawingPoints.length >= 4) {
            const newLine: CanvasObject = {
                id: uuid(),
                type: 'line',
                x: 0,
                y: 0,
                points: [...drawingPoints],
                fill: 'transparent',
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true,
                closed: false
            };
            setObjects((prev) => [...prev, newLine]);
            save();
        }
        setDrawingPoints([]);
    }, [
        isDrawingMode,
        drawingPoints,
        strokeColor,
        strokeWidth,
        setObjects,
        setDrawingPoints,
        save
    ]);

    // Center the workspace in the stage
    const offsetX = (stageSize.width - pageWidth * zoom) / 2;
    const offsetY = (stageSize.height - pageHeight * zoom) / 2;

    // Get the editing text object for the Html overlay
    const editingObj = editingTextId
        ? objects.find((o) => o.id === editingTextId)
        : null;

    // Current snap guides
    const currentGuides = guidesRef.current;

    return (
        <div ref={containerRef} className="absolute inset-0">
            <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onClick={handleStageClick}
                onTap={handleStageClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
                style={{ cursor: isDrawingMode ? 'crosshair' : 'default' }}
            >
                <Layer
                    x={offsetX}
                    y={offsetY}
                    scaleX={zoom}
                    scaleY={zoom}
                    clipX={0}
                    clipY={0}
                    clipWidth={pageWidth}
                    clipHeight={pageHeight}
                >
                    {/* Background */}
                    <Rect
                        x={0}
                        y={0}
                        width={pageWidth}
                        height={pageHeight}
                        fill={background}
                        listening={true}
                        name="background"
                    />

                    {/* Objects */}
                    {objects.map((obj) => (
                        <CanvasObjectRenderer
                            key={obj.id}
                            obj={obj}
                            isSelected={selectedIds.includes(obj.id)}
                            isEditing={editingTextId === obj.id}
                            onSelect={handleSelect}
                            onDragEnd={handleDragEnd}
                            onTransformEnd={handleTransformEnd}
                            onDblClick={handleTextDblClick}
                            onDragMove={handleDragMove}
                        />
                    ))}

                    {/* Drawing in progress */}
                    {isDrawingMode && drawingPoints.length >= 4 && (
                        <Line
                            points={drawingPoints}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            listening={false}
                        />
                    )}

                    {/* Snapping guide lines */}
                    {currentGuides.map((guide, i) => (
                        <Line
                            key={`guide-${i}`}
                            points={
                                guide.orientation === 'V'
                                    ? [
                                          guide.lineGuide,
                                          0,
                                          guide.lineGuide,
                                          pageHeight
                                      ]
                                    : [
                                          0,
                                          guide.lineGuide,
                                          pageWidth,
                                          guide.lineGuide
                                      ]
                            }
                            stroke="#3b82f6"
                            strokeWidth={1 / zoom}
                            dash={[4 / zoom, 4 / zoom]}
                            listening={false}
                        />
                    ))}

                    {/* Transformer */}
                    <Transformer
                        ref={transformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                        anchorCornerRadius={4}
                        anchorStrokeColor="#3b82f6"
                        anchorFill="#fff"
                        borderStroke="#3b82f6"
                        borderStrokeWidth={1.5}
                    />

                    {/* Inline text editing via Html component */}
                    {editingObj && editingTextId && (
                        <Group x={editingObj.x} y={editingObj.y}>
                            <Html
                                transform
                                transformFunc={(attrs) => ({
                                    ...attrs,
                                    scaleX:
                                        attrs.scaleX * (editingObj.scaleX ?? 1),
                                    scaleY:
                                        attrs.scaleY * (editingObj.scaleY ?? 1),
                                    rotation: editingObj.rotation ?? 0
                                })}
                            >
                                <TextEditor
                                    obj={editingObj}
                                    onComplete={(text) =>
                                        handleTextEditComplete(
                                            editingTextId,
                                            text
                                        )
                                    }
                                    onCancel={() => setEditingTextId(null)}
                                />
                            </Html>
                        </Group>
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

// ─── Inline Text Editor (rendered inside Html portal) ──────────────────────

interface TextEditorProps {
    obj: CanvasObject;
    onComplete: (text: string) => void;
    onCancel: () => void;
}

const TextEditor = ({ obj, onComplete, onCancel }: TextEditorProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState(obj.text ?? '');

    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.focus();
        ta.select();
    }, []);

    const commit = useCallback(() => {
        onComplete(value);
    }, [value, onComplete]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Escape') {
                onCancel();
                return;
            }
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commit();
            }
        },
        [commit, onCancel]
    );

    const width = obj.width ?? 300;
    const fontSize = obj.fontSize ?? 32;

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            style={{
                width: `${width}px`,
                minHeight: `${fontSize * 1.5}px`,
                fontSize: `${fontSize}px`,
                fontFamily: obj.fontFamily ?? 'Arial',
                fontWeight:
                    typeof obj.fontWeight === 'number' && obj.fontWeight >= 700
                        ? 'bold'
                        : 'normal',
                fontStyle: obj.fontStyle === 'italic' ? 'italic' : 'normal',
                textDecoration: obj.textDecoration ?? 'none',
                textAlign: (obj.align ??
                    'left') as React.CSSProperties['textAlign'],
                color: obj.fill || '#000',
                background: 'transparent',
                border: '2px solid #3b82f6',
                borderRadius: '2px',
                outline: 'none',
                resize: 'none',
                padding: '0',
                margin: '0',
                lineHeight: '1.2',
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                boxSizing: 'border-box'
            }}
        />
    );
};
