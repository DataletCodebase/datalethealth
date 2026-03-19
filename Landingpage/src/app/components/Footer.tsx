import { Twitter, Linkedin, Youtube, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import dataletLogo from "../../imports/healthcare_logo2.svg";

const cols = {
  "Quick Links": ["Home", "Solutions", "How It Works", "About", "Testimonials"],
  Contact: ["info@datalet.health", "1-800-DATALET", "San Francisco, CA 94105"],
  "Company": ["Careers", "Press Room", "Privacy Policy", "Terms of Service", "HIPAA Notice"],
};

export function Footer() {
  const go = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="bg-white border-t border-[#8B00DC]/[0.08]">
      {/* Newsletter band */}
      <div className="border-b border-[#8B00DC]/[0.06]">
        <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-bold text-[#0D0D0D] mb-1">Stay ahead of healthcare trends</div>
            <p className="text-[#9898A8] text-sm">Weekly insights from the Datalet team.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 md:w-64 bg-[#FAF7FF] border border-[#E8E0F5] text-[#0D0D0D] placeholder-[#C4B8D8] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#8B00DC]/40 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 text-white text-sm font-semibold rounded-2xl flex items-center gap-2 shrink-0 shadow-lg shadow-[#8B00DC]/20"
              style={{ background: "linear-gradient(135deg, #7B00CC 0%, #CC00FF 100%)" }}
            >
              Subscribe <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <button
              onClick={() => go("#hero")}
              className="flex items-center mb-6"
            >
              <img 
                src={dataletLogo} 
                alt="Datalet Healthcare" 
                className="h-12 w-auto object-contain" 
              />
            </button>
            <p className="text-[#9898A8] text-sm leading-relaxed mb-8 max-w-xs">
              Empowering healthcare organisations with data intelligence that drives better
              outcomes, reduced costs, and improved patient experiences.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.15, y: -2, color: "#8B00DC", borderColor: "rgba(139,0,220,0.3)" }}
                  className="w-10 h-10 rounded-2xl border border-[#E8E0F5] flex items-center justify-center text-[#C4B8D8] transition-all hover:shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(cols).map(([title, links]) => (
            <div key={title}>
              <div className="text-[#0D0D0D] text-sm font-semibold mb-6">{title}</div>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 3, color: "#8B00DC" }}
                      className="text-sm text-[#9898A8] transition-colors block"
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-[#8B00DC]/[0.06]">
        <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-[#C4B8D8] text-sm">© 2026 Datalet Healthcare, Inc. All rights reserved.</div>
          <div className="flex gap-6 text-[#C4B8D8] text-xs">
            {["Privacy", "Terms", "HIPAA", "Cookies"].map((l) => (
              <motion.a
                key={l}
                href="#"
                whileHover={{ color: "#8B00DC" }}
                className="font-medium transition-colors"
              >
                {l}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}