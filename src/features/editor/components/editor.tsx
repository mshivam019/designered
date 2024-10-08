'use client';

import { fabric } from 'fabric';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useRef, useState } from 'react';

import { type ResponseType } from '@/features/projects/api/use-get-project';
import { useUpdateProject } from '@/features/projects/api/use-update-project';
import { useAddPage } from '@/features/projects/api/use-add-page';
import { useSaveAllPages } from '@/features/projects/api/use-save-all-pages';

import {
    type ActiveTool,
    selectionDependentTools
} from '@/features/editor/types';
import { Navbar } from '@/features/editor/components/navbar';
import { Footer } from '@/features/editor/components/footer';
import { useEditor } from '@/features/editor/hooks/use-editor';
import { Sidebar } from '@/features/editor/components/sidebar';
import { Toolbar } from '@/features/editor/components/toolbar';
import { ShapeSidebar } from '@/features/editor/components/shape-sidebar';
import { FillColorSidebar } from '@/features/editor/components/fill-color-sidebar';
import { StrokeColorSidebar } from '@/features/editor/components/stroke-color-sidebar';
import { StrokeWidthSidebar } from '@/features/editor/components/stroke-width-sidebar';
import { OpacitySidebar } from '@/features/editor/components/opacity-sidebar';
import { TextSidebar } from '@/features/editor/components/text-sidebar';
import { FontSidebar } from '@/features/editor/components/font-sidebar';
import { ImageSidebar } from '@/features/editor/components/image-sidebar';
import { FilterSidebar } from '@/features/editor/components/filter-sidebar';
import { DrawSidebar } from '@/features/editor/components/draw-sidebar';
import { SettingsSidebar } from '@/features/editor/components/settings-sidebar';
import { Button } from '@/components/ui/button';

interface EditorProps {
    pageData: ResponseType['data'];
}

export const Editor = ({ pageData }: EditorProps) => {
    const projectId = pageData[0]?.projectId ?? '';
    const [pages, setPages] = useState(
        pageData ?? [
            {
                id: '',
                json: '',
                height: 800,
                width: 1200
            }
        ]
    );
    const [currentPage, setCurrentPage] = useState(0);
    const { mutate } = useUpdateProject(projectId, pages[currentPage].id);
    const { mutate: addPage } = useAddPage(projectId);
    const { mutate: saveAllPages } = useSaveAllPages(projectId);
    const [canvasInstances, setCanvasInstances] = useState<fabric.Canvas[]>([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSave = useCallback(
        debounce(() => {
            saveAllPages(
                pages.map((page) => ({
                    id: page.id,
                    json: page.json,
                    height: page.height,
                    width: page.width,
                    projectId,
                    pageNumber: page.pageNumber
                }))
            );
        }, 5000),
        [mutate]
    );

    const [activeTool, setActiveTool] = useState<ActiveTool>('select');
    const onClearSelection = useCallback(() => {
        if (selectionDependentTools.includes(activeTool)) {
            setActiveTool('select');
        }
    }, [activeTool]);

    const { init, editor } = useEditor({
        defaultState: pages[currentPage]?.json ?? '',
        defaultWidth: pages[currentPage]?.width ?? 1200,
        defaultHeight: pages[currentPage]?.height ?? 800,
        clearSelectionCallback: onClearSelection,
        saveCallback: debouncedSave
    });

    // Initialize canvas
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize fabric canvas for the current page
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            controlsAboveOverlay: true,
            preserveObjectStacking: true
        });

        init({
            initialCanvas: canvas,
            initialContainer: containerRef.current,
            newWidth: pages[currentPage]?.width ?? 1200,
            newHeight: pages[currentPage]?.height ?? 800
        });

        canvas.loadFromJSON(pages[currentPage]?.json ?? '', () => {
            canvas.renderAll();
        });

        // Store canvas instance
        setCanvasInstances((prevInstances) => {
            const updatedInstances = [...prevInstances];
            updatedInstances[currentPage] = canvas;
            return updatedInstances;
        });

        return () => {
            canvas.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [init, currentPage]);

    // Add a new page
    const addNewPage = () => {
        mutate({
            json: JSON.stringify(editor?.canvas.toJSON()) ?? '',
            height: pages[currentPage].height,
            width: pages[currentPage].width,
            projectId
        });
        setPages((prevPages) => {
            const updatedPages = [...prevPages];
            updatedPages[currentPage] = {
                ...updatedPages[currentPage],
                json: JSON.stringify(editor?.canvas.toJSON())
            };
            return updatedPages;
        });
        addPage(
            {
                projectId,
                pageNumber: pages.length + 1,
                json: '',
                height: 800,
                width: 1200
            },
            {
                onSuccess: ({ data }) => {
                    setPages((prevPages) => [
                        ...prevPages,
                        {
                            id: data.id,
                            json: '',
                            height: 800,
                            width: 1200,
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt,
                            projectId: data.projectId,
                            pageNumber: data.pageNumber
                        }
                    ]);

                    setCurrentPage(pages.length);
                }
            }
        );
    };

    // Switch between pages
    const switchPage = (pageIndex: number) => {
        // Save the current canvas data
        if (editor && canvasInstances[currentPage]) {
            const jsonData = canvasInstances[currentPage].toJSON();
            mutate({
                json: JSON.stringify(jsonData) ?? '',
                height: pages[currentPage].height,
                width: pages[currentPage].width,
                projectId
            });
            setPages((prevPages) => {
                const updatedPages = [...prevPages];
                updatedPages[currentPage] = {
                    ...updatedPages[currentPage],
                    json: JSON.stringify(jsonData)
                };
                return updatedPages;
            });
        }

        // Switch to the new page
        setCurrentPage(pageIndex);
    };

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

    return (
        <div className="h-full flex flex-col">
            <Navbar
                id={projectId}
                editor={editor}
                activeTool={activeTool}
                onChangeActiveTool={(tool) => setActiveTool(tool)}
            />
            <div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
                <Sidebar
                    activeTool={activeTool}
                    onChangeActiveTool={setActiveTool}
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
                <main className="bg-muted flex-1 overflow-auto relative flex flex-col">
                    <Toolbar
                        editor={editor}
                        activeTool={activeTool}
                        onChangeActiveTool={setActiveTool}
                        key={JSON.stringify(editor?.canvas.getActiveObject())}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button onClick={addNewPage}>Add New Page</Button>
                        {pages.map((page, index) => (
                            <Button
                                key={page.id}
                                onClick={() => switchPage(index)}
                                variant={
                                    currentPage === index
                                        ? 'outline'
                                        : 'secondary'
                                }
                            >
                                Page {index + 1}
                            </Button>
                        ))}
                        <Button
                            onClick={() =>
                                mutate({
                                    json:
                                        JSON.stringify(
                                            editor?.canvas.toJSON()
                                        ) ?? '',
                                    height: pages[currentPage].height,
                                    width: pages[currentPage].width,
                                    projectId
                                })
                            }
                        >
                            Save
                        </Button>
                    </div>

                    <div
                        className="flex-1 h-[calc(100%-124px)] bg-muted"
                        ref={containerRef}
                    >
                        <canvas ref={canvasRef} />
                    </div>
                    <Footer editor={editor} />
                </main>
            </div>
        </div>
    );
};
