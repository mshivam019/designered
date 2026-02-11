import * as material from 'material-colors';
import type Konva from 'konva';

// --- Canvas Object Types ---

export type CanvasObjectType =
    | 'rect'
    | 'circle'
    | 'text'
    | 'image'
    | 'line'
    | 'polygon'
    | 'regularPolygon'
    | 'star'
    | 'arrow';

export interface CanvasObject {
    id: string;
    type: CanvasObjectType;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    sides?: number;
    points?: number[];
    fill: string;
    stroke: string;
    strokeWidth: number;
    dash?: number[];
    opacity: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    draggable: boolean;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number | string;
    fontStyle?: 'normal' | 'italic';
    textDecoration?: string;
    align?: string;
    src?: string;
    filters?: string[];
    cornerRadius?: number;
    name?: string;
    closed?: boolean;
    // Star-specific
    numPoints?: number;
    innerRadius?: number;
    outerRadius?: number;
    // Arrow-specific
    pointerLength?: number;
    pointerWidth?: number;
    // Visibility / lock for layers panel
    visible?: boolean;
    locked?: boolean;
}

export interface PageJson {
    objects: CanvasObject[];
    background: string;
}

// --- Animation Types ---

export type EasingType =
    | 'Linear'
    | 'EaseIn'
    | 'EaseOut'
    | 'EaseInOut'
    | 'BackEaseIn'
    | 'BackEaseOut'
    | 'ElasticEaseIn'
    | 'ElasticEaseOut'
    | 'BounceEaseIn'
    | 'BounceEaseOut';

export interface AnimationKeyframe {
    timestamp: number; // ms from animation start
    properties: Partial<{
        x: number;
        y: number;
        scaleX: number;
        scaleY: number;
        rotation: number;
        opacity: number;
        fill: string;
    }>;
    easing: EasingType;
}

export interface ObjectAnimation {
    keyframes: AnimationKeyframe[];
    loop: boolean;
}

export interface AnimationState {
    isPlaying: boolean;
    currentTime: number;
    totalDuration: number;
    animations: Record<string, ObjectAnimation>; // objectId -> animation
}

export const filters = [
    'none',
    'grayscale',
    'sepia',
    'contrast',
    'brighten',
    'blur',
    'invert',
    'pixelate',
    'emboss',
    'noise',
    'posterize',
    'solarize',
    'hsl',
    'enhance'
];

export const fonts = [
    'Arial',
    'Arial Black',
    'Verdana',
    'Helvetica',
    'Tahoma',
    'Trebuchet MS',
    'Times New Roman',
    'Georgia',
    'Garamond',
    'Courier New',
    'Brush Script MT',
    'Palatino',
    'Bookman',
    'Comic Sans MS',
    'Impact',
    'Lucida Sans Unicode',
    'Geneva',
    'Lucida Console'
];

export const selectionDependentTools = [
    'fill',
    'font',
    'filter',
    'opacity',
    'stroke-color',
    'stroke-width'
];

export const colors = [
    material.red['500'],
    material.pink['500'],
    material.purple['500'],
    material.deepPurple['500'],
    material.indigo['500'],
    material.blue['500'],
    material.lightBlue['500'],
    material.cyan['500'],
    material.teal['500'],
    material.green['500'],
    material.lightGreen['500'],
    material.lime['500'],
    material.yellow['500'],
    material.amber['500'],
    material.orange['500'],
    material.deepOrange['500'],
    material.brown['500'],
    material.blueGrey['500'],
    'transparent'
];

export type ActiveTool =
    | 'select'
    | 'shapes'
    | 'text'
    | 'images'
    | 'draw'
    | 'fill'
    | 'stroke-color'
    | 'stroke-width'
    | 'font'
    | 'opacity'
    | 'filter'
    | 'settings'
    | 'remove-bg'
    | 'templates'
    | 'layers';

export const FILL_COLOR = 'rgba(0,0,0,1)';
export const STROKE_COLOR = 'rgba(0,0,0,1)';
export const STROKE_WIDTH = 2;
export const STROKE_DASH_ARRAY = [];
export const FONT_FAMILY = 'Arial';
export const FONT_SIZE = 32;
export const FONT_WEIGHT = 400;

export const CIRCLE_OPTIONS = {
    radius: 225,
    x: 100,
    y: 100,
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH
};

export const RECTANGLE_OPTIONS = {
    x: 100,
    y: 100,
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
    width: 400,
    height: 400
};

export const DIAMOND_OPTIONS = {
    x: 100,
    y: 100,
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
    width: 600,
    height: 600
};

export const TRIANGLE_OPTIONS = {
    x: 100,
    y: 100,
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
    width: 400,
    height: 400
};

