import { type DashboardConfig } from '@/types';

export const dashboardConfig: DashboardConfig = {
   sidebarNav: [
        {
            title: 'Notes',
            href: '/dashboard',
            icon: 'post',
        },
        {
            title: 'Billing',
            href: '/dashboard/billing',
            icon: 'billing'
        },
        {
            title: 'Settings',
            href: '/dashboard/settings',
            icon: 'settings'
        }
    ]
};
