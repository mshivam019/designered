import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    isActive?: boolean;
    onClick: () => void;
}

export const SidebarItem = ({
    icon: Icon,
    label,
    isActive,
    onClick
}: SidebarItemProps) => {
    return (
        <Button
            variant="ghost"
            onClick={onClick}
            className={cn(
                'w-full h-full aspect-square px-3 py-4 flex flex-col rounded-none transition-colors',
                isActive && 'bg-white/10 text-[#2e62cb]',
                !isActive && 'text-white/70 hover:text-white hover:bg-white/5'
            )}
        >
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center justify-center w-full"
            >
                <Icon className="size-5 stroke-2 shrink-0" />
                <span className="mt-2 text-[10px] font-medium">{label}</span>
            </motion.div>
        </Button>
    );
};
