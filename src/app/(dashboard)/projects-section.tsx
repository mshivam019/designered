'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    CopyIcon,
    Loader,
    MoreHorizontal,
    Search,
    Trash
} from 'lucide-react';

import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useDeleteProject } from '@/features/projects/api/use-delete-project';
import { useDuplicateProject } from '@/features/projects/api/use-duplicate-project';

import {
    DropdownMenuContent,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/hooks/use-confirm';

const gradients = [
    "bg-gradient-to-br from-pink-500 to-rose-500",
    "bg-gradient-to-br from-emerald-500 to-teal-500",
    "bg-gradient-to-br from-orange-500 to-amber-500",
    "bg-gradient-to-br from-purple-500 to-indigo-500",
    "bg-gradient-to-br from-blue-500 to-cyan-500",
];

const getProjectGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
};

export const ProjectsSection = () => {
    const [ConfirmDialog, confirm] = useConfirm(
        'Are you sure?',
        'You are about to delete this project.'
    );
    const duplicateMutation = useDuplicateProject();
    const removeMutation = useDeleteProject();
    const router = useRouter();

    const onCopy = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        duplicateMutation.mutate({ id });
    };

    const onDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const ok = await confirm();

        if (ok) {
            removeMutation.mutate({ id });
        }
    };

    const { data, status, fetchNextPage, isFetchingNextPage, hasNextPage } =
        useGetProjects();

    if (status === 'pending') {
        return (
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Recent projects</h3>
                <div className="flex flex-col gap-y-4 items-center justify-center h-32">
                    <Loader className="size-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Recent projects</h3>
                <div className="flex flex-col gap-y-4 items-center justify-center h-32">
                    <AlertTriangle className="size-6 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                        Failed to load projects
                    </p>
                </div>
            </div>
        );
    }

    if (!data.pages.length || !data.pages[0]?.data?.length) {
        return (
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Recent projects</h3>
                <div className="flex flex-col gap-y-4 items-center justify-center h-32">
                    <Search className="size-6 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                        No projects found
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ConfirmDialog />
            <h3 className="font-semibold text-lg">Recent projects</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                    {data.pages.map((group, i) => (
                        <React.Fragment key={i}>
                            {group.data.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="group relative flex flex-col gap-y-2 w-full rounded-xl overflow-hidden border bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                    onClick={() => router.push(`/editor/${project.id}`)}
                                >
                                    <div className={`aspect-[16/10] w-full flex items-center justify-center overflow-hidden relative ${getProjectGradient(project.name)}`}>
                                        <span className="text-4xl font-bold text-white/90">
                                            {project.name.charAt(0).toUpperCase()}
                                        </span>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                    </div>
                                    <div className="p-4 flex flex-col gap-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold truncate max-w-[calc(100%-2rem)]">
                                                {project.name}
                                            </h4>
                                            <DropdownMenu modal={false}>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        disabled={false}
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8 hover:bg-muted"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-60"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <DropdownMenuItem
                                                        className="h-10 cursor-pointer"
                                                        disabled={duplicateMutation.isPending}
                                                        onClick={(e) => onCopy(e, project.id)}
                                                    >
                                                        <CopyIcon className="size-4 mr-2" />
                                                        Make a copy
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="h-10 cursor-pointer text-destructive focus:text-destructive"
                                                        disabled={removeMutation.isPending}
                                                        onClick={(e) => onDelete(e, project.id)}
                                                    >
                                                        <Trash className="size-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Edited {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </React.Fragment>
                    ))}
                </AnimatePresence>
            </div>
            {hasNextPage && (
                <div className="w-full flex items-center justify-center pt-4">
                    <Button
                        variant="ghost"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        Load more
                    </Button>
                </div>
            )}
        </div>
    );
};
