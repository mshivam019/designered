'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Save, Minimize, ZoomIn, ZoomOut } from 'lucide-react';
import debounce from 'lodash.debounce';

import { type ResponseType } from '@/features/projects/api/use-get-project';
import { useAddPage } from '@/features/projects/api/use-add-page';
import { useSaveAllPages } from '@/features/projects/api/use-save-all-pages';
import { useDeletePage } from '@/features/projects/api/use-delete-page';
import dynamic from 'next/dynamic';
import {
    type ActiveTool,
    type PageJson,
    selectionDependentTools
} from '@/features/editor/types';
import { Navbar } from '@/features/editor/components/navbar';
import { useEditor } from '@/features/editor/hooks/use-editor';
import { useAnimation } from '@/features/editor/hooks/use-animation';
import { Sidebar } from '@/features/editor/components/sidebar';
import { Toolbar } from '@/features/editor/components/toolbar';

const ShapeSidebar = dynamic(() =>
    import('@/features/editor/components/shape-sidebar').then((m) => ({
        default: m.ShapeSidebar
    }))
);
const FillColorSidebar = dynamic(() =>
    import('@/features/editor/components/fill-color-sidebar').then((m) => ({
        default: m.FillColorSidebar
    }))
);
const StrokeColorSidebar = dynamic(() =>
    import('@/features/editor/components/stroke-color-sidebar').then((m) => ({
        default: m.StrokeColorSidebar
    }))
);
const StrokeWidthSidebar = dynamic(() =>
    import('@/features/editor/components/stroke-width-sidebar').then((m) => ({
        default: m.StrokeWidthSidebar
    }))
);
const OpacitySidebar = dynamic(() =>
    import('@/features/editor/components/opacity-sidebar').then((m) => ({
        default: m.OpacitySidebar
    }))
);
const TextSidebar = dynamic(() =>
    import('@/features/editor/components/text-sidebar').then((m) => ({
        default: m.TextSidebar
    }))
);
const FontSidebar = dynamic(() =>
    import('@/features/editor/components/font-sidebar').then((m) => ({
        default: m.FontSidebar
    }))
);
const ImageSidebar = dynamic(() =>
    import('@/features/editor/components/image-sidebar').then((m) => ({
        default: m.ImageSidebar
    }))
);
const FilterSidebar = dynamic(() =>
    import('@/features/editor/components/filter-sidebar').then((m) => ({
        default: m.FilterSidebar
    }))
);
const DrawSidebar = dynamic(() =>
    import('@/features/editor/components/draw-sidebar').then((m) => ({
        default: m.DrawSidebar
    }))
);
const SettingsSidebar = dynamic(() =>
    import('@/features/editor/components/settings-sidebar').then((m) => ({
        default: m.SettingsSidebar
    }))
);
const LayersSidebar = dynamic(() =>
    import('@/features/editor/components/layers-sidebar').then((m) => ({
        default: m.LayersSidebar
    }))
);
const AnimationPanel = dynamic(
    () =>
        import('@/features/editor/components/animation-panel').then((m) => ({
            default: m.AnimationPanel
        })),
    { ssr: false }
);
import { Button } from '@/components/ui/button';
import { Hint } from '@/components/hint';
import { defaultJson } from '../defaultJson';

const PageCanvas = dynamic(
    () =>
        import('./page-canvas').then((m) => ({
            default: m.PageCanvas
        })),
    { ssr: false }
);

interface EditorProps {
    pageData: ResponseType['data'];
}

