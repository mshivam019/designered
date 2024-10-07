import { type NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/register',
        signOut: '/logout'
    },
    providers: [
        // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
        // while this file is also used in non-Node.js environments
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard =
                nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/editor');
            const isPublicPage = ['/terms', '/privacy', '/'].includes(
                nextUrl.pathname
            );

            // Allow access to public pages like terms and privacy even if logged in
            if (isPublicPage) return true;

            // Handle dashboard authorization
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            // Redirect logged-in users to the dashboard if they're trying to access other pages
            if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            // Allow unauthenticated users to access non-dashboard pages
            return true;
        },
        session({ session, token }: { session: any; token: any }) {
            if (token.id) {
                session.user.id = token.id;
            }

            return session;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }

            return token;
        }
    }
} satisfies NextAuthConfig;
