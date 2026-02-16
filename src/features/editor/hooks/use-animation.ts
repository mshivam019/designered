import { useCallback, useRef, useState } from 'react';
import Konva from 'konva';

import {
    type AnimationKeyframe,
    type AnimationState,
    type EasingType,
    type ObjectAnimation
} from '@/features/editor/types';

// Simple easing functions
const easingFunctions: Record<EasingType, (t: number) => number> = {
    Linear: (t) => t,
    EaseIn: (t) => t * t,
    EaseOut: (t) => t * (2 - t),
    EaseInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    BackEaseIn: (t) => t * t * (2.70158 * t - 1.70158),
    BackEaseOut: (t) => {
        const c = 1.70158;
        return 1 + (t - 1) * (t - 1) * ((c + 1) * (t - 1) + c);
    },
    ElasticEaseIn: (t) =>
        t === 0
            ? 0
            : t === 1
              ? 1
              : -Math.pow(2, 10 * t - 10) *
                Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)),
    ElasticEaseOut: (t) =>
        t === 0
            ? 0
            : t === 1
              ? 1
              : Math.pow(2, -10 * t) *
                    Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) +
                1,
    BounceEaseIn: (t) => 1 - easingFunctions.BounceEaseOut(1 - t),
    BounceEaseOut: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
};

function lerp(
    a: number | undefined,
    b: number | undefined,
    t: number
): number | undefined {
    if (a === undefined || b === undefined) return undefined;
    return a + (b - a) * t;
}

function interpolateKeyframes(
    keyframes: AnimationKeyframe[],
    time: number
): Partial<{
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    opacity: number;
}> {
    if (keyframes.length === 0) return {};
    if (keyframes.length === 1) return keyframes[0].properties;

    // Find bounding keyframes
    const sorted = [...keyframes].sort((a, b) => a.timestamp - b.timestamp);
    const before = sorted.filter((kf) => kf.timestamp <= time).pop();
    const after = sorted.find((kf) => kf.timestamp > time);

    if (!before && after) return after.properties;
    if (before && !after) return before.properties;
    if (!before || !after) return {};

    const range = after.timestamp - before.timestamp;
    if (range === 0) return before.properties;

    const rawProgress = (time - before.timestamp) / range;
    const easingFn = easingFunctions[after.easing] ?? easingFunctions.Linear;
    const progress = easingFn(Math.max(0, Math.min(1, rawProgress)));

    const result: Record<string, number | undefined> = {};
    const allKeys = new Set([
        ...Object.keys(before.properties),
        ...Object.keys(after.properties)
    ]);

    for (const key of allKeys) {
        if (key === 'fill') continue; // Skip non-numeric
        const a = before.properties[key as keyof typeof before.properties] as
            | number
            | undefined;
        const b = after.properties[key as keyof typeof after.properties] as
            | number
            | undefined;
        result[key] = lerp(a, b, progress);
    }

    return result as Partial<{
        x: number;
        y: number;
        scaleX: number;
        scaleY: number;
        rotation: number;
        opacity: number;
    }>;
}

interface UseAnimationProps {
    stageRef: React.RefObject<Konva.Stage | null>;
}

