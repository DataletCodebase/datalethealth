import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import dataletLogo from "../../imports/healthcare_logo2.svg";

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "Solutions", href: "#solutions" },
  { label: "About", href: "#about" },
  { label: "Programs", href: "#how-it-works" },
  { label: "Advisory", href: "#advisory" }, //milan
];

// @ts-ignore
const loginUrl = import.meta.env.DEV
  ? "http://localhost:5174/app/login"
  : "/app/login";
// @ts-ignore
const signupUrl = import.meta.env.DEV
  ? "http://localhost:5174/app/signup"
  : "/app/signup";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href) as HTMLElement | null;
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 80,
      behavior: "smooth",
    });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-[#8B00DC]/10 shadow-sm shadow-[#8B00DC]/5"
          : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div
        className="max-w-7xl mx-auto px-8 flex items-center justify-between"
        style={{ height: 72 }}
      >
        {/* Logo */}
        <button onClick={() => go("#hero")} className="flex items-center group">
          <img
            src={dataletLogo}
            alt="Datalet Healthcare"
            className="h-12 w-auto object-contain"
          />
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l, i) => (
            <motion.button
              key={l.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
              whileHover={{
                color: "#8B00DC",
                backgroundColor: "rgba(139,0,220,0.05)",
              }}
              onClick={() => go(l.href)}
              className="px-4 py-2.5 text-sm text-[#5A5A72] rounded-xl font-medium transition-colors"
            >
              {l.label}
            </motion.button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ color: "#8B00DC" }}
            onClick={() => (window.location.href = loginUrl)}
            className="px-5 py-2.5 text-sm text-[#5A5A72] rounded-xl font-medium transition-colors"
          >
            Sign In
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => (window.location.href = signupUrl)}
            className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg shadow-[#8B00DC]/25"
            style={{
              background: "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)",
            }}
          >
            Get Started
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(!open)}
          className="md:hidden text-[#5A5A72] hover:text-[#8B00DC] p-2 rounded-lg transition-colors"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden border-t border-[#8B00DC]/10 bg-white shadow-lg"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((l, i) => (
                <motion.button
                  key={l.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  onClick={() => go(l.href)}
                  className="block w-full text-left px-4 py-3 text-sm text-[#5A5A72] hover:text-[#8B00DC] hover:bg-[#8B00DC]/[0.05] rounded-xl transition-all font-medium"
                >
                  {l.label}
                </motion.button>
              ))}
              <div className="pt-3 border-t border-[#8B00DC]/10">
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  onClick={() => (window.location.href = signupUrl)}
                  className="block w-full py-3 text-sm font-semibold text-white rounded-xl text-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)",
                  }}
                >
                  Get Started
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
