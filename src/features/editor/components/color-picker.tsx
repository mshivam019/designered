import { ChromePicker, CirclePicker } from 'react-color';

import { colors } from '@/features/editor/types';
import { rgbaObjectToString } from '@/features/editor/utils';

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
}

const AnyChromePicker = ChromePicker as unknown as React.ComponentType<{
    color: string;
    onChange: (color: {
        rgb: { r: number; g: number; b: number; a: number };
    }) => void;
    className?: string;
}>;

const AnyCirclePicker = CirclePicker as unknown as React.ComponentType<{
    color: string;
    colors: string[];
    onChangeComplete: (color: {
        rgb: { r: number; g: number; b: number; a: number };
    }) => void;
}>;

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
    return (
        <div className="w-full space-y-4">
            <AnyChromePicker
                color={value}
                onChange={(color: {
                    rgb: { r: number; g: number; b: number; a: number };
                }) => {
                    const formattedValue = rgbaObjectToString(color.rgb);
                    onChange(formattedValue);
                }}
                className="border rounded-lg"
            />
            <AnyCirclePicker
                color={value}
                colors={colors}
                onChangeComplete={(color: {
                    rgb: { r: number; g: number; b: number; a: number };
                }) => {
                    const formattedValue = rgbaObjectToString(color.rgb);
                    onChange(formattedValue);
                }}
            />
        </div>
    );
};
