import { Button } from '@/components/ui/button';
import { MessageSquare, Zap, Key, Users } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="px-4 lg:px-6 h-14 flex items-center">
                <Link href="/" className="flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <span className="ml-2 text-2xl font-bold">MultiChat</span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link
                        href="#features"
                        className="text-sm font-medium hover:underline underline-offset-4"
                    >
                        Features
                    </Link>
                    <Link
                        href="#supported-llms"
                        className="text-sm font-medium hover:underline underline-offset-4"
                    >
                        Supported LLMs
                    </Link>
                    <Link
                        href="#get-started"
                        className="text-sm font-medium hover:underline underline-offset-4"
                    >
                        Get Started
                    </Link>
                </nav>
            </header>
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                    Your Ultimate Multi-LLM Chat Experience
                                </h1>
                                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                                    Chat with multiple AI models simultaneously.
                                    Bring your own API keys and unlock the power
                                    of diverse language models in one seamless
                                    interface.
                                </p>
                            </div>
                            <div className="space-x-4">
                                <Button asChild>
                                    <Link href="/register">Get Started</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="#features">Learn More</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
                <section
                    id="features"
                    className="w-full py-12 md:py-24 lg:py-32 bg-gray-100"
                >
                    <div className="container px-4 md:px-6">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-black">
                            Key Features
                        </h2>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 text-black">
                            <div className="flex flex-col items-center text-center">
                                <Zap className="h-12 w-12 text-primary mb-4" />
                                <h3 className="text-xl font-bold mb-2">
                                    Multi-LLM Support
                                </h3>
                                <p className="text-gray-500">
                                    Chat with multiple AI models simultaneously
                                    in a single conversation.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <Key className="h-12 w-12 text-primary mb-4" />
                                <h3 className="text-xl font-bold mb-2">
                                    Bring Your Own Keys
                                </h3>
                                <p className="text-gray-500">
                                    Use your own API keys for maximum
                                    flexibility and control.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <Users className="h-12 w-12 text-primary mb-4" />
                                <h3 className="text-xl font-bold mb-2">
                                    Unified Interface
                                </h3>
                                <p className="text-gray-500">
                                    Enjoy a seamless chat experience across
                                    different AI models.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                <section
                    id="supported-llms"
                    className="w-full py-12 md:py-24 lg:py-32"
                >
                    <div className="container px-4 md:px-6">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
                            Supported LLMs
                        </h2>
                        <div className="flex flex-wrap justify-center gap-8 text-black">
                            {[
                                'GPT-3.5',
                                'GPT-4',
                                'Claude',
                                'DALL-E',
                                'Stable Diffusion'
                            ].map((llm) => (
                                <div
                                    key={llm}
                                    className="bg-white shadow-lg rounded-lg p-6 text-center"
                                >
                                    <h3 className="text-xl font-bold mb-2">
                                        {llm}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section
                    id="get-started"
                    className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground"
                >
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    Ready to Transform Your Chat Experience?
                                </h2>
                                <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl">
                                    Sign up now to start chatting with multiple
                                    AI models in one place.
                                </p>
                            </div>
                            <Button size="lg" asChild variant="ghost">
                                <Link href="/register">Sign Up for Free</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
                <p className="text-xs text-gray-500">
                    © {new Date().getFullYear()} MultiChat. All rights reserved.
                </p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link
                        href="/terms"
                        className="text-xs hover:underline underline-offset-4"
                    >
                        Terms of Service
                    </Link>
                    <Link
                        href="/privacy"
                        className="text-xs hover:underline underline-offset-4"
                    >
                        Privacy
                    </Link>
                </nav>
            </footer>
        </div>
    );
}
