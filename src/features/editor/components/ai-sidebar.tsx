import { useState } from 'react';

import { ActiveTool, Editor } from '@/features/editor/types';
import { ToolSidebarClose } from '@/features/editor/components/tool-sidebar-close';
import { ToolSidebarHeader } from '@/features/editor/components/tool-sidebar-header';

import { useGenerateImage } from '@/features/ai/api/use-generate-image';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AiSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
}

export const AiSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool
}: AiSidebarProps) => {
    const mutation = useGenerateImage();

    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        mutation.mutate(
            { prompt: value },
            {
                onSuccess: ({ data }) => {
                    if (data.error)
                        setError(
                            'Failed to generate image, Please try again after some time'
                        );
                    else editor?.addBase64(data.b64_json);
                },
                onError: () => {
                    setError(
                        'Failed to generate image, Please try again after some time'
                    );
                }
            }
        );
    };

    const onClose = () => {
        onChangeActiveTool('select');
    };

    return (
        <aside
            className={cn(
                'bg-white relative border-r z-[40] w-[360px] h-full flex flex-col',
                activeTool === 'ai' ? 'visible' : 'hidden'
            )}
        >
            <ToolSidebarHeader
                title="AI"
                description="Generate an image using AI"
            />
            <ScrollArea>
                <form onSubmit={onSubmit} className="p-4 space-y-6">
                    <Textarea
                        disabled={mutation.isPending}
                        placeholder="An astronaut riding a horse on mars, hd, dramatic lighting"
                        cols={30}
                        rows={10}
                        required
                        minLength={3}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <Button
                        disabled={mutation.isPending}
                        type="submit"
                        className="w-full"
                    >
                        Generate
                    </Button>
                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}
                </form>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};
