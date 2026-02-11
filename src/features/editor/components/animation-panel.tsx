'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Play,
    Pause,
    Square as StopIcon,
    Plus,
    Trash2,
    Download,
    ChevronUp,
    ChevronDown,
    Clock,
    MousePointerClick,
    Diamond,
    Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
    type AnimationState,
    type AnimationKeyframe,
    type ObjectAnimation,
    type EasingType,
    type CanvasObject
} from '@/features/editor/types';
import { Button } from '@/components/ui/button';
import { Hint } from '@/components/hint';
import { cn } from '@/lib/utils';

interface AnimationPanelProps {
    animationState: AnimationState;
    selectedIds: string[];
    objects: CanvasObject[];
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    onSeek: (time: number) => void;
    onAddKeyframe: (objectId: string, keyframe: AnimationKeyframe) => void;
    onRemoveKeyframe: (objectId: string, timestamp: number) => void;
    onUpdateKeyframeEasing: (
        objectId: string,
        timestamp: number,
        easing: EasingType
    ) => void;
    onSetDuration: (duration: number) => void;
    onExportVideo: () => Promise<Blob | null>;
}

const EASING_OPTIONS: { label: string; value: EasingType }[] = [
    { label: 'Linear', value: 'Linear' },
    { label: 'Ease In', value: 'EaseIn' },
    { label: 'Ease Out', value: 'EaseOut' },
    { label: 'Ease In Out', value: 'EaseInOut' },
    { label: 'Bounce Out', value: 'BounceEaseOut' },
    { label: 'Elastic Out', value: 'ElasticEaseOut' },
    { label: 'Back Out', value: 'BackEaseOut' }
];

