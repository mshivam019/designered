'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { type SidebarNavItem } from '@/types';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { UserAccountNav } from './user-account-nav';
import { type User } from 'next-auth';
import { useMediaQuery } from 'usehooks-ts';
import { ModeToggle } from './mode-toggle';

interface DashboardNavProps {
    items: SidebarNavItem[];
    user: User;
}

export function DashboardNav({ items, user }: DashboardNavProps) {
    const path = usePathname();
    const isMobile = useMediaQuery('(max-width:768px)');
    const [isResetting, setIsResetting] = useState(false);
    const isResizingRef = useRef(false);
    const sidebarRef = useRef<React.ComponentRef<'aside'>>(null);
    const navbarRef = useRef<React.ComponentRef<'div'>>(null);
    const [isCollapsed, setIsCollapsed] = useState(isMobile);

    const handleMouseDown = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.preventDefault();
        event.stopPropagation();

        isResizingRef.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isResizingRef.current) return;
        let newWidth = event.clientX;

        if (newWidth < 240) newWidth = 240;
        if (newWidth > 480) newWidth = 480;

        if (sidebarRef.current && navbarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
            navbarRef.current.style.setProperty('left', `${newWidth}px`);
            navbarRef.current.style.setProperty(
                'width',
                `calc(100% - ${newWidth}px)`
            );
        }
    };

    const handleMouseUp = () => {
        isResizingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const resetWidth = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(false);
            setIsResetting(true);

            sidebarRef.current.style.width = isMobile ? '100%' : '240px';
            navbarRef.current.style.setProperty(
                'width',
                isMobile ? '0' : 'calc(100% - 240px)'
            );
            navbarRef.current.style.setProperty(
                'left',
                isMobile ? '100%' : '240px'
            );
            setTimeout(() => {
                setIsResetting(false);
            }, 300);
        }
    };

    const collapse = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(true);
            setIsResetting(true);

            sidebarRef.current.style.width = '0';
            navbarRef.current.style.setProperty('width', '100%');
            navbarRef.current.style.setProperty('left', '0');
            setTimeout(() => setIsResetting(false), 300);
        }
    };

    useEffect(() => {
        if (isMobile) {
            collapse();
        } else {
            resetWidth();
        }
    }, [isMobile]);

    return (
        <>
            <aside
                className={cn(
                    `group/sidebar min-h-screen bg-secondary overflow-y-auto overflow-x-hidden relative flex flex-col w-60`,
                    isResetting && 'transition-all ease-in-out duration-300',
                    isMobile && 'w-0'
                )}
                ref={sidebarRef}
            >
                <nav className="grid items-start gap-2">
                    <button
                        className={cn(
                            `w-6 h-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute
        top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition`,
                            isMobile && 'opacity-100'
                        )}
                        onClick={collapse}
                        role="button"
                    >
                        <Icons.chevronLeft className="w-6 h-6" />
                    </button>
                    <UserAccountNav
                        user={{
                            name: user.name,
                            image: user.image,
                            email: user.email
                        }}
                    />
                    {items.map((item, index) => {
                        const Icon = Icons[item.icon ?? 'arrowRight'];
                        return (
                            item.href && (
                                <Link
                                    key={index}
                                    href={item.disabled ? '/' : item.href}
                                >
                                    <span
                                        className={cn(
                                            'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                                            path === item.href
                                                ? 'bg-neutral-800 text-primary-foreground dark:bg-primary dark:text-primary-foreground'
                                                : 'hover:bg-neutral-300 dark:hover:bg-neutral-600',
                                            item.disabled &&
                                                'cursor-not-allowed opacity-80'
                                        )}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        <span>{item.title}</span>
                                    </span>
                                </Link>
                            )
                        );
                    })}
                    <div
                        className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10
        right-0 top-0"
                        onMouseDown={handleMouseDown}
                        onClick={resetWidth}
                        aria-hidden
                    ></div>
                </nav>
                <div className="absolute bottom-2 pl-2">
                    <ModeToggle />
                </div>
            </aside>
            <div
                className={cn(
                    `absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]`,
                    isResetting && 'transition-all ease-in-out duration-300',
                    isMobile && 'left-0 w-full'
                )}
                ref={navbarRef}
            >
                <nav className="bg-transparent px-3 py-2 w-full">
                    {isCollapsed && (
                        <Icons.menu
                            className="w-6 h-6 text-muted-foreground"
                            onClick={resetWidth}
                            role="button"
                        />
                    )}
                </nav>
            </div>
        </>
    );
}
