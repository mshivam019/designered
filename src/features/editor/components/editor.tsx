'use client';

import { fabric } from 'fabric';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useRef, useState } from 'react';

import { type ResponseType } from '@/features/projects/api/use-get-project';
import { useUpdateProject } from '@/features/projects/api/use-update-project';
import { useAddPage } from '@/features/projects/api/use-add-page';
import { useSaveAllPages } from '@/features/projects/api/use-save-all-pages';
import { useDeletePage } from '@/features/projects/api/use-delete-page';
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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import { defaultJson } from '../defaultJson';
import { AiSidebar } from './ai-sidebar';

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
                height: 800,
                width: 900
            }
        ]
    );
    const [currentPage, setCurrentPage] = useState(0);
    const { mutate } = useUpdateProject(projectId, pages[currentPage].id);
    const { mutate: addPage } = useAddPage(projectId);
    const { mutate: saveAllPages } = useSaveAllPages(projectId);
    const { mutate: deletePage } = useDeletePage(
        projectId,
        pages[currentPage].id
    );
    const [canvasInstances, setCanvasInstances] = useState<fabric.Canvas[]>([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSave = useCallback(
        debounce(() => {
            //save the current canvas data
            if (canvasInstances[currentPage]) {
                const jsonData = canvasInstances[currentPage].toJSON();
                //update current page data
                const updatedPages = [...pages];
                updatedPages[currentPage] = {
                    ...updatedPages[currentPage],
                    json: JSON.stringify(jsonData)
                };
                setPages((prevPages) => {
                    const updatedPages = [...prevPages];
                    updatedPages[currentPage] = {
                        ...updatedPages[currentPage],
                        json: JSON.stringify(jsonData)
                    };
                    return updatedPages;
                });
            }
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
        }, 60000 * 3),
        [mutate]
    );

    const [activeTool, setActiveTool] = useState<ActiveTool>('select');
    const onClearSelection = useCallback(() => {
        if (selectionDependentTools.includes(activeTool)) {
            setActiveTool('select');
        }
    }, [activeTool]);

    const { init, editor } = useEditor({
        defaultState: pages[currentPage]?.json ?? defaultJson,
        defaultWidth: pages[currentPage]?.width ?? 900,
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
            preserveObjectStacking: true,
            width: 900,
            height: 800
        });

        init({
            initialCanvas: canvas,
            initialContainer: containerRef.current,
            newWidth: pages[currentPage]?.width ?? 900,
            newHeight: pages[currentPage]?.height ?? 800
        });

        canvas.loadFromJSON(pages[currentPage]?.json ?? '', () => {
            // Prevent interaction with specific objects
            canvas.forEachObject((obj) => {
                if (obj.type === 'rect') {
                    obj.set({
                        selectable: false, // Disable selection
                        hasControls: false, // Disable resize controls
                        hasBorders: false, // Disable borders
                        lockMovementX: true, // Prevent horizontal movement
                        lockMovementY: true, // Prevent vertical movement
                        lockScalingX: true, // Prevent scaling horizontally
                        lockScalingY: true, // Prevent scaling vertically
                        lockRotation: true, // Prevent rotation
                        originX: 'left',
                        originY: 'top',
                        left: -0.5,
                        top: -0.5
                    });
                }
            });
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
            json: JSON.stringify(editor?.canvas.toJSON()) ?? defaultJson,
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
                json: defaultJson,
                height: 800,
                width: 900
            },
            {
                onSuccess: ({ data }) => {
                    setPages((prevPages) => [
                        ...prevPages,
                        {
                            id: data.id,
                            json: defaultJson,
                            height: 800,
                            width: 900,
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
                json: JSON.stringify(jsonData) ?? defaultJson,
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

    const handleDeletePage = () => {
        const pageToDelete = pages[currentPage].id;
        if (pages.length > 1) {
            // first switch to a different page
            if (currentPage === 0) {
                switchPage(1);
            } else {
                switchPage(0);
            }
            //update the page numbers
            const updatedPages = pages.filter(
                (page) => page.id !== pageToDelete
            );
            updatedPages.forEach((page, index) => {
                saveAllPages([
                    {
                        id: page.id,
                        json: page.json,
                        height: page.height,
                        width: page.width,
                        projectId,
                        pageNumber: index + 1
                    }
                ]);
            });
            setPages(updatedPages);
            setCurrentPage(0);
            editor?.canvas.loadFromJSON(
                updatedPages[0].json ?? defaultJson,
                () => {
                    editor?.canvas.renderAll();
                }
            );
            // delete the current page
            deletePage({
                param: {
                    id: projectId,
                    pageId: pageToDelete
                }
            });
        }
    };

    const handleSave = () => {
        {
            //save the current canvas data
            if (canvasInstances[currentPage]) {
                const jsonData = canvasInstances[currentPage].toJSON();
                //update current page data
                const updatedPages = [...pages];
                updatedPages[currentPage] = {
                    ...updatedPages[currentPage],
                    json: JSON.stringify(jsonData)
                };
            }
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
        }
    };

    const resetPage = () => {
        if (editor) {
            editor.canvas.loadFromJSON(
                pages[currentPage].json ?? defaultJson,
                () => {
                    editor.canvas.renderAll();
                }
            );
        }
    };

    const clearPage = () => {
        if (editor) {
            editor.canvas.loadFromJSON(defaultJson, () => {
                editor.canvas.renderAll();
            });
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Navbar
                id={projectId}
                editor={editor}
                activeTool={activeTool}
                onChangeActiveTool={onChangeActiveTool}
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
                <AiSidebar
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
                        addNewPage={addNewPage}
                        handleDeletePage={handleDeletePage}
                        handleSave={handleSave}
                        resetPage={resetPage}
                        clearPage={clearPage}
                    />

                    <Pagination>
                        {currentPage > 0 && (
                            <PaginationPrevious
                                onClick={() => switchPage(currentPage - 1)}
                            />
                        )}
                        <PaginationContent>
                            {pages.map((page, index) => (
                                <PaginationItem
                                    key={page.id}
                                    onClick={() => switchPage(index)}
                                >
                                    <PaginationLink
                                        isActive={currentPage === index}
                                        className="cursor-pointer"
                                    >
                                        {index + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                        {currentPage < pages.length - 1 && (
                            <PaginationNext
                                onClick={() => switchPage(currentPage + 1)}
                            />
                        )}
                    </Pagination>

                    <div
                        className="flex-1 h-[calc(100%-68px)] w-full relative border-l border-r border-b border-gray-200"
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
