import {
    Triangle as IoTriangle,
    Diamond as FaDiamond,
    Square as FaSquareFull,
    SquareDot as FaSquare,
    Circle as FaCircle,
    Star,
    ArrowRight,
    Hexagon,
    Pentagon,
    Octagon,
    Heart,
    Plus,
    Minus
} from 'lucide-react';

import { type ActiveTool, type Editor } from '@/features/editor/types';
import { ShapeTool } from '@/features/editor/components/shape-tool';
import { ToolSidebarClose } from '@/features/editor/components/tool-sidebar-close';
import { ToolSidebarHeader } from '@/features/editor/components/tool-sidebar-header';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShapeSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ShapeSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool
}: ShapeSidebarProps) => {
    const onClose = () => {
        onChangeActiveTool('select');
    };

    return (
        <aside
            className={cn(
                'bg-white relative border-r z-[40] w-[360px] h-full flex flex-col',
                activeTool === 'shapes' ? 'visible' : 'hidden'
            )}
        >
            <ToolSidebarHeader
                title="Shapes"
                description="Add shapes to your canvas"
            />
            <ScrollArea>
                <div className="p-4 space-y-5">
                    {/* Basic Shapes */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                            Basic
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <ShapeTool
                                onClick={() => editor?.addRectangle()}
                                icon={FaSquareFull}
                                label="Rectangle"
                            />
                            <ShapeTool
                                onClick={() => editor?.addSoftRectangle()}
                                icon={FaSquare}
                                label="Rounded"
                            />
                            <ShapeTool
                                onClick={() => editor?.addCircle()}
                                icon={FaCircle}
                                label="Circle"
                            />
                        </div>
                    </div>

                    {/* Polygons */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                            Polygons
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <ShapeTool
                                onClick={() => editor?.addTriangle()}
                                icon={IoTriangle}
                                label="Triangle"
                            />
                            <ShapeTool
                                onClick={() => editor?.addInverseTriangle()}
                                icon={IoTriangle}
                                iconClassName="rotate-180"
                                label="Inv Triangle"
                            />
                            <ShapeTool
                                onClick={() => editor?.addDiamond()}
                                icon={FaDiamond}
                                label="Diamond"
                            />
                            <ShapeTool
                                onClick={() => editor?.addPentagon()}
                                icon={Pentagon}
                                label="Pentagon"
                            />
                            <ShapeTool
                                onClick={() => editor?.addHexagon()}
                                icon={Hexagon}
                                label="Hexagon"
                            />
                            <ShapeTool
                                onClick={() => editor?.addOctagon()}
                                icon={Octagon}
                                label="Octagon"
                            />
                        </div>
                    </div>

                    {/* Special */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                            Special
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <ShapeTool
                                onClick={() => editor?.addStar()}
                                icon={Star}
                                label="Star"
                            />
                            <ShapeTool
                                onClick={() => editor?.addHeart()}
                                icon={Heart}
                                label="Heart"
                            />
                            <ShapeTool
                                onClick={() => editor?.addCross()}
                                icon={Plus}
                                label="Cross"
                            />
                        </div>
                    </div>

                    {/* Lines & Arrows */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                            Lines & Arrows
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <ShapeTool
                                onClick={() => editor?.addStraightLine()}
                                icon={Minus}
                                label="Line"
                            />
                            <ShapeTool
                                onClick={() => editor?.addArrow()}
                                icon={ArrowRight}
                                label="Arrow"
                            />
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};