const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const frames = Math.floor((ms % 1000) / (1000 / 30));
    return `${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
};

const getObjectLabel = (obj: CanvasObject): string => {
    if (obj.name) return obj.name;
    if (obj.type === 'text' && obj.text) {
        return obj.text.length > 20 ? obj.text.slice(0, 20) + '...' : obj.text;
    }
    return obj.type.charAt(0).toUpperCase() + obj.type.slice(1);
};

export const AnimationPanel = ({
    animationState,
    selectedIds,
    objects,
    onPlay,
    onPause,
    onStop,
    onSeek,
    onAddKeyframe,
    onRemoveKeyframe,
    onUpdateKeyframeEasing,
    onSetDuration,
    onExportVideo
}: AnimationPanelProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedEasing, setSelectedEasing] = useState<EasingType>('Linear');
    const timelineRef = useRef<HTMLDivElement>(null);

    const { isPlaying, currentTime, totalDuration, animations } =
        animationState;

    const selectedObject = useMemo(
        () => objects.find((o) => selectedIds.includes(o.id)),
        [objects, selectedIds]
    );

    const selectedAnimation: ObjectAnimation | undefined = selectedObject
        ? animations[selectedObject.id]
        : undefined;

    const progress = totalDuration > 0 ? currentTime / totalDuration : 0;
    const hasAnimations = Object.keys(animations).length > 0;
    const animatedObjectCount = Object.keys(animations).filter(
        (id) => animations[id].keyframes.length > 0
    ).length;

    // Auto-expand when user selects an object that has animations
    useEffect(() => {
        if (selectedAnimation && selectedAnimation.keyframes.length > 0) {
            setIsExpanded(true);
        }
    }, [selectedAnimation]);

    const handleTimelineClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const ratio = x / rect.width;
            const time = Math.max(
                0,
                Math.min(totalDuration, ratio * totalDuration)
            );
            onSeek(time);
        },
        [totalDuration, onSeek]
    );

    const handleAddKeyframeAtCurrentTime = useCallback(() => {
        if (!selectedObject) return;

        const keyframe: AnimationKeyframe = {
            timestamp: Math.round(currentTime),
            properties: {
                x: selectedObject.x,
                y: selectedObject.y,
                scaleX: selectedObject.scaleX,
                scaleY: selectedObject.scaleY,
                rotation: selectedObject.rotation,
                opacity: selectedObject.opacity
            },
            easing: selectedEasing
        };

        onAddKeyframe(selectedObject.id, keyframe);
    }, [selectedObject, currentTime, onAddKeyframe, selectedEasing]);

    const handleExport = useCallback(async () => {
        setIsExporting(true);
        try {
            const blob = await onExportVideo();
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'animation.webm';
                a.click();
                URL.revokeObjectURL(url);
            }
        } finally {
            setIsExporting(false);
        }
    }, [onExportVideo]);

    return (
        <div className="relative z-[48] shrink-0">
            {/* Toggle bar */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    'w-full flex items-center gap-2 px-4 py-1.5 border-t text-xs font-medium transition-colors',
                    isExpanded
                        ? 'bg-white text-foreground'
                        : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:text-foreground'
                )}
            >
                <Film className="size-3.5" />
                <span>Animation</span>

                {!isExpanded && selectedObject && (
                    <span className="text-muted-foreground/70 truncate max-w-[150px]">
                        — {getObjectLabel(selectedObject)}
                        {selectedAnimation
                            ? ` (${selectedAnimation.keyframes.length} keyframes)`
                            : ''}
                    </span>
                )}

                {!isExpanded && animatedObjectCount > 0 && (
                    <span className="ml-auto mr-2 bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                        {animatedObjectCount} animated
                    </span>
                )}

                {isExpanded ? (
                    <ChevronDown className="size-3 ml-auto" />
                ) : (
                    <ChevronUp className="size-3 ml-auto" />
                )}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white border-t">
                            {/* Controls row */}
                            <div className="flex items-center gap-2 px-4 py-2 border-b">
                                {/* Playback controls */}
                                <div className="flex items-center gap-1">
                                    {isPlaying ? (
                                        <Hint label="Pause" side="top">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7"
                                                onClick={onPause}
                                            >
                                                <Pause className="size-3.5" />
                                            </Button>
                                        </Hint>
                                    ) : (
                                        <Hint label="Play" side="top">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7"
                                                onClick={onPlay}
                                                disabled={!hasAnimations}
                                            >
                                                <Play className="size-3.5" />
                                            </Button>
                                        </Hint>
                                    )}
                                    <Hint label="Stop" side="top">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7"
                                            onClick={onStop}
                                        >
                                            <StopIcon className="size-3.5" />
                                        </Button>
                                    </Hint>
                                </div>

                                <div className="w-px h-5 bg-border" />

                                {/* Time display */}
                                <span className="text-xs font-mono text-muted-foreground tabular-nums min-w-[60px]">
                                    {formatTime(currentTime)} /{' '}
                                    {formatTime(totalDuration)}
                                </span>

                                <div className="w-px h-5 bg-border" />

                                {/* Duration input */}
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">
                                        Duration:
                                    </span>
                                    <input
                                        type="number"
                                        min={500}
                                        max={60000}
                                        step={500}
                                        value={totalDuration}
                                        onChange={(e) =>
                                            onSetDuration(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-16 h-6 text-xs border rounded px-1 tabular-nums"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        ms
                                    </span>
                                </div>

                                <div className="w-px h-5 bg-border" />

                                {/* Easing selector for new keyframes */}
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">
                                        Easing:
                                    </span>
                                    <select
                                        value={selectedEasing}
                                        onChange={(e) =>
                                            setSelectedEasing(
                                                e.target.value as EasingType
                                            )
                                        }
                                        className="h-6 text-xs border rounded px-1 bg-white"
                                    >
                                        {EASING_OPTIONS.map((opt) => (
                                            <option
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1" />

                                {/* Add keyframe */}
                                <Hint
                                    label={
                                        selectedObject
                                            ? `Add keyframe for "${getObjectLabel(selectedObject)}" at ${formatTime(currentTime)}`
                                            : 'Select an object first'
                                    }
                                    side="top"
                                >
                                    <Button
                                        size="sm"
                                        variant={
                                            selectedObject
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className={cn(
                                            'h-7 gap-1 text-xs',
                                            selectedObject &&
                                                'bg-blue-500 hover:bg-blue-600 text-white'
                                        )}
                                        onClick={handleAddKeyframeAtCurrentTime}
                                        disabled={!selectedObject}
                                    >
                                        <Diamond className="size-3" />
                                        Add Keyframe
                                    </Button>
                                </Hint>

                                {/* Export */}
                                <Hint label="Export as WebM video" side="top">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 gap-1 text-xs"
                                        onClick={handleExport}
                                        disabled={!hasAnimations || isExporting}
                                    >
                                        <Download className="size-3" />
                                        {isExporting
                                            ? 'Exporting...'
                                            : 'Export'}
                                    </Button>
                                </Hint>
                            </div>

                            {/* Timeline track */}
                            <div className="px-4 py-3">
                                <div
                                    ref={timelineRef}
                                    className="relative h-8 bg-muted rounded-md cursor-pointer overflow-hidden"
                                    onClick={handleTimelineClick}
                                >
                                    {/* Progress fill */}
                                    <div
                                        className="absolute inset-y-0 left-0 bg-blue-100 rounded-l-md transition-none"
                                        style={{
                                            width: `${progress * 100}%`
                                        }}
                                    />

                                    {/* Keyframe markers for selected object */}
                                    {selectedAnimation?.keyframes.map(
                                        (kf, i) => (
                                            <div
                                                key={`${kf.timestamp}-${i}`}
                                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-amber-400 border-2 border-amber-600 rounded-sm rotate-45 z-10 hover:scale-125 transition-transform"
                                                style={{
                                                    left: `${(kf.timestamp / totalDuration) * 100}%`
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSeek(kf.timestamp);
                                                }}
                                            />
                                        )
                                    )}

                                    {/* Playhead */}
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20 transition-none"
                                        style={{
                                            left: `${progress * 100}%`
                                        }}
                                    >
                                        <div className="absolute -top-1 -translate-x-1/2 w-2.5 h-2.5 bg-blue-500 rounded-full" />
                                    </div>

                                    {/* Time markers */}
                                    {Array.from({ length: 11 }, (_, i) => (
                                        <div
                                            key={i}
                                            className="absolute top-0 bottom-0 w-px bg-border/40"
                                            style={{ left: `${i * 10}%` }}
                                        >
                                            <span className="absolute -bottom-4 -translate-x-1/2 text-[9px] text-muted-foreground/60 tabular-nums">
                                                {formatTime(
                                                    (i / 10) * totalDuration
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Selected object section */}
                            {selectedObject && (
                                <div className="px-4 pb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Diamond className="size-3 text-amber-500" />
                                        <p className="text-xs font-medium">
                                            Keyframes for{' '}
                                            <span className="text-blue-600">
                                                {getObjectLabel(selectedObject)}
                                            </span>
                                        </p>
                                    </div>

                                    {selectedAnimation &&
                                    selectedAnimation.keyframes.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedAnimation.keyframes
                                                .sort(
                                                    (a, b) =>
                                                        a.timestamp -
                                                        b.timestamp
                                                )
                                                .map((kf, i) => (
                                                    <div
                                                        key={`${kf.timestamp}-${i}`}
                                                        className="flex items-center gap-1 bg-muted rounded px-2 py-1 text-xs group"
                                                    >
                                                        <button
                                                            className="font-mono tabular-nums hover:text-blue-600 transition-colors"
                                                            onClick={() =>
                                                                onSeek(
                                                                    kf.timestamp
                                                                )
                                                            }
                                                        >
                                                            {formatTime(
                                                                kf.timestamp
                                                            )}
                                                        </button>
                                                        <select
                                                            value={kf.easing}
                                                            onChange={(e) =>
                                                                onUpdateKeyframeEasing(
                                                                    selectedObject.id,
                                                                    kf.timestamp,
                                                                    e.target
                                                                        .value as EasingType
                                                                )
                                                            }
                                                            className="text-[10px] bg-transparent border-none outline-none text-muted-foreground hover:text-foreground cursor-pointer"
                                                        >
                                                            {EASING_OPTIONS.map(
                                                                (opt) => (
                                                                    <option
                                                                        key={
                                                                            opt.value
                                                                        }
                                                                        value={
                                                                            opt.value
                                                                        }
                                                                    >
                                                                        {
                                                                            opt.label
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                        <button
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                                            onClick={() =>
                                                                onRemoveKeyframe(
                                                                    selectedObject.id,
                                                                    kf.timestamp
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            No keyframes yet. Move the playhead,
                                            position your object, then click{' '}
                                            <span className="font-medium text-blue-600">
                                                Add Keyframe
                                            </span>
                                            .
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* No object selected state */}
                            {!selectedObject && (
                                <div className="px-4 pb-3">
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <MousePointerClick className="size-5 text-muted-foreground shrink-0" />
                                        <div className="text-xs text-muted-foreground">
                                            <p className="font-medium text-foreground mb-1">
                                                How to animate:
                                            </p>
                                            <ol className="space-y-0.5 list-decimal list-inside">
                                                <li>
                                                    Select an object on the
                                                    canvas (text, shape, image)
                                                </li>
                                                <li>
                                                    Set the playhead to time 0s,
                                                    click{' '}
                                                    <span className="font-medium">
                                                        Add Keyframe
                                                    </span>{' '}
                                                    (start position)
                                                </li>
                                                <li>
                                                    Move the playhead forward,
                                                    reposition the object, add
                                                    another keyframe
                                                </li>
                                                <li>
                                                    Press{' '}
                                                    <span className="font-medium">
                                                        Play
                                                    </span>{' '}
                                                    to preview, then{' '}
                                                    <span className="font-medium">
                                                        Export
                                                    </span>{' '}
                                                    as WebM
                                                </li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
