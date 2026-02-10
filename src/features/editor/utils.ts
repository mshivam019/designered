import { v4 as uuid } from 'uuid';
import type { RGBColor } from 'react-color';

export function downloadFile(file: string, type: string) {
    const anchorElement = document.createElement('a');

    anchorElement.href = file;
    anchorElement.download = `${uuid()}.${type}`;
    document.body.appendChild(anchorElement);
    anchorElement.click();
    anchorElement.remove();
}

export function isTextType(type: string | undefined) {
    return type === 'text';
}

export function rgbaObjectToString(rgba: RGBColor | 'transparent') {
    if (rgba === 'transparent') {
        return `rgba(0,0,0,0)`;
    }

    const alpha = rgba.a ?? 1;

    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha})`;
}

export const getKonvaFilter = (value: string): string | null => {
    switch (value) {
        case 'grayscale':
            return 'Grayscale';
        case 'sepia':
            return 'Sepia';
        case 'blur':
            return 'Blur';
        case 'brighten':
            return 'Brighten';
        case 'contrast':
            return 'Contrast';
        case 'invert':
            return 'Invert';
        case 'pixelate':
            return 'Pixelate';
        case 'emboss':
            return 'Emboss';
        case 'noise':
            return 'Noise';
        case 'posterize':
            return 'Posterize';
        case 'solarize':
            return 'Solarize';
        case 'hsl':
            return 'HSL';
        case 'enhance':
            return 'Enhance';
        case 'none':
        default:
            return null;
    }
};
