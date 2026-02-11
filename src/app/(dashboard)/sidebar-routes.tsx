'use client';

import { 
    FolderOpen, 
    Home, 
    LayoutTemplate, 
    MessageCircleQuestion, 
    Settings, 
    Trash2 
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Separator } from '@/components/ui/separator';

import { SidebarItem } from './sidebar-item';

export const SidebarRoutes = () => {
    const pathname = usePathname();

    return (
        <div className="flex flex-col gap-y-4 flex-1">
            <ul className="flex flex-col gap-y-1 px-3">
                <SidebarItem
                    href="/"
                    icon={Home}
                    label="Home"
                    isActive={pathname === '/'}
                />
            </ul>
            <div className="px-3">
                <Separator className="bg-white/10" />
            </div>
            <ul className="flex flex-col gap-y-1 px-3">
                <SidebarItem
                    href="/dashboard"
                    icon={FolderOpen}
                    label="All Projects"
                    isActive={pathname === '/dashboard'}
                />
                <SidebarItem
                    href="/dashboard?tab=templates"
                    icon={LayoutTemplate}
                    label="Templates"
                    isActive={pathname === '/dashboard?tab=templates'}
                />
            </ul>
            <div className="px-3">
                <Separator className="bg-white/10" />
            </div>
            <ul className="flex flex-col gap-y-1 px-3">
                <SidebarItem
                    href="/dashboard?tab=trash"
                    icon={Trash2}
                    label="Trash"
                    isActive={pathname === '/dashboard?tab=trash'}
                />
            </ul>
            <div className="px-3 mt-auto">
                <Separator className="bg-white/10" />
            </div>
            <ul className="flex flex-col gap-y-1 px-3">
                <SidebarItem
                    href="/dashboard?tab=settings"
                    icon={Settings}
                    label="Settings"
                    isActive={pathname === '/dashboard?tab=settings'}
                />
                <SidebarItem
                    href="mailto:mshivam019@gmail.com"
                    icon={MessageCircleQuestion}
                    label="Get Help"
                />
            </ul>
        </div>
    );
};
