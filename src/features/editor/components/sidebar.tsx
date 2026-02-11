'use client';

import {
    LayoutTemplate,
    ImageIcon,
    Layers,
    Pencil,
    Settings,
    Shapes,
    Type
} from 'lucide-react';

import { type ActiveTool } from '@/features/editor/types';
import { SidebarItem } from '@/features/editor/components/sidebar-item';

interface SidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
}

export const Sidebar = ({ activeTool, onChangeActiveTool }: SidebarProps) => {
    return (
        <aside className="bg-[#1e1e2e] flex flex-col w-[72px] h-full overflow-y-auto">
            <ul className="flex flex-col">
                <SidebarItem
                    icon={ImageIcon}
                    label="Image"
                    isActive={activeTool === 'images'}
                    onClick={() => onChangeActiveTool('images')}
                />
                <SidebarItem
                    icon={Type}
                    label="Text"
                    isActive={activeTool === 'text'}
                    onClick={() => onChangeActiveTool('text')}
                />
                <SidebarItem
                    icon={Shapes}
                    label="Shapes"
                    isActive={activeTool === 'shapes'}
                    onClick={() => onChangeActiveTool('shapes')}
                />
                <SidebarItem
                    icon={Pencil}
                    label="Draw"
                    isActive={activeTool === 'draw'}
                    onClick={() => onChangeActiveTool('draw')}
                />
                <SidebarItem
                    icon={Layers}
                    label="Layers"
                    isActive={activeTool === 'layers'}
                    onClick={() => onChangeActiveTool('layers')}
                />
                <SidebarItem
                    icon={Settings}
                    label="Settings"
                    isActive={activeTool === 'settings'}
                    onClick={() => onChangeActiveTool('settings')}
                />
            </ul>
        </aside>
    );
};
