import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileBox, Moon, Sun, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { tools } from '@/config/tools';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-500/30 transition-colors duration-300">
      <Toaster theme={isDark ? 'dark' : 'light'} position="bottom-right" />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-indigo-600 rounded-xl group-hover:bg-indigo-700 shadow-md transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
                <FileBox className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-50">
                Convertly Tool
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <div className="relative group">
                <button className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none transition-colors py-2">
                  Tools <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-right group-hover:scale-100 scale-95">
                   <div className="p-3 grid gap-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
                     {tools.map(tool => (
                       <Link 
                         key={tool.id} 
                         to={tool.path}
                         className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group/item"
                       >
                         <div className={cn("p-2 rounded-lg shrink-0", tool.bg, tool.color)}>
                           <tool.icon className="w-4 h-4" />
                         </div>
                         <div>
                           <p className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">{tool.name}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-48">{tool.description}</p>
                         </div>
                       </Link>
                     ))}
                   </div>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
                <Link to="/" className="block px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">Home</Link>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Tools</p>
                  <div className="space-y-1">
                    {tools.map(tool => (
                      <Link 
                        key={tool.id} 
                        to={tool.path}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                         <tool.icon className="w-4 h-4 shrink-0" />
                         {tool.name}
                      </Link>
                    ))}
                  </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>
      
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto py-8 text-center text-sm text-slate-500 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} Convertly Tool. Secure browser-based processing.</p>
      </footer>
    </div>
  );
}

