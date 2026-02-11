import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ShapeToolProps {
    onClick: () => void;
    icon: LucideIcon;
    iconClassName?: string;
    label?: string;
}

export const ShapeTool = ({
    onClick,
    icon: Icon,
    iconClassName,
    label
}: ShapeToolProps) => {
    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-center gap-1.5 rounded-lg border border-transparent p-3 transition-all hover:border-border hover:bg-accent/50 hover:shadow-sm active:scale-95"
        >
            <div className="aspect-square w-full flex items-center justify-center">
                <Icon
                    className={cn(
                        'h-full w-full text-muted-foreground transition-colors group-hover:text-foreground',
                        iconClassName
                    )}
                />
            </div>
            {label && (
                <span className="text-[10px] font-medium text-muted-foreground transition-colors group-hover:text-foreground leading-none">
                    {label}
                </span>
            )}
        </button>
    );
};