export const TEXT_OPTIONS = {
    x: 100,
    y: 100,
    fill: FILL_COLOR,
    fontSize: FONT_SIZE,
    fontFamily: FONT_FAMILY
};

export const STAR_OPTIONS = {
    x: 300,
    y: 300,
    numPoints: 5,
    innerRadius: 80,
    outerRadius: 200,
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH
};

export const ARROW_OPTIONS = {
    x: 100,
    y: 100,
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
    pointerLength: 20,
    pointerWidth: 20
};

export const HEXAGON_OPTIONS = {
    x: 300,
    y: 300,
    radius: 200,
    sides: 6,
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH
};

export const PENTAGON_OPTIONS = {
    x: 300,
    y: 300,
    radius: 200,
    sides: 5,
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH
};

export const OCTAGON_OPTIONS = {
    x: 300,
    y: 300,
    radius: 200,
    sides: 8,
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH
};

export interface EditorHookProps {
    defaultState?: string;
    defaultWidth?: number;
    defaultHeight?: number;
    clearSelectionCallback?: () => void;
    saveCallback?: (values: {
        json: string;
        height: number;
        width: number;
        pageNumber: number;
    }) => void;
}

export type BuildEditorProps = {
    undo: () => void;
    redo: () => void;
    save: (skip?: boolean) => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    autoZoom: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    copy: () => void;
    paste: () => void;
    objects: CanvasObject[];
    objectsRef: React.RefObject<CanvasObject[]>;
    setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    stageRef: React.RefObject<Konva.Stage | null>;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    strokeDashArray: number[];
    fontFamily: string;
    background: string;
    setBackground: (value: string) => void;
    pageWidth: number;
    pageHeight: number;
    setPageWidth: (value: number) => void;
    setPageHeight: (value: number) => void;
    setStrokeDashArray: (value: number[]) => void;
    setFillColor: (value: string) => void;
    setStrokeColor: (value: string) => void;
    setStrokeWidth: (value: number) => void;
    setFontFamily: (value: string) => void;
    isDrawingMode: boolean;
    setIsDrawingMode: (value: boolean) => void;
};

export interface Editor {
    savePng: () => void;
    saveJpg: () => void;
    saveSvg: () => void;
    saveJson: () => void;
    loadJson: (json: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    autoZoom: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    getWorkspace: () =>
        | { width: number; height: number; fill: string }
        | undefined;
    changeBackground: (value: string) => void;
    changeSize: (value: { width: number; height: number }) => void;
    enableDrawingMode: () => void;
    disableDrawingMode: () => void;
    onCopy: () => void;
    onPaste: () => void;
    changeImageFilter: (value: string) => void;
    addImage: (value: string) => void;
    delete: () => void;
    changeFontSize: (value: number) => void;
    getActiveFontSize: () => number;
    changeTextAlign: (value: string) => void;
    getActiveTextAlign: () => string;
    changeFontUnderline: (value: boolean) => void;
    getActiveFontUnderline: () => boolean;
    changeFontLinethrough: (value: boolean) => void;
    getActiveFontLinethrough: () => boolean;
    changeFontStyle: (value: string) => void;
    getActiveFontStyle: () => string;
    changeFontWeight: (value: number) => void;
    getActiveFontWeight: () => number;
    getActiveFontFamily: () => string;
    changeFontFamily: (value: string) => void;
    addText: (value: string, options?: Partial<CanvasObject>) => void;
    getActiveOpacity: () => number;
    changeOpacity: (value: number) => void;
    bringForward: () => void;
    sendBackwards: () => void;
    changeStrokeWidth: (value: number) => void;
    changeFillColor: (value: string) => void;
    changeStrokeColor: (value: string) => void;
    changeStrokeDashArray: (value: number[]) => void;
    addCircle: () => void;
    addSoftRectangle: () => void;
    addRectangle: () => void;
    addTriangle: () => void;
    addInverseTriangle: () => void;
    addDiamond: () => void;
    addStar: () => void;
    addArrow: () => void;
    addHexagon: () => void;
    addPentagon: () => void;
    addOctagon: () => void;
    addHeart: () => void;
    addCross: () => void;
    addStraightLine: () => void;
    toggleObjectVisibility: (id: string) => void;
    toggleObjectLock: (id: string) => void;
    renameObject: (id: string, name: string) => void;
    stageRef: React.RefObject<Konva.Stage | null>;
    getActiveFillColor: () => string;
    getActiveStrokeColor: () => string;
    getActiveStrokeWidth: () => number;
    getActiveStrokeDashArray: () => number[];
    selectedObjects: CanvasObject[];
}
