import '@/styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { siteConfig } from '@/config/site';

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
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png'
    },
    manifest: `${siteConfig.url}/site.webmanifest`
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${GeistSans.variable}`}>
            <head />
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <main>{children}</main>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
