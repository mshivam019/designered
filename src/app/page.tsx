'use client';
import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactLenis } from 'lenis/react';

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

export default function Page() {
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
            <main data-scroll-container className="bg-blue-50">
                <motion.div
                    className="fixed top-0 left-0 right-0 h-1 bg-orange-500 z-50"
                    style={{ scaleX }}
                />

                <section className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-y-visible overflow-x-clip">
                    <BlobShape className="absolute top-0 right-0 text-orange-200 w-96 h-96 -mr-24 -mt-24" />
                    <BlobShape className="absolute bottom-0 left-0 text-blue-200 w-96 h-96 -ml-24 -mb-24" />

                    <motion.div
                        className="z-10 text-center"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeIn' }}
                    >
                        <h1 className="text-6xl font-bold mb-6 text-blue-900">
                            Find Your{' '}
                            <span className="text-orange-500">Inner Peace</span>
                        </h1>
                        <p className="text-xl text-blue-700 mb-8 max-w-2xl">
                            Discover tranquility with guided meditations, sleep
                            stories, and mindfulness exercises. Your journey to
                            a calmer mind starts here.
                        </p>
                        <Button
                            size="lg"
                            className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6"
                            onClick={() => {
                                router.push('/dashboard');
                            }}
                        >
                            Start Your Free Trial
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
                            <Smile className="text-blue-900" size={32} />
                        </div>
                    </motion.div>
                </section>

                <section className="bg-white" data-scroll-section>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 320"
                    >
                        <path
                            fill="#eff6ff"
                            fillOpacity="1"
                            d="M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,85.3C672,53,768,43,864,74.7C960,107,1056,181,1152,224C1248,267,1344,277,1392,282.7L1440,288L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                        ></path>
                    </svg>
                </section>

                <section
                    className="py-20 px-4 bg-blue-900 text-white"
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
                            Start Your Mindfulness Journey Today
                        </motion.h2>
                        <motion.p
                            className="text-xl mb-8"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            Join thousands of people improving their mental
                            well-being. Try MindfulSpace free for 14 days.
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
                                className="bg-orange-500 hover:bg-orange-600 text-white text-lg py-6"
                                onClick={() => {
                                    router.push('/dashboard');
                                }}
                            >
                                Start Free Trial
                            </Button>
                        </motion.div>
                    </div>
                </section>

                <footer
                    className="bg-blue-950 text-white py-12 px-4"
                    data-scroll-section
                >
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold mb-4">
                                MindfulSpace
                            </h3>
                            <p className="text-gray-300">
                                Your journey to inner peace and mindfulness
                                starts here.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-4">
                                Quick Links
                            </h4>
                            <nav className="flex flex-col gap-2">
                                <a
                                    href="#"
                                    className="hover:text-orange-300 transition-colors"
                                >
                                    About Us
                                </a>
                                <a
                                    href="#"
                                    className="hover:text-orange-300 transition-colors"
                                >
                                    Features
                                </a>
                                <a
                                    href="#"
                                    className="hover:text-orange-300 transition-colors"
                                >
                                    Pricing
                                </a>
                                <a
                                    href="#"
                                    className="hover:text-orange-300 transition-colors"
                                >
                                    Contact
                                </a>
                            </nav>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-4">
                                Connect With Us
                            </h4>
                            <div className="flex gap-4">
                                <a
                                    href="#"
                                    className="text-white hover:text-orange-300 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="text-white hover:text-orange-300 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="text-white hover:text-orange-300 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-gray-400">
                        <p>
                            &copy; {new Date().getFullYear()} MindfulSpace. All
                            rights reserved.
                        </p>
                    </div>
                </footer>
            </main>
        </ReactLenis>
    );
}
