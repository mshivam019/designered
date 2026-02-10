'use client';

import { useCallback, useRef, useState } from 'react';
import { Plus, Trash2, Save, Minimize, ZoomIn, ZoomOut } from 'lucide-react';

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
        historySave
    } = useEditor({
        defaultState: pages[0]?.json ?? defaultJson,
        defaultWidth: pages[0]?.width ?? 1200,
        defaultHeight: pages[0]?.height ?? 900,
        clearSelectionCallback: onClearSelection,
        saveCallback: noopSave
    });

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
            updated[cp] = { ...updated[cp], json };
            return updated;
        });
        // Also update the ref synchronously so subsequent reads are fresh
        const updatedPages = [...pagesRef.current];
        updatedPages[cp] = { ...updatedPages[cp], json };
        pagesRef.current = updatedPages;

        // Capture thumbnail for the page we're leaving
        const thumb = captureThumbnail();
        if (thumb) {
            setThumbnails((prev) => ({ ...prev, [cp]: thumb }));
        }

        return updatedPages;
    }, [objects, background, captureThumbnail]);

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
                    saveAllPages(
                        latestPages.map((page, idx) => ({
                            id: page.id,
                            json: page.json,
                            height: page.height,
                            width: page.width,
                            projectId,
                            pageNumber: idx + 1
                        }))
                    );
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

            saveAllPages(
                updatedPages.map((page, index) => ({
                    id: page.id,
                    json: page.json,
                    height: page.height,
                    width: page.width,
                    projectId,
                    pageNumber: index + 1
                }))
            );

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

        saveAllPages(
            updatedPages.map((page, idx) => ({
                id: page.id,
                json: page.json,
                height: page.height,
                width: page.width,
                projectId,
                pageNumber: idx + 1
            }))
        );
    }, [editor, snapshotCurrentPage, saveAllPages, projectId]);

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
                <main className="bg-muted flex-1 overflow-hidden relative flex flex-col">
                    {/* Floating toolbar */}
                    <Toolbar
                        editor={editor}
                        activeTool={activeTool}
                        onChangeActiveTool={setActiveTool}
                        key={`${editor?.selectedObjects[0]?.type ?? 'none'}-${editor?.selectedObjects.length ?? 0}`}
                    />

                    {/* Canvas area */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex flex-col items-center gap-4 py-4">
                            {/* Page slots */}
                            {pages.map((page, i) => {
                                return (
                                    <div
                                        key={page.id || `page-${i}`}
                                        className="group w-full"
                                    >
                                        <div
                                            className={`relative bg-white rounded-sm overflow-hidden transition-shadow duration-200 mx-auto ${
                                                i === currentPage
                                                    ? 'shadow-[0_2px_12px_rgba(0,0,0,0.12)]'
                                                    : 'shadow-[0_1px_6px_rgba(0,0,0,0.08)] cursor-pointer hover:shadow-[0_2px_10px_rgba(0,0,0,0.12)]'
                                            }`}
                                            style={{
                                                width: `min(1100px, calc(100% - 40px))`,
                                                aspectRatio: `${page.width} / ${page.height}`
                                            }}
                                            onClick={() =>
                                                i !== currentPage &&
                                                switchPage(i)
                                            }
                                        >
                                            {i === currentPage ? (
                                                <PageCanvas
                                                    objects={objects}
                                                    setObjects={setObjects}
                                                    selectedIds={selectedIds}
                                                    setSelectedIds={
                                                        setSelectedIds
                                                    }
                                                    background={background}
                                                    pageWidth={pageWidth}
                                                    pageHeight={pageHeight}
                                                    stageRef={stageRef}
                                                    containerRef={containerRef}
                                                    stageSize={stageSize}
                                                    zoom={zoom}
                                                    isDrawingMode={
                                                        isDrawingMode
                                                    }
                                                    drawingPoints={
                                                        drawingPoints
                                                    }
                                                    setDrawingPoints={
                                                        setDrawingPoints
                                                    }
                                                    setIsDrawingMode={
                                                        setIsDrawingMode
                                                    }
                                                    save={historySave}
                                                    strokeColor={
                                                        editor?.getActiveStrokeColor() ??
                                                        'rgba(0,0,0,1)'
                                                    }
                                                    strokeWidth={
                                                        editor?.getActiveStrokeWidth() ??
                                                        2
                                                    }
                                                    autoZoom={autoZoom}
                                                />
                                            ) : thumbnails[i] ? (
                                                <img
                                                    src={thumbnails[i]}
                                                    alt={`Page ${i + 1}`}
                                                    className="w-full h-full object-fill"
                                                    draggable={false}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-white flex items-center justify-center text-muted-foreground text-sm">
                                                    Page {i + 1}
                                                </div>
                                            )}
                                        </div>

                                        {/* Page label + delete */}
                                        <div className="flex items-center justify-center gap-2 mt-2.5">
                                            <span className="text-xs text-muted-foreground font-medium select-none">
                                                {i + 1}
                                            </span>
                                            {pages.length > 1 && (
                                                <button
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePageAt(i);
                                                    }}
                                                >
                                                    <Trash2 className="size-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add page button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-muted-foreground hover:text-foreground mb-4"
                                onClick={addNewPage}
                            >
                                <Plus className="size-4" />
                                Add page
                            </Button>
                        </div>
                    </div>

                    {/* Floating bottom-right controls */}
                    <div className="absolute bottom-3 right-3 z-50 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border px-1 py-0.5">
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
