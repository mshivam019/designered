import '@/styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/components/providers';

import { SessionProvider } from 'next-auth/react';

const siteConfig = {
    name: 'Designered',
    description: 'A design editor for everyone',
    url: 'https://designered.vercel.app'
};

export const metadata = {
    title: {
        default: siteConfig.name,
        template: `${siteConfig.name}`
    },
    description: siteConfig.description,
    keywords: [
        'Next.js',
        'React',
        'Tailwind CSS',
        'Server Components',
        'Radix UI'
    ],
    authors: [
        {
            name: 'Shivam Mishra',
            url: 'https://mshivam019.vercel.app'
        }
    ],
    creator: 'Shivam Mishra',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description: siteConfig.description,
        images: [`${siteConfig.url}/og.jpg`],
        creator: '@mshivam0019'
    },
    icons: {
        icon: '/icon.png',
        shortcut: '/icon.png',
        apple: '/icon.png'
    },
    manifest: `${siteConfig.url}/site.webmanifest`
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <html lang="en" className={`${GeistSans.variable}`}>
                <body>
                    <Providers>
                        <Toaster />
                        {children}
                    </Providers>
                </body>
            </html>
        </SessionProvider>
    );
}
