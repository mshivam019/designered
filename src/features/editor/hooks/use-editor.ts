import { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import type Konva from 'konva';
import { v4 as uuid } from 'uuid';

import {
    type CanvasObject,
    type Editor,
    type PageJson,
    FILL_COLOR,
    STROKE_WIDTH,
    STROKE_COLOR,
    CIRCLE_OPTIONS,
    DIAMOND_OPTIONS,
    TRIANGLE_OPTIONS,
    type BuildEditorProps,
    RECTANGLE_OPTIONS,
    type EditorHookProps,
    STROKE_DASH_ARRAY,
    TEXT_OPTIONS,
    FONT_FAMILY,
    FONT_WEIGHT,
    FONT_SIZE,
    STAR_OPTIONS,
    ARROW_OPTIONS,
    HEXAGON_OPTIONS,
    PENTAGON_OPTIONS,
    OCTAGON_OPTIONS
} from '@/features/editor/types';
import { useHistory } from '@/features/editor/hooks/use-history';
import { downloadFile } from '@/features/editor/utils';
import { useHotkeys } from '@/features/editor/hooks/use-hotkeys';
import { useClipboard } from '@/features/editor/hooks/use-clipboard';
import { useAutoResize } from '@/features/editor/hooks/use-auto-resize';
import { useWindowEvents } from '@/features/editor/hooks/use-window-events';

const buildEditor = ({
    save,
    undo,
    redo,
    canRedo,
    canUndo,
    autoZoom,
    zoomIn,
    zoomOut,
    copy,
    paste,
    objects,
    objectsRef,
    setObjects,
    selectedIds,
    setSelectedIds,
    stageRef,
    fillColor,
    fontFamily,
    setFontFamily,
    setFillColor,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    strokeDashArray,
    setStrokeDashArray,
    background,
    setBackground,
    pageWidth,
    pageHeight,
    setPageWidth,
    setPageHeight,
    isDrawingMode,
    setIsDrawingMode
}: BuildEditorProps): Editor => {
    // Use ref for selectedObjects so it's always current even when editor
    // identity doesn't change (prevents stale reads in toolbar).
    const selectedObjects = objectsRef.current.filter((o) =>
        selectedIds.includes(o.id)
    );

    const getWorkspace = () => ({
        width: pageWidth,
        height: pageHeight,
        fill: background
    });

    const addObject = (obj: Omit<CanvasObject, 'id'>) => {
        const newObj: CanvasObject = { ...obj, id: uuid() };
        setObjects((prev) => [...prev, newObj]);
        setSelectedIds([newObj.id]);
        save();
        return newObj;
    };

    const updateSelected = (updates: Partial<CanvasObject>) => {
        if (selectedIds.length === 0) return;
        setObjects((prev) =>
            prev.map((o) =>
                selectedIds.includes(o.id) ? { ...o, ...updates } : o
            )
        );
    };

    const exportStage = (mimeType: string, quality?: number): string | null => {
        const stage = stageRef.current;
        if (!stage) return null;
        const oldScale = { x: stage.scaleX(), y: stage.scaleY() };
        const oldPos = stage.position();
        stage.scale({ x: 1, y: 1 });
        stage.position({ x: 0, y: 0 });
        stage.batchDraw();
        const dataUrl = stage.toDataURL({
            mimeType,
            pixelRatio: 2,
            quality,
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight
        });
        stage.scale(oldScale);
        stage.position(oldPos);
        stage.batchDraw();
        return dataUrl;
    };

    return {
        savePng: () => {
            const dataUrl = exportStage('image/png');
            if (dataUrl) downloadFile(dataUrl, 'png');
        },
        saveJpg: () => {
            const dataUrl = exportStage('image/jpeg', 0.92);
            if (dataUrl) downloadFile(dataUrl, 'jpg');
        },
        saveSvg: () => {
            const dataUrl = exportStage('image/png');
            if (dataUrl) downloadFile(dataUrl, 'png');
        },
        saveJson: () => {
            const data: PageJson = { objects: objectsRef.current, background };
            const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(data, null, '\t')
            )}`;
            downloadFile(fileString, 'json');
        },
        loadJson: (json: string) => {
            const data = JSON.parse(json) as PageJson;
            setObjects(data.objects ?? []);
            setBackground(data.background ?? 'white');
            setSelectedIds([]);
            autoZoom();
        },
        canUndo,
        canRedo,
        autoZoom,
        getWorkspace,
        stageRef,
        selectedObjects,
        zoomIn,
        zoomOut,
        changeSize: (value: { width: number; height: number }) => {
            setPageWidth(value.width);
            setPageHeight(value.height);
            save();
        },
        changeBackground: (value: string) => {
            setBackground(value);
            save();
        },
        enableDrawingMode: () => {
            setSelectedIds([]);
            setIsDrawingMode(true);
        },
        disableDrawingMode: () => {
            setIsDrawingMode(false);
        },
        onUndo: () => undo(),
        onRedo: () => redo(),
        onCopy: () => copy(),
        onPaste: () => paste(),
        changeImageFilter: (value: string) => {
            if (selectedIds.length === 0) return;
            setObjects((prev) =>
                prev.map((o) =>
                    selectedIds.includes(o.id) && o.type === 'image'
                        ? { ...o, filters: value === 'none' ? [] : [value] }
                        : o
                )
            );
            save();
        },
        addImage: (value: string) => {
            addObject({
                type: 'image',
                x: pageWidth / 2 - 200,
                y: pageHeight / 2 - 150,
                width: 400,
                height: 300,
                src: value,
                fill: 'transparent',
                stroke: '',
                strokeWidth: 0,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        delete: () => {
            setObjects((prev) =>
                prev.filter((o) => !selectedIds.includes(o.id))
            );
            setSelectedIds([]);
            save();
        },
        addText: (value, options) => {
            addObject({
                type: 'text',
                ...TEXT_OPTIONS,
                text: value,
                fill: fillColor,
                stroke: '',
                strokeWidth: 0,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true,
                width: 300,
                fontFamily: FONT_FAMILY,
                fontSize: FONT_SIZE,
                fontWeight: FONT_WEIGHT,
                fontStyle: 'normal',
                align: 'left',
                ...options
            });
        },
        getActiveOpacity: () => selectedObjects[0]?.opacity ?? 1,
        changeFontSize: (value: number) => {
            updateSelected({ fontSize: value });
            save();
        },
        getActiveFontSize: () =>
            (selectedObjects[0]?.fontSize as number) ?? FONT_SIZE,
        changeTextAlign: (value: string) => {
            updateSelected({ align: value });
            save();
        },
        getActiveTextAlign: () => selectedObjects[0]?.align ?? 'left',
        changeFontUnderline: (value: boolean) => {
            updateSelected({ textDecoration: value ? 'underline' : '' });
            save();
        },
        getActiveFontUnderline: () =>
            selectedObjects[0]?.textDecoration === 'underline',
        changeFontLinethrough: (value: boolean) => {
            updateSelected({ textDecoration: value ? 'line-through' : '' });
            save();
        },
        getActiveFontLinethrough: () =>
            selectedObjects[0]?.textDecoration === 'line-through',
        changeFontStyle: (value: string) => {
            updateSelected({ fontStyle: value as 'normal' | 'italic' });
            save();
        },
        getActiveFontStyle: () => selectedObjects[0]?.fontStyle ?? 'normal',
        changeFontWeight: (value: number) => {
            updateSelected({ fontWeight: value });
            save();
        },
        getActiveFontWeight: () =>
            (selectedObjects[0]?.fontWeight as number) ?? FONT_WEIGHT,
        getActiveFontFamily: () => selectedObjects[0]?.fontFamily ?? fontFamily,
        changeFontFamily: (value: string) => {
            setFontFamily(value);
            updateSelected({ fontFamily: value });
            save();
        },
        changeOpacity: (value: number) => {
            updateSelected({ opacity: value });
            save();
        },
        bringForward: () => {
            if (selectedIds.length === 0) return;
            setObjects((prev) => {
                const next = [...prev];
                for (let i = next.length - 2; i >= 0; i--) {
                    if (selectedIds.includes(next[i]!.id)) {
                        [next[i], next[i + 1]] = [next[i + 1]!, next[i]!];
                    }
                }
                return next;
            });
            save();
        },
        sendBackwards: () => {
            if (selectedIds.length === 0) return;
            setObjects((prev) => {
                const next = [...prev];
                for (let i = 1; i < next.length; i++) {
                    if (selectedIds.includes(next[i]!.id)) {
                        [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
                    }
                }
                return next;
            });
            save();
        },
        changeFillColor: (value: string) => {
            setFillColor(value);
            updateSelected({ fill: value });
            save();
        },
        changeStrokeColor: (value: string) => {
            setStrokeColor(value);
            updateSelected({ stroke: value });
            save();
        },
        changeStrokeWidth: (value: number) => {
            setStrokeWidth(value);
            updateSelected({ strokeWidth: value });
            save();
        },
        changeStrokeDashArray: (value: number[]) => {
            setStrokeDashArray(value);
            updateSelected({ dash: value });
            save();
        },
        addCircle: () => {
            addObject({
                type: 'circle',
                ...CIRCLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addSoftRectangle: () => {
            addObject({
                type: 'rect',
                ...RECTANGLE_OPTIONS,
                cornerRadius: 50,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addRectangle: () => {
            addObject({
                type: 'rect',
                ...RECTANGLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addTriangle: () => {
            const w = TRIANGLE_OPTIONS.width;
            const h = TRIANGLE_OPTIONS.height;
            addObject({
                type: 'line',
                points: [w / 2, 0, w, h, 0, h],
                closed: true,
                ...TRIANGLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addInverseTriangle: () => {
            const w = TRIANGLE_OPTIONS.width;
            const h = TRIANGLE_OPTIONS.height;
            addObject({
                type: 'line',
                points: [0, 0, w, 0, w / 2, h],
                closed: true,
                ...TRIANGLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addDiamond: () => {
            const w = DIAMOND_OPTIONS.width;
            const h = DIAMOND_OPTIONS.height;
            addObject({
                type: 'line',
                points: [w / 2, 0, w, h / 2, w / 2, h, 0, h / 2],
                closed: true,
                ...DIAMOND_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addStar: () => {
            addObject({
                type: 'star',
                ...STAR_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addArrow: () => {
            addObject({
                type: 'arrow',
                ...ARROW_OPTIONS,
                points: [0, 0, 300, 0],
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addHexagon: () => {
            addObject({
                type: 'regularPolygon',
                ...HEXAGON_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addPentagon: () => {
            addObject({
                type: 'regularPolygon',
                ...PENTAGON_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addOctagon: () => {
            addObject({
                type: 'regularPolygon',
                ...OCTAGON_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addHeart: () => {
            // Heart shape as a closed polyline
            const w = 400;
            const h = 400;
            const points = [
                w / 2,
                h * 0.35,
                w * 0.15,
                0,
                0,
                h * 0.35,
                w / 2,
                h,
                w,
                h * 0.35,
                w * 0.85,
                0,
                w / 2,
                h * 0.35
            ];
            addObject({
                type: 'line',
                x: 100,
                y: 100,
                width: w,
                height: h,
                points,
                closed: true,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addCross: () => {
            // Plus/cross shape
            const s = 400;
            const t = s / 3;
            const points = [
                t,
                0,
                2 * t,
                0,
                2 * t,
                t,
                s,
                t,
                s,
                2 * t,
                2 * t,
                2 * t,
                2 * t,
                s,
                t,
                s,
                t,
                2 * t,
                0,
                2 * t,
                0,
                t,
                t,
                t
            ];
            addObject({
                type: 'line',
                x: 100,
                y: 100,
                width: s,
                height: s,
                points,
                closed: true,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        addStraightLine: () => {
            addObject({
                type: 'line',
                x: 100,
                y: 300,
                points: [0, 0, 400, 0],
                closed: false,
                fill: 'transparent',
                stroke: strokeColor,
                strokeWidth: strokeWidth > 0 ? strokeWidth : 3,
                dash: strokeDashArray.length > 0 ? strokeDashArray : undefined,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                draggable: true
            });
        },
        toggleObjectVisibility: (id: string) => {
            setObjects((prev) =>
                prev.map((o) =>
                    o.id === id
                        ? { ...o, visible: o.visible === false ? true : false }
                        : o
                )
            );
            save();
        },
        toggleObjectLock: (id: string) => {
            setObjects((prev) =>
                prev.map((o) => (o.id === id ? { ...o, locked: !o.locked } : o))
            );
            save();
        },
        renameObject: (id: string, name: string) => {
            setObjects((prev) =>
                prev.map((o) => (o.id === id ? { ...o, name } : o))
            );
        },
        getActiveFillColor: () =>
            (selectedObjects[0]?.fill as string) ?? fillColor,
        getActiveStrokeColor: () => selectedObjects[0]?.stroke ?? strokeColor,
        getActiveStrokeWidth: () =>
            selectedObjects[0]?.strokeWidth ?? strokeWidth,
        getActiveStrokeDashArray: () =>
            selectedObjects[0]?.dash ?? strokeDashArray
    };
};

export const useEditor = ({
    defaultState,
    defaultHeight,
    defaultWidth,
    clearSelectionCallback,
    saveCallback
}: EditorHookProps) => {
    const [objects, setObjects] = useState<CanvasObject[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [background, setBackground] = useState('white');
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawingPoints, setDrawingPoints] = useState<number[]>([]);
    const [pageWidth, setPageWidth] = useState(defaultWidth ?? 1200);
    const [pageHeight, setPageHeight] = useState(defaultHeight ?? 900);
    const stageRef = useRef<Konva.Stage | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const objectsRef = useRef<CanvasObject[]>(objects);
    objectsRef.current = objects;

    const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
    const [fillColor, setFillColor] = useState(FILL_COLOR);
    const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
    const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
    const [strokeDashArray, setStrokeDashArray] =
        useState<number[]>(STROKE_DASH_ARRAY);

    // Parse initial state on mount
    const initializedRef = useRef(false);
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;
        if (defaultState) {
            try {
                const data = JSON.parse(defaultState) as PageJson;
                if (data.objects) setObjects(data.objects);
                if (data.background) setBackground(data.background);
            } catch {
                // Invalid JSON — start with empty canvas
            }
        }
    }, [defaultState]);

    useWindowEvents();

    const { save, canRedo, canUndo, undo, redo } = useHistory({
        objects,
        setObjects,
        background,
        setBackground,
        saveCallback,
        pageWidth,
        pageHeight
    });

    const { copy, paste } = useClipboard({
        objects,
        setObjects,
        selectedIds,
        setSelectedIds,
        save
    });

    const { autoZoom, stageSize, zoom, zoomIn, zoomOut } = useAutoResize({
        containerRef,
        pageWidth,
        pageHeight
    });

    const setSelectedIdsWithCallback = useCallback(
        (ids: string[]) => {
            setSelectedIds(ids);
            if (ids.length === 0) {
                clearSelectionCallback?.();
            }
        },
        [clearSelectionCallback]
    );

    useHotkeys({
        undo,
        redo,
        copy,
        paste,
        save,
        objects,
        selectedIds,
        setSelectedIds: setSelectedIdsWithCallback,
        setObjects
    });

    const editor = useMemo(() => {
        return buildEditor({
            save,
            undo,
            redo,
            canUndo,
            canRedo,
            autoZoom,
            zoomIn,
            zoomOut,
            copy,
            paste,
            objects,
            objectsRef,
            setObjects,
            selectedIds,
            setSelectedIds: setSelectedIdsWithCallback,
            stageRef,
            fillColor,
            strokeWidth,
            strokeColor,
            setFillColor,
            setStrokeColor,
            setStrokeWidth,
            strokeDashArray,
            setStrokeDashArray,
            fontFamily,
            setFontFamily,
            background,
            setBackground,
            pageWidth,
            pageHeight,
            setPageWidth,
            setPageHeight,
            isDrawingMode,
            setIsDrawingMode
        });
    }, [
        canRedo,
        canUndo,
        undo,
        redo,
        save,
        autoZoom,
        zoomIn,
        zoomOut,
        copy,
        paste,
        selectedIds,
        setSelectedIdsWithCallback,
        fillColor,
        strokeWidth,
        strokeColor,
        strokeDashArray,
        fontFamily,
        background,
        pageWidth,
        pageHeight,
        isDrawingMode
    ]);

    return {
        editor,
        objects,
        setObjects,
        selectedIds,
        setSelectedIds: setSelectedIdsWithCallback,
        isDrawingMode,
        setIsDrawingMode,
        drawingPoints,
        setDrawingPoints,
        background,
        pageWidth,
        pageHeight,
        stageRef,
        containerRef,
        stageSize,
        zoom,
        autoZoom,
        zoomIn,
        zoomOut,
        historySave: save
    };
};
