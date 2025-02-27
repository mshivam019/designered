import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

import Arrow from '../../public/arrow.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CardProps {
    image: string;
}

export default function Card({ image }: CardProps): React.JSX.Element {
    const [showOverlay, setShowOverlay] = useState(false);
    const router = useRouter();

    return (
        <motion.div
            className="relative overflow-hidden h-[200px] min-w-[200px] bg-slate-400 rounded-xl flex justify-center items-center"
            key={image}
            onHoverStart={() => setShowOverlay(true)}
            onHoverEnd={() => setShowOverlay(false)}
        >
            <AnimatePresence>
                {showOverlay && (
                    <motion.div
                        className="absolute left-0 top-0 bottom-0 right-0 z-10 flex justify-center items-center cursor-pointer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => router.push('/dashboard')}
                    >
                        <div className="absolute bg-black pointer-events-none opacity-50 h-full w-full" />
                        <motion.h1
                            className="bg-white font-semibold text-sm z-10 px-3 py-2 rounded-full flex items-center gap-[0.5ch] hover:opacity-75"
                            initial={{ y: 10 }}
                            animate={{ y: 0 }}
                            exit={{ y: 10 }}
                        >
                            <span>Explore Now</span>
                            <Image
                                src={Arrow}
                                alt="Arrow Icon"
                                className="h-4 w-4"
                            />
                        </motion.h1>
                    </motion.div>
                )}
            </AnimatePresence>
            <Image
                src={image}
                alt={image}
                fill
                style={{ objectFit: 'cover' }}
            />
        </motion.div>
    );
}
