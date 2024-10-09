import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';

import { cn } from '@/lib/utils';
import { Palette } from 'lucide-react';

const font = Space_Grotesk({
    weight: ['700'],
    subsets: ['latin']
});

export const Logo = () => {
    return (
        <Link href="/">
            <div className="flex items-center gap-x-2 hover:opacity-75 transition h-[68px] px-4">
                <div className="size-8 relative">
                    <Palette className="mr-2 h-8 w-8 text-blue-500" />
                </div>
                <h1 className={cn(font.className, 'text-xl font-bold')}>
                    Designered
                </h1>
            </div>
        </Link>
    );
};
