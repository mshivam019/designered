import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, Loader, RefreshCw } from 'lucide-react';
import { type ActiveTool, type Editor } from '@/features/editor/types';
import { ToolSidebarClose } from '@/features/editor/components/tool-sidebar-close';
import { ToolSidebarHeader } from '@/features/editor/components/tool-sidebar-header';
import { useGetImages } from '@/features/images/api/use-get-images';
import { cn } from '@/lib/utils';
import { UploadButton } from '@/lib/uploadthing';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Hint } from '@/components/hint';

interface UploadedImage {
    url: string;
    name: string;
    timestamp: number;
}

interface ImageSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
}

const STORAGE_KEY = 'uploadedImages_v1';

function loadCachedImages(): UploadedImage[] {
    try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            return JSON.parse(cached) as UploadedImage[];
        }
    } catch (error) {
        console.error('Failed to parse cached images:', error);
        localStorage.removeItem(STORAGE_KEY);
    }
    return [];
}

function saveCachedImages(images: UploadedImage[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

export const ImageSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool
}: ImageSidebarProps) => {
    const { data, isLoading, isError, refetch, isFetching } = useGetImages();
    const [uploadedImages, setUploadedImages] =
        useState<UploadedImage[]>(loadCachedImages);
    const [isUploading, setIsUploading] = useState(false);

    const onClose = () => {
        onChangeActiveTool('select');
    };

    return (
        <aside
            className={cn(
                'bg-white relative border-r z-[40] w-[360px] h-full flex flex-col',
                activeTool === 'images' ? 'visible' : 'hidden'
            )}
        >
            <ToolSidebarHeader
                title="Images"
                description="Add images to your canvas"
            />

            <div className="border-b">
                <div className="p-4">
                    <UploadButton
                        onUploadProgress={() => {
                            setIsUploading(true);
                        }}
                        appearance={{
                            button: cn(
                                'w-full text-sm font-medium text-white bg-primary border border-primary hover:bg-primary-dark',
                                isUploading && 'opacity-50 cursor-not-allowed'
                            ),
                            allowedContent: 'hidden'
                        }}
                        content={{
                            button: isUploading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader className="size-4 animate-spin" />
                                    <span>Uploading...</span>
                                </div>
                            ) : (
                                'Upload Image'
                            )
                        }}
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                            setIsUploading(false);
                            if (!res[0]) return;
                            if (editor) {
                                editor.addImage(res[0].url);
                                if (
                                    !res[0]?.url ||
                                    !res[0].name ||
                                    typeof res[0].url !== 'string' ||
                                    typeof res[0].name !== 'string'
                                )
                                    return;
                                const newImage = {
                                    url: res[0].url,
                                    name: res[0].name,
                                    timestamp: Date.now()
                                };
                                setUploadedImages((prev) => {
                                    const updated = [newImage, ...prev];
                                    saveCachedImages(updated);
                                    return updated;
                                });
                            }
                        }}
                        onUploadError={() => {
                            setIsUploading(false);
                        }}
                    />
                </div>

                {uploadedImages.length > 0 && (
                    <div className="px-4 pb-4">
                        <p className="text-xs text-muted-foreground mb-2">
                            Recently Uploaded
                        </p>
                        <ScrollArea className="w-full whitespace-nowrap pb-3">
                            <div className="flex gap-2">
                                {uploadedImages.map((image) => (
                                    <button
                                        key={image.timestamp}
                                        onClick={() =>
                                            editor?.addImage(image.url)
                                        }
                                        className="relative w-[100px] h-[100px] flex-shrink-0 group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                                    >
                                        <Image
                                            fill
                                            src={image.url}
                                            alt={image.name}
                                            sizes="100px"
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="flex items-center justify-center flex-1">
                    <Loader className="size-4 text-muted-foreground animate-spin" />
                </div>
            )}
            {isError && (
                <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
                    <AlertTriangle className="size-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-xs">
                        Failed to fetch images
                    </p>
                </div>
            )}
            <ScrollArea className="flex-1">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">
                            Stock Images
                        </p>
                        <Hint label="Refresh images" side="left">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => refetch()}
                                disabled={isFetching}
                            >
                                <RefreshCw
                                    className={cn(
                                        'size-3',
                                        isFetching && 'animate-spin'
                                    )}
                                />
                            </Button>
                        </Hint>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {data?.map((image) => (
                            <button
                                onClick={() =>
                                    editor?.addImage(image.urls.regular)
                                }
                                key={image.id}
                                className="relative w-full h-[100px] group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                            >
                                <Image
                                    fill
                                    src={image.urls.small}
                                    alt={image.alt_description ?? 'Image'}
                                    sizes="160px"
                                    className="object-cover"
                                />
                                <Link
                                    target="_blank"
                                    href={image.links.html}
                                    className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50 text-left"
                                >
                                    {image.user.name}
                                </Link>
                            </button>
                        ))}
                    </div>
                </div>
            </ScrollArea>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    );
};
