'use client';
import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactLenis } from 'lenis/react';
import Image from 'next/image';
import Link from 'next/link';
import Carousel from '@/components/carousel';

const BlobShape = ({ className }: { className: string }) => (
    <motion.svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        animate={{
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            scale: Math.random() * 0.5 + 0.5,
            rotate: Math.random() * 360,
            borderRadius: Math.random() * 0.5 + 0.5
        }}
        transition={{
            duration: 10,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror'
        }}
    >
        <path
            fill="currentColor"
            d="M41.1,-69.8C53.1,-62.8,62.5,-51.1,69.8,-37.8C77.1,-24.5,82.3,-9.6,81.2,4.6C80.1,18.8,72.7,32.3,62.9,42.7C53.1,53.1,40.9,60.3,27.8,65.6C14.7,70.9,0.7,74.3,-13.1,72.9C-26.9,71.5,-40.5,65.3,-51.9,55.9C-63.3,46.5,-72.5,33.9,-76.9,19.7C-81.3,5.4,-81,-10.5,-75.7,-23.7C-70.4,-36.9,-60.1,-47.4,-48,-56.8C-35.9,-66.2,-22,-74.5,-6.9,-75.3C8.2,-76.1,29.1,-76.8,41.1,-69.8Z"
            transform="translate(100 100)"
        />
    </motion.svg>
);

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null!);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const router = useRouter();

    return (
        <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}>
            <main data-scroll-container className="bg-sky-50">
                <motion.div
                    className="fixed top-0 left-0 right-0 h-1 bg-blue-500 z-50"
                    style={{ scaleX }}
                />

                <section className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-y-visible overflow-x-clip">
                    <BlobShape className="absolute top-0 right-0 text-blue-200 w-96 h-96 -mr-24 -mt-24" />
                    <BlobShape className="absolute bottom-0 left-0 text-sky-200 w-96 h-96 -ml-24 -mb-24" />

                    <motion.div
                        className="z-10 text-center"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeIn' }}
                    >
                        <h1 className="text-6xl font-bold mb-6 text-slate-900">
                            Unleash Your{' '}
                            <span className="text-blue-500">Creativity</span>
                        </h1>
                        <p className="text-xl text-slate-700 mb-8 max-w-2xl">
                            Design stunning graphics, presentations, and social
                            media posts with our intuitive drag-and-drop editor.
                            No design experience needed!
                        </p>
                        <Button
                            size="lg"
                            className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-6"
                            onClick={() => {
                                router.push('/dashboard');
                            }}
                        >
                            Start Designing for Free
                        </Button>
                    </motion.div>

                    <motion.div
                        className="absolute bottom-10 transform -translate-x-1/2 flex items-center justify-center"
                        animate={{ y: [0, 10, 0] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: 'easeInOut'
                        }}
                    >
                        <div
                            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center"
                            role="button"
                            onClick={() => {
                                containerRef.current.scrollIntoView({
                                    behavior: 'smooth'
                                });
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    containerRef.current.scrollIntoView({
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                        >
                            <Smile className="text-blue-500" size={32} />
                        </div>
                    </motion.div>
                </section>

                <section className="bg-white" data-scroll-section>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 320"
                    >
                        <path
                            fill="#f0f9ff"
                            fillOpacity="1"
                            d="M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,85.3C672,53,768,43,864,74.7C960,107,1056,181,1152,224C1248,267,1344,277,1392,282.7L1440,288L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                        ></path>
                    </svg>
                </section>

                <section
                    className="py-20 px-4 bg-white"
                    data-scroll-section
                    ref={containerRef}
                    id="features"
                >
                    <div className="max-w-6xl mx-auto">
                        <motion.h2
                            className="text-4xl font-bold mb-12 text-center text-gray-900"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            Powerful Features for Effortless Design
                        </motion.h2>
                        <div className="space-y-20">
                            <motion.div
                                className="flex flex-col md:flex-row items-center gap-8"
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <Image
                                    src="/tools.png"
                                    alt="Intuitive Editor"
                                    width={400}
                                    height={300}
                                    className="rounded-lg shadow-lg"
                                />
                                <div>
                                    <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                                        Intuitive Editor
                                    </h3>
                                    <p className="text-gray-700">
                                        Our simple click to insert interface makes it
                                        easy to create professional designs in
                                        minutes. No design skills required!
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div
                                className="flex flex-col md:flex-row-reverse items-center gap-8"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <Image
                                    src="/ai.png"
                                    alt="AI-Powered Tools"
                                    width={400}
                                    height={300}
                                    className="rounded-lg shadow-lg"
                                />
                                <div>
                                    <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                                        AI-Powered Tools
                                    </h3>
                                    <p className="text-gray-700">
                                        Leverage the power of AI to enhance your
                                        designs, generate ideas, and automate
                                        repetitive tasks.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div
                                className="flex flex-col md:flex-row items-center gap-8"
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <Image
                                    src="/multipage.png"
                                    alt="Multi Page Editor"
                                    width={400}
                                    height={300}
                                    className="rounded-lg shadow-lg"
                                />
                                <div>
                                    <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                                        Multi Page Editor
                                    </h3>
                                    <p className="text-gray-700">
                                        Create multiple pages with ease. Add
                                        text, images, shapes, filters, and
                                        more.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section className="py-20 px-4 bg-gray-100" data-scroll-section>
                    <div className="max-w-6xl mx-auto">
                        <motion.h2
                            className="text-4xl font-bold mb-12 text-center text-gray-900"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            Discover What You Can Create
                        </motion.h2>
                        <Carousel />
                    </div>
                </section>

                <section
                    className="py-20 px-4 bg-slate-900 text-white"
                    data-scroll-section
                >
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.h2
                            className="text-4xl font-bold mb-6"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            Start Creating Beautiful Designs Today
                        </motion.h2>
                        <motion.p
                            className="text-xl mb-8"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            Join millions of users who trust Designered for
                            their creative needs. Try it free for 14 days.
                        </motion.p>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <Button
                                variant="secondary"
                                className="bg-blue-500 hover:bg-blue-600 text-white text-lg py-6"
                                onClick={() => {
                                    router.push('/register');
                                }}
                            >
                                Start Now
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-transparent border-white text-white hover:bg-white hover:text-slate-900 text-lg py-6"
                                onClick={() => {
                                    router.push('/login');
                                }}
                            >
                                Login
                            </Button>
                        </motion.div>
                    </div>
                </section>

                <footer
                    className="bg-slate-950 text-white py-12 px-4"
                    data-scroll-section
                >
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold mb-4">
                                Designered
                            </h3>
                            <p className="text-gray-300">
                                Empowering creativity through intuitive design
                                tools.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-4">
                                Quick Links
                            </h4>
                            <nav className="flex flex-col gap-2">
                                <Link target="_blank" href="/terms">
                                    Terms of Service
                                </Link>
                                <Link target="_blank" href="/privacy">
                                    Privacy Policy
                                </Link>
                                <Link
                                    target="_blank"
                                    href="mailto:mshivam019@gmail.com"
                                >
                                    Contact Us
                                </Link>
                            </nav>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-4">
                                Connect With Us
                            </h4>
                            <div className="flex gap-4">
                                <Link
                                    href="https://github.com/mshivam019"
                                    target="_blank"
                                    className="text-white hover:text-blue-300 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 30 30"
                                        aria-hidden="true"
                                    >
                                        <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z" />
                                    </svg>
                                </Link>
                                <Link
                                    href="https://www.linkedin.com/in/mshivam019"
                                    target="_blank"
                                    className="text-white hover:text-blue-300 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 50 300 150"
                                        aria-hidden="true"
                                    >
                                        <g
                                            fill-rule="nonzero"
                                            stroke="none"
                                            stroke-width="1"
                                            stroke-linecap="butt"
                                            stroke-linejoin="miter"
                                            stroke-miterlimit="10"
                                            stroke-dasharray=""
                                            stroke-dashoffset="0"
                                            font-family="none"
                                            font-weight="none"
                                            font-size="none"
                                            text-anchor="none"
                                            style={{
                                                mixBlendMode: 'normal'
                                            }}
                                        >
                                            <g transform="scale(5.12,5.12)">
                                                <path d="M41,4h-32c-2.76,0 -5,2.24 -5,5v32c0,2.76 2.24,5 5,5h32c2.76,0 5,-2.24 5,-5v-32c0,-2.76 -2.24,-5 -5,-5zM17,20v19h-6v-19zM11,14.47c0,-1.4 1.2,-2.47 3,-2.47c1.8,0 2.93,1.07 3,2.47c0,1.4 -1.12,2.53 -3,2.53c-1.8,0 -3,-1.13 -3,-2.53zM39,39h-6c0,0 0,-9.26 0,-10c0,-2 -1,-4 -3.5,-4.04h-0.08c-2.42,0 -3.42,2.06 -3.42,4.04c0,0.91 0,10 0,10h-6v-19h6v2.56c0,0 1.93,-2.56 5.81,-2.56c3.97,0 7.19,2.73 7.19,8.26z"></path>
                                            </g>
                                        </g>
                                    </svg>
                                </Link>
                                <Link
                                    href="https://x.com/mshivam0019"
                                    target="_blank"
                                    className="text-white hover:text-blue-300 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-gray-400">
                        <p>
                            &copy; {new Date().getFullYear()} Designered. All
                            rights reserved.
                        </p>
                    </div>
                </footer>
            </main>
        </ReactLenis>
    );
}