export const Editor = ({ pageData }: EditorProps) => {
    const projectId = pageData[0]?.projectId ?? '';
    const [pages, setPages] = useState(
        pageData ?? [
            {
                id: '',
                json: defaultJson,
                height: 900,
                width: 1200
            }
        ]
    );
    const [currentPage, setCurrentPage] = useState(0);

    // Refs to avoid stale closures in callbacks
    const pagesRef = useRef(pages);
    pagesRef.current = pages;
    const currentPageRef = useRef(currentPage);
    currentPageRef.current = currentPage;

    // Thumbnails for non-active pages (captured before switching away)
    const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

    const { mutate: addPageMutate } = useAddPage(projectId);
    const { mutate: saveAllPages } = useSaveAllPages(projectId);
    const { mutate: deletePage } = useDeletePage(
        projectId,
        pages[currentPage]?.id
    );

    const [activeTool, setActiveTool] = useState<ActiveTool>('select');
    const onClearSelection = useCallback(() => {
        if (selectionDependentTools.includes(activeTool)) {
            setActiveTool('select');
        }
    }, [activeTool]);

    const noopSave = useCallback(() => {}, []);

    const {
        editor,
        objects,
        setObjects,
        selectedIds,
        setSelectedIds,
        isDrawingMode,
        setIsDrawingMode,
        drawingPoints,
        setDrawingPoints,
        background,
        pageWidth,
        pageHeight,
        stageRef,
        containerRef,
        stageSize,
        zoom,
        autoZoom,
        zoomIn,
        zoomOut,
        historySave
    } = useEditor({
        defaultState: pages[0]?.json ?? defaultJson,
        defaultWidth: pages[0]?.width ?? 1200,
        defaultHeight: pages[0]?.height ?? 900,
        clearSelectionCallback: onClearSelection,
        saveCallback: noopSave
    });

    const {
        animationState,
        addKeyframe,
        removeKeyframe,
        updateKeyframeEasing,
        setTotalDuration,
        seekTo,
        play,
        pause,
        stop: stopAnimation,
        exportVideo
    } = useAnimation({ stageRef });

    // Helper: capture a thumbnail data URL from the current Konva stage.
    const captureThumbnail = useCallback(() => {
        const stage = stageRef.current;
        if (!stage) return null;
        try {
            // Capture just the canvas area (not the grey surround)
            const oX = (stageSize.width - pageWidth * zoom) / 2;
            const oY = (stageSize.height - pageHeight * zoom) / 2;
            return stage.toDataURL({
                x: oX,
                y: oY,
                width: pageWidth * zoom,
                height: pageHeight * zoom,
                pixelRatio: 0.5
            });
        } catch {
            return null;
        }
    }, [stageRef, stageSize, pageWidth, pageHeight, zoom]);

    // Helper: snapshot current canvas into the pages array (local state only).
    // Returns the updated pages array so callers can use it immediately.
    const snapshotCurrentPage = useCallback(() => {
        const json = JSON.stringify({
            objects,
            background
        } satisfies PageJson);
        const cp = currentPageRef.current;
        setPages((prev) => {
            const updated = [...prev];
            updated[cp] = {
                ...updated[cp],
                json,
                width: pageWidth,
                height: pageHeight
            };
            return updated;
        });
        // Also update the ref synchronously so subsequent reads are fresh
        const updatedPages = [...pagesRef.current];
        updatedPages[cp] = {
            ...updatedPages[cp],
            json,
            width: pageWidth,
            height: pageHeight
        };
        pagesRef.current = updatedPages;

        // Capture thumbnail for the page we're leaving
        const thumb = captureThumbnail();
        if (thumb) {
            setThumbnails((prev) => ({ ...prev, [cp]: thumb }));
        }

        return updatedPages;
    }, [objects, background, pageWidth, pageHeight, captureThumbnail]);

    // Switch between pages
    const switchPage = useCallback(
        (pageIndex: number) => {
            if (!editor || pageIndex === currentPageRef.current) return;

            // Snapshot current page into pages array + ref
            const updatedPages = snapshotCurrentPage();

            setCurrentPage(pageIndex);

            // Load target page from the freshly-updated array
            const targetJson = updatedPages[pageIndex]?.json ?? defaultJson;
            editor.loadJson(targetJson);
        },
        [editor, snapshotCurrentPage]
    );

    // Add a new page
    const addNewPage = useCallback(() => {
        if (!editor) return;

        // Snapshot current page so its content is preserved
        const savedPages = snapshotCurrentPage();

        addPageMutate(
            {
                projectId,
                pageNumber: savedPages.length + 1,
                json: defaultJson,
                height: 900,
                width: 1200
            },
            {
                onSuccess: ({ data }) => {
                    const newPage = {
                        id: data.id,
                        json: defaultJson,
                        height: 900,
                        width: 1200,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                        projectId: data.projectId,
                        pageNumber: data.pageNumber
                    };

                    // Append the new page
                    const latestPages = [...pagesRef.current, newPage];
                    pagesRef.current = latestPages;
                    setPages(latestPages);

                    const newIndex = latestPages.length - 1;
                    setCurrentPage(newIndex);
                    currentPageRef.current = newIndex;

                    // Clear canvas for the new page
                    editor.loadJson(defaultJson);

                    // Persist ALL pages (including current page snapshot) to server
                    saveAllPages({
                        pages: latestPages.map((page, idx) => ({
                            id: page.id,
                            json: page.json,
                            height: page.height,
                            width: page.width,
                            projectId,
                            pageNumber: idx + 1
                        })),
                        silent: true
                    });
                }
            }
        );
    }, [editor, snapshotCurrentPage, addPageMutate, saveAllPages, projectId]);

    const onChangeActiveTool = useCallback(
        (tool: ActiveTool) => {
            if (tool === 'draw') {
                editor?.enableDrawingMode();
            }
            if (activeTool === 'draw') {
                editor?.disableDrawingMode();
            }
            if (tool === activeTool) {
                return setActiveTool('select');
            }
            setActiveTool(tool);
        },
        [activeTool, editor]
    );

    // Delete page
    const handleDeletePageAt = useCallback(
        (indexToDelete: number) => {
            if (!editor || pagesRef.current.length <= 1) return;

            // Snapshot current page first
            snapshotCurrentPage();

            const latestPages = pagesRef.current;
            const pageToDelete = latestPages[indexToDelete].id;
            const updatedPages = latestPages.filter(
                (_, i) => i !== indexToDelete
            );

            let newActiveIndex = currentPageRef.current;
            if (indexToDelete === currentPageRef.current) {
                newActiveIndex = indexToDelete > 0 ? indexToDelete - 1 : 0;
            } else if (indexToDelete < currentPageRef.current) {
                newActiveIndex = currentPageRef.current - 1;
            }

            saveAllPages({
                pages: updatedPages.map((page, index) => ({
                    id: page.id,
                    json: page.json,
                    height: page.height,
                    width: page.width,
                    projectId,
                    pageNumber: index + 1
                })),
                silent: true
            });

            pagesRef.current = updatedPages;
            setPages(updatedPages);
            setCurrentPage(newActiveIndex);
            currentPageRef.current = newActiveIndex;

            if (
                indexToDelete === currentPageRef.current ||
                indexToDelete === currentPage
            ) {
                editor.loadJson(
                    updatedPages[newActiveIndex]?.json ?? defaultJson
                );
            }

            deletePage({
                param: { id: projectId, pageId: pageToDelete }
            });
        },
        [
            editor,
            snapshotCurrentPage,
            saveAllPages,
            deletePage,
            projectId,
            currentPage
        ]
    );

    // Manual save
    const handleSave = useCallback(() => {
        if (!editor) return;

        // Snapshot current canvas into pages (uses refs, always fresh)
        const updatedPages = snapshotCurrentPage();

        saveAllPages({
            pages: updatedPages.map((page, idx) => ({
                id: page.id,
                json: page.json,
                height: page.height,
                width: page.width,
                projectId,
                pageNumber: idx + 1
            }))
        });
    }, [editor, snapshotCurrentPage, saveAllPages, projectId]);

    // Debounced auto-save: silently saves 2s after the last canvas change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedAutoSave = useCallback(
        debounce(() => {
            const latestPages = pagesRef.current;
            const cp = currentPageRef.current;
            const json = JSON.stringify({
                objects: latestPages[cp]?.json
                    ? (JSON.parse(latestPages[cp].json) as { objects: unknown })
                          .objects
                    : [],
                background: latestPages[cp]?.json
                    ? (
                          JSON.parse(latestPages[cp].json) as {
                              background: string;
                          }
                      ).background
                    : 'white'
            });

            // Re-snapshot to ensure fresh data
            const updatedPages = [...latestPages];
            updatedPages[cp] = { ...updatedPages[cp], json };
            pagesRef.current = updatedPages;

            saveAllPages({
                pages: updatedPages.map((page, idx) => ({
                    id: page.id,
                    json: page.json,
                    height: page.height,
                    width: page.width,
                    projectId,
                    pageNumber: idx + 1
                })),
                silent: true
            });
        }, 3000),
        [saveAllPages, projectId]
    );

    // Trigger auto-save whenever objects or background change
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        // Snapshot into pages ref before auto-saving
        const json = JSON.stringify({ objects, background } satisfies PageJson);
        const cp = currentPageRef.current;
        const updatedPages = [...pagesRef.current];
        updatedPages[cp] = {
            ...updatedPages[cp],
            json,
            width: pageWidth,
            height: pageHeight
        };
        pagesRef.current = updatedPages;
        setPages(updatedPages);

        debouncedAutoSave();

        return () => {
            debouncedAutoSave.cancel();
        };
    }, [objects, background, pageWidth, pageHeight, debouncedAutoSave]);

    return (
        <div className="h-full flex flex-col">
            <Navbar
                id={projectId}
                editor={editor}
                activeTool={activeTool}
                onChangeActiveTool={onChangeActiveTool}
                onSave={handleSave}
            />
            <div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
                <Sidebar
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <ShapeSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <FillColorSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <StrokeColorSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <StrokeWidthSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <OpacitySidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <TextSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <FontSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <ImageSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <FilterSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <DrawSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <SettingsSidebar
                    editor={editor}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <LayersSidebar
                    editor={editor}
                    objects={objects}
                    setObjects={setObjects}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    activeTool={activeTool}
                    onChangeActiveTool={onChangeActiveTool}
                />
                <main className="bg-muted flex-1 overflow-hidden relative flex flex-col">
                    {/* Floating toolbar */}
                    <Toolbar
                        editor={editor}
                        activeTool={activeTool}
                        onChangeActiveTool={setActiveTool}
                        key={`${editor?.selectedObjects[0]?.type ?? 'none'}-${editor?.selectedObjects.length ?? 0}`}
                    />

                    {/* Canvas area — fills entire viewport */}
                    <div className="flex-1 relative">
                        <PageCanvas
                            objects={objects}
                            setObjects={setObjects}
                            selectedIds={selectedIds}
                            setSelectedIds={setSelectedIds}
                            background={background}
                            pageWidth={pageWidth}
                            pageHeight={pageHeight}
                            stageRef={stageRef}
                            containerRef={containerRef}
                            stageSize={stageSize}
                            zoom={zoom}
                            isDrawingMode={isDrawingMode}
                            drawingPoints={drawingPoints}
                            setDrawingPoints={setDrawingPoints}
                            setIsDrawingMode={setIsDrawingMode}
                            save={historySave}
                            strokeColor={
                                editor?.getActiveStrokeColor() ??
                                'rgba(0,0,0,1)'
                            }
                            strokeWidth={editor?.getActiveStrokeWidth() ?? 2}
                            autoZoom={autoZoom}
                            onCopy={() => editor?.onCopy()}
                            onPaste={() => editor?.onPaste()}
                        />
                    </div>

                    {/* Page thumbnails strip */}
                    <div className="flex items-center gap-2 px-3 py-2 border-t bg-white/80 backdrop-blur-sm overflow-x-auto shrink-0">
                        {pages.map((page, i) => (
                            <div
                                key={page.id || `page-${i}`}
                                className="group relative shrink-0"
                            >
                                <button
                                    className={`relative rounded-md overflow-hidden border-2 transition-all duration-150 ${
                                        i === currentPage
                                            ? 'border-blue-500 shadow-sm'
                                            : 'border-transparent hover:border-muted-foreground/30'
                                    }`}
                                    style={{
                                        width: 80,
                                        aspectRatio: `${page.width} / ${page.height}`
                                    }}
                                    onClick={() =>
                                        i !== currentPage && switchPage(i)
                                    }
                                >
                                    {thumbnails[i] ? (
                                        <img
                                            src={thumbnails[i]}
                                            alt={`Page ${i + 1}`}
                                            className="w-full h-full object-fill"
                                            draggable={false}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white flex items-center justify-center text-muted-foreground text-[9px]">
                                            {i + 1}
                                        </div>
                                    )}
                                </button>
                                {/* Page number */}
                                <span className="block text-center text-[10px] text-muted-foreground mt-0.5 select-none">
                                    {i + 1}
                                </span>
                                {/* Delete button */}
                                {pages.length > 1 && (
                                    <button
                                        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-sm border p-0.5"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePageAt(i);
                                        }}
                                    >
                                        <Trash2 className="size-2.5 text-destructive" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {/* Add page */}
                        <button
                            className="shrink-0 flex items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors"
                            style={{
                                width: 80,
                                aspectRatio: `${pages[0]?.width ?? 1200} / ${pages[0]?.height ?? 900}`
                            }}
                            onClick={addNewPage}
                        >
                            <Plus className="size-4 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Animation timeline panel */}
                    <AnimationPanel
                        animationState={animationState}
                        selectedIds={selectedIds}
                        objects={objects}
                        onPlay={play}
                        onPause={pause}
                        onStop={stopAnimation}
                        onSeek={seekTo}
                        onAddKeyframe={addKeyframe}
                        onRemoveKeyframe={removeKeyframe}
                        onUpdateKeyframeEasing={updateKeyframeEasing}
                        onSetDuration={setTotalDuration}
                        onExportVideo={exportVideo}
                    />

                    {/* Floating bottom-right controls */}
                    <div className="absolute bottom-14 right-3 z-50 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border px-1 py-0.5">
                        <Hint label="Save" side="top" sideOffset={10}>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={handleSave}
                            >
                                <Save className="size-3.5" />
                            </Button>
                        </Hint>
                        <div className="w-px h-4 bg-border mx-0.5" />
                        <Hint label="Zoom out" side="top" sideOffset={10}>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => editor?.zoomOut()}
                            >
                                <ZoomOut className="size-3.5" />
                            </Button>
                        </Hint>
                        <span className="text-xs text-muted-foreground font-medium min-w-[3ch] text-center select-none tabular-nums">
                            {Math.round(zoom * 100)}%
                        </span>
                        <Hint label="Zoom in" side="top" sideOffset={10}>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => editor?.zoomIn()}
                            >
                                <ZoomIn className="size-3.5" />
                            </Button>
                        </Hint>
                        <Hint label="Reset zoom" side="top" sideOffset={10}>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => editor?.autoZoom()}
                            >
                                <Minimize className="size-3.5" />
                            </Button>
                        </Hint>
                    </div>
                </main>
            </div>
        </div>
    );
};
