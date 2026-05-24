import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  ArrowRight,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { tools } from '@/config/tools';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const springConfig = { stiffness: 100, damping: 30 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const moveX1 = useTransform(springX, [-1, 1], [-20, 20]);
  const moveY1 = useTransform(springY, [-1, 1], [-20, 20]);
  
  const moveX2 = useTransform(springX, [-1, 1], [15, -15]);
  const moveY2 = useTransform(springY, [-1, 1], [15, -15]);

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8 md:pt-16">
        <motion.div style={{ x: moveX2, y: moveY2 }} className="flex justify-center">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-sm font-semibold"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            100% Secure & Local
          </motion.div>
        </motion.div>
        
        <motion.div style={{ x: moveX1, y: moveY1 }}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mt-4 mb-6"
          >
            Every file tool you need, <br className="hidden md:block"/>
            <span className="text-indigo-600 dark:text-indigo-400">
              right in your app.
            </span>
          </motion.h1>
        </motion.div>

        <motion.div style={{ x: moveX2, y: moveY2 }}>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            Secure, fast, and free utility tools. Files are processed locally on your device, meaning maximum privacy and zero wait times.
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-xl mx-auto mt-8"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a tool... (e.g., PDF to Image, Resize)"
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm transition-all"
            />
          </div>
        </motion.div>
      </section>

      {filteredTools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 text-lg">No tools found matching "{searchQuery}"</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTools.map((tool, idx) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 + 0.2 }}
          >
            <Link
              to={tool.path}
              className="group relative flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300 ease-out hover:-translate-y-1"
            >
              <div className={cn("inline-flex p-4 rounded-2xl mb-6 w-fit transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 text-white", tool.bg)}>
                <tool.icon className={cn("w-7 h-7", tool.color)} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {tool.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm flex-grow leading-relaxed">
                {tool.description}
              </p>
              <div className="mt-8 flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300">
                Try now <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </motion.div>
          ))}
        </section>
      )}
    </div>
  );
}