export const useAnimation = ({ stageRef }: UseAnimationProps) => {
    const [animationState, setAnimationState] = useState<AnimationState>({
        isPlaying: false,
        currentTime: 0,
        totalDuration: 5000, // default 5s
        animations: {}
    });

    const animRef = useRef<Konva.Animation | null>(null);
    const startTimeRef = useRef(0);
    const stateRef = useRef(animationState);
    stateRef.current = animationState;

    // Store original object positions so we can restore after animation
    const originalAttrsRef = useRef<Record<string, Record<string, unknown>>>(
        {}
    );

    const addKeyframe = useCallback(
        (objectId: string, keyframe: AnimationKeyframe) => {
            setAnimationState((prev) => {
                const existing = prev.animations[objectId] ?? {
                    keyframes: [],
                    loop: false
                };
                return {
                    ...prev,
                    animations: {
                        ...prev.animations,
                        [objectId]: {
                            ...existing,
                            keyframes: [...existing.keyframes, keyframe]
                        }
                    }
                };
            });
        },
        []
    );

    const removeKeyframe = useCallback(
        (objectId: string, timestamp: number) => {
            setAnimationState((prev) => {
                const existing = prev.animations[objectId];
                if (!existing) return prev;
                return {
                    ...prev,
                    animations: {
                        ...prev.animations,
                        [objectId]: {
                            ...existing,
                            keyframes: existing.keyframes.filter(
                                (kf) => kf.timestamp !== timestamp
                            )
                        }
                    }
                };
            });
        },
        []
    );

    const updateKeyframeEasing = useCallback(
        (objectId: string, timestamp: number, easing: EasingType) => {
            setAnimationState((prev) => {
                const existing = prev.animations[objectId];
                if (!existing) return prev;
                return {
                    ...prev,
                    animations: {
                        ...prev.animations,
                        [objectId]: {
                            ...existing,
                            keyframes: existing.keyframes.map((kf) =>
                                kf.timestamp === timestamp
                                    ? { ...kf, easing }
                                    : kf
                            )
                        }
                    }
                };
            });
        },
        []
    );

    const setObjectAnimation = useCallback(
        (objectId: string, animation: ObjectAnimation | undefined) => {
            setAnimationState((prev) => {
                const next = { ...prev.animations };
                if (animation) {
                    next[objectId] = animation;
                } else {
                    delete next[objectId];
                }
                return { ...prev, animations: next };
            });
        },
        []
    );

    const setTotalDuration = useCallback((duration: number) => {
        setAnimationState((prev) => ({
            ...prev,
            totalDuration: Math.max(100, duration)
        }));
    }, []);

    const seekTo = useCallback(
        (time: number) => {
            const stage = stageRef.current;
            if (!stage) return;

            const state = stateRef.current;
            const layer = stage.getLayers()[0];
            if (!layer) return;

            // Apply interpolated values to each animated object
            for (const [objectId, animation] of Object.entries(
                state.animations
            )) {
                if (animation.keyframes.length === 0) continue;

                const node = stage.findOne(`#${objectId}`);
                if (!node) continue;

                // Store original attrs on first seek
                if (!originalAttrsRef.current[objectId]) {
                    originalAttrsRef.current[objectId] = {
                        x: node.x(),
                        y: node.y(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                        rotation: node.rotation(),
                        opacity: node.opacity()
                    };
                }

                const effectiveTime = animation.loop
                    ? time %
                      (animation.keyframes[animation.keyframes.length - 1]
                          ?.timestamp ?? state.totalDuration)
                    : time;

                const interpolated = interpolateKeyframes(
                    animation.keyframes,
                    effectiveTime
                );

                if (interpolated.x !== undefined) node.x(interpolated.x);
                if (interpolated.y !== undefined) node.y(interpolated.y);
                if (interpolated.scaleX !== undefined)
                    node.scaleX(interpolated.scaleX);
                if (interpolated.scaleY !== undefined)
                    node.scaleY(interpolated.scaleY);
                if (interpolated.rotation !== undefined)
                    node.rotation(interpolated.rotation);
                if (interpolated.opacity !== undefined)
                    node.opacity(interpolated.opacity);
            }

            layer.batchDraw();
            setAnimationState((prev) => ({ ...prev, currentTime: time }));
        },
        [stageRef]
    );

    const play = useCallback(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const layer = stage.getLayers()[0];
        if (!layer) return;

        // Stop existing animation
        if (animRef.current) {
            animRef.current.stop();
        }

        startTimeRef.current = performance.now() - stateRef.current.currentTime;

        const anim = new Konva.Animation(() => {
            const elapsed = performance.now() - startTimeRef.current;
            const state = stateRef.current;

            if (elapsed >= state.totalDuration) {
                // Animation complete
                anim.stop();
                setAnimationState((prev) => ({
                    ...prev,
                    isPlaying: false,
                    currentTime: prev.totalDuration
                }));
                return;
            }

            // Apply interpolated values
            for (const [objectId, animation] of Object.entries(
                state.animations
            )) {
                if (animation.keyframes.length === 0) continue;
                const node = stage.findOne(`#${objectId}`);
                if (!node) continue;

                const effectiveTime = animation.loop
                    ? elapsed %
                      (animation.keyframes[animation.keyframes.length - 1]
                          ?.timestamp ?? state.totalDuration)
                    : elapsed;

                const interpolated = interpolateKeyframes(
                    animation.keyframes,
                    effectiveTime
                );

                if (interpolated.x !== undefined) node.x(interpolated.x);
                if (interpolated.y !== undefined) node.y(interpolated.y);
                if (interpolated.scaleX !== undefined)
                    node.scaleX(interpolated.scaleX);
                if (interpolated.scaleY !== undefined)
                    node.scaleY(interpolated.scaleY);
                if (interpolated.rotation !== undefined)
                    node.rotation(interpolated.rotation);
                if (interpolated.opacity !== undefined)
                    node.opacity(interpolated.opacity);
            }

            setAnimationState((prev) => ({
                ...prev,
                currentTime: elapsed
            }));
        }, layer);

        animRef.current = anim;
        anim.start();
        setAnimationState((prev) => ({ ...prev, isPlaying: true }));
    }, [stageRef]);

    const pause = useCallback(() => {
        if (animRef.current) {
            animRef.current.stop();
        }
        setAnimationState((prev) => ({ ...prev, isPlaying: false }));
    }, []);

    const stop = useCallback(() => {
        if (animRef.current) {
            animRef.current.stop();
        }

        // Restore original attributes
        const stage = stageRef.current;
        if (stage) {
            for (const [objectId, attrs] of Object.entries(
                originalAttrsRef.current
            )) {
                const node = stage.findOne(`#${objectId}`);
                if (node) {
                    node.setAttrs(attrs);
                }
            }
            stage.getLayers()[0]?.batchDraw();
        }

        originalAttrsRef.current = {};
        setAnimationState((prev) => ({
            ...prev,
            isPlaying: false,
            currentTime: 0
        }));
    }, [stageRef]);

    // Export as WebM video
    const exportVideo = useCallback(
        async (duration?: number): Promise<Blob | null> => {
            const stage = stageRef.current;
            if (!stage) return null;

            const canvas = stage.toCanvas({});
            const stream = canvas.captureStream(30);
            const recorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp8'
            });

            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            return new Promise<Blob>((resolve) => {
                recorder.onstop = () => {
                    resolve(new Blob(chunks, { type: 'video/webm' }));
                };

                recorder.start();

                // Play the animation
                const totalDur = duration ?? stateRef.current.totalDuration;
                const startTime = performance.now();
                const layer = stage.getLayers()[0];

                const renderFrame = () => {
                    const elapsed = performance.now() - startTime;
                    if (elapsed >= totalDur) {
                        recorder.stop();
                        return;
                    }

                    // Apply animation state
                    for (const [objectId, animation] of Object.entries(
                        stateRef.current.animations
                    )) {
                        if (animation.keyframes.length === 0) continue;
                        const node = stage.findOne(`#${objectId}`);
                        if (!node) continue;

                        const effectiveTime = animation.loop
                            ? elapsed %
                              (animation.keyframes[
                                  animation.keyframes.length - 1
                              ]?.timestamp ?? totalDur)
                            : elapsed;

                        const interpolated = interpolateKeyframes(
                            animation.keyframes,
                            effectiveTime
                        );

                        if (interpolated.x !== undefined)
                            node.x(interpolated.x);
                        if (interpolated.y !== undefined)
                            node.y(interpolated.y);
                        if (interpolated.scaleX !== undefined)
                            node.scaleX(interpolated.scaleX);
                        if (interpolated.scaleY !== undefined)
                            node.scaleY(interpolated.scaleY);
                        if (interpolated.rotation !== undefined)
                            node.rotation(interpolated.rotation);
                        if (interpolated.opacity !== undefined)
                            node.opacity(interpolated.opacity);
                    }

                    layer?.batchDraw();
                    requestAnimationFrame(renderFrame);
                };

                requestAnimationFrame(renderFrame);
            });
        },
        [stageRef]
    );

    return {
        animationState,
        addKeyframe,
        removeKeyframe,
        updateKeyframeEasing,
        setObjectAnimation,
        setTotalDuration,
        seekTo,
        play,
        pause,
        stop,
        exportVideo
    };
};
