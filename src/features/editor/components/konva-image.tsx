'use client';

import { useEffect, useRef } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { useImage } from 'react-konva-utils';
import Konva from 'konva';
import { type CanvasObject } from '@/features/editor/types';

// Map filter string names (stored in CanvasObject.filters) to actual Konva filter functions
const FILTER_MAP: Record<string, typeof Konva.Filters.Blur> = {
    grayscale: Konva.Filters.Grayscale,
    sepia: Konva.Filters.Sepia,
    blur: Konva.Filters.Blur,
    invert: Konva.Filters.Invert,
    brighten: Konva.Filters.Brighten,
    contrast: Konva.Filters.Contrast,
    emboss: Konva.Filters.Emboss,
    enhance: Konva.Filters.Enhance,
    noise: Konva.Filters.Noise,
    pixelate: Konva.Filters.Pixelate,
    posterize: Konva.Filters.Posterize,
    solarize: Konva.Filters.Solarize,
    hsl: Konva.Filters.HSL
};

// Default filter property values when a filter is applied
const FILTER_DEFAULTS: Record<string, Record<string, number | boolean>> = {
    blur: { blurRadius: 10 },
    brighten: { brightness: 0.2 },
    contrast: { contrast: 40 },
    enhance: { enhance: 0.4 },
    noise: { noise: 0.3 },
    pixelate: { pixelSize: 8 },
    posterize: { levels: 0.4 },
    hsl: { luminance: 0.1 },
    emboss: { embossStrength: 0.5, embossWhiteLevel: 0.5, embossBlend: true }
};

interface KonvaImageNodeProps {
    obj: CanvasObject;
    commonProps: Record<string, unknown>;
}

export const KonvaImageNode = ({ obj, commonProps }: KonvaImageNodeProps) => {
    const [image] = useImage(obj.src ?? '', 'anonymous');
    const imageRef = useRef<Konva.Image>(null);

    // Resolve string filter names to actual Konva filter functions
    const activeFilterNames =
        obj.filters?.filter((f) => f !== 'none' && FILTER_MAP[f]) ?? [];
    const konvaFilters = activeFilterNames.map((f) => FILTER_MAP[f]!);

    // Collect filter-specific props (e.g. blurRadius, brightness)
    const filterProps: Record<string, number | boolean> = {};
    for (const name of activeFilterNames) {
        const defaults = FILTER_DEFAULTS[name];
        if (defaults) {
            Object.assign(filterProps, defaults);
        }
    }

    // Serialize active filter names for dependency tracking
    const filterKey = activeFilterNames.join(',');

    // Cache the image node whenever the image loads or filters change.
    // Konva requires cache() for filters to take effect.
    useEffect(() => {
        const node = imageRef.current;
        if (!node || !image) return;

        // Small delay to let react-konva finish updating attrs
        requestAnimationFrame(() => {
            try {
                if (konvaFilters.length > 0) {
                    node.cache();
                    node.getLayer()?.batchDraw();
                } else {
                    // Clear cache when no filters
                    node.clearCache();
                    node.getLayer()?.batchDraw();
                }
            } catch {
                // Ignore cache errors (e.g. node not yet attached)
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [image, filterKey]);

    if (!image) return null;

    return (
        <KonvaImage
            {...commonProps}
            ref={imageRef}
            image={image}
            width={obj.width ?? image.naturalWidth}
            height={obj.height ?? image.naturalHeight}
            filters={konvaFilters.length > 0 ? konvaFilters : undefined}
            {...filterProps}
        />
    );
};
