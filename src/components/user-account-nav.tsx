'use client';

import Link from 'next/link';
import { type User } from 'next-auth';
import { signOut } from 'next-auth/react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/user-avatar';
import { Icons } from './icons';

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
    user: Pick<User, 'name' | 'image' | 'email'>;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="flex items-center gap-2 p-2">
                <UserAvatar
                    user={{
                        name: user.name ?? null,
                        image: user.image ?? null
                    }}
                    className="h-8 w-8"
                />
                <p className='font-medium'>{user.name ?? "Your Account"}</p>
                <Icons.chevronsLeftRight className="w-4 h-4 rotate-90" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent >
                <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                        {user.email && (
                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                                {user.email}
                            </p>
                        )}
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={async (event) => {
                        event.preventDefault();
                        await signOut({
                            callbackUrl: `${window.location.origin}/login`
                        });
                    }}
                >
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
