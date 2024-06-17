import { notFound } from 'next/navigation';

import { getCurrentUser } from '@/lib/session';
import { dashboardConfig } from '@/config/dashboard';
import { DashboardNav } from '@/components/nav';

interface DashboardLayoutProps {
    children?: React.ReactNode;
}

export default async function DashboardLayout({
    children
}: DashboardLayoutProps) {
    const user = await getCurrentUser();

    if (!user) {
        return notFound();
    }

    return (
        <div className="flex min-h-screen flex-col space-y-6">
            <div className="flex flex-row w-full h-full">
                <DashboardNav items={dashboardConfig.sidebarNav} user={user}/>
                <main className="flex w-full flex-1 flex-col overflow-hidden ml-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
