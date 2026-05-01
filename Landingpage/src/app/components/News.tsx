import { motion } from "framer-motion";

const newsData = [
  {
    title: "New Product Launch",
    category: "Announcement",
    date: "May 10, 2026",
    description:
      "We are excited to launch our new product that will change the healthcare industry — delivering smarter, faster, patient-centred insights.",
    link: "#",
    icon: "🚀",
    accentFrom: "#7B00CC",
    accentTo: "#CC00FF",
    categoryBg: "bg-purple-100",
    categoryText: "text-purple-700",
    categoryBorder: "border-purple-200",
  },
  {
    title: "Company Expansion",
    category: "Update",
    date: "April 20, 2026",
    description:
      "Datalet Healthcare is expanding to new markets to serve our customers better, bringing personalised analytics to more health systems.",
    link: "#",
    icon: "🌐",
    accentFrom: "#4F00B8",
    accentTo: "#9B00FF",
    categoryBg: "bg-violet-100",
    categoryText: "text-violet-700",
    categoryBorder: "border-violet-200",
  },
  {
    title: "Security Update",
    category: "Security",
    date: "March 15, 2026",
    description:
      "We've upgraded our security protocols with end-to-end encryption and enhanced HIPAA-compliant data protection for all users.",
    link: "#",
    icon: "🔒",
    accentFrom: "#0070A8",
    accentTo: "#00B4D8",
    categoryBg: "bg-sky-100",
    categoryText: "text-sky-700",
    categoryBorder: "border-sky-200",
  },
];

export const NewsUpdates = () => {
  return (
    <section
      id="news-updates"
      className="relative overflow-hidden py-24 px-6"
      style={{
        background: "#FAF7FF",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ── Background orbs ── */}
      <div
        className="absolute -top-36 -right-36 w-[520px] h-[520px] rounded-full pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(circle,#E9D5FF 0%,transparent 65%)",
        }}
      />
      <div
        className="absolute -bottom-24 -left-20 w-[420px] h-[420px] rounded-full pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(circle,#DDD6FE 0%,transparent 65%)",
        }}
      />

      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #8B00DC 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Section Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center mb-16"
      >
        {/* Eyebrow pill */}
        <span className="inline-block text-[11px] font-bold tracking-[2px] uppercase text-purple-700 bg-purple-50 border border-purple-200 px-5 py-1.5 rounded-full mb-5">
          Latest from Datalet
        </span>

        <h2 className="text-4xl sm:text-5xl font-black text-[#0D0D0D] tracking-tight leading-[1.1] mb-4">
          News &{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg,#7B00CC,#CC00FF)",
            }}
          >
            Updates
          </span>
        </h2>

        <p className="text-[15px] text-[#5A5A72] max-w-[460px] mx-auto leading-relaxed mb-7">
          Stay up to date with the latest announcements, platform updates, and
          milestones from the Datalet Healthcare team.
        </p>

        {/* Decorative rule */}
        <div className="flex items-center justify-center gap-2.5">
          <div
            className="h-px w-14"
            style={{ background: "linear-gradient(90deg,transparent,#C084FC)" }}
          />
          <div className="w-1.5 h-1.5 rounded-full bg-purple-700" />
          <div
            className="h-px w-14"
            style={{ background: "linear-gradient(90deg,#C084FC,transparent)" }}
          />
        </div>
      </motion.div>

      {/* ── Cards grid ── */}
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {newsData.map((news, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: i * 0.12,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -8, scale: 1.018 }}
            className="group relative bg-white rounded-2xl overflow-hidden border border-[#E8E0F5] shadow-sm flex flex-col cursor-pointer transition-all duration-300 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-100"
          >
            {/* Top gradient accent bar */}
            <div
              className="h-1.5 w-full flex-shrink-0"
              style={{
                background: `linear-gradient(90deg,${news.accentFrom},${news.accentTo})`,
              }}
            />

            {/* Icon + category row */}
            <div className="flex items-start justify-between gap-3 px-7 pt-7">
              {/* Icon square */}
              <div
                className="w-13 h-13 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
                style={{
                  width: 52,
                  height: 52,
                  background: `linear-gradient(135deg,${news.accentFrom},${news.accentTo})`,
                  boxShadow: `0 4px 18px ${news.accentFrom}44`,
                }}
              >
                {news.icon}
              </div>

              {/* Category badge */}
              <span
                className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full border whitespace-nowrap mt-1
                  ${news.categoryBg} ${news.categoryText} ${news.categoryBorder}`}
              >
                {news.category}
              </span>
            </div>

            {/* Content */}
            <div className="px-7 pt-5 flex-grow">
              {/* Date */}
              <p className="text-[11px] text-[#9898A8] font-semibold mb-2.5 tracking-wide">
                📅 {news.date}
              </p>

              {/* Title */}
              <h3 className="text-[18px] font-extrabold text-[#0D0D0D] leading-snug mb-3 tracking-tight group-hover:text-purple-800 transition-colors duration-200">
                {news.title}
              </h3>

              {/* Description */}
              <p className="text-[13.5px] text-[#5A5A72] leading-relaxed">
                {news.description}
              </p>
            </div>

            {/* Footer */}
            <div className="px-7 pb-6 pt-5 flex items-center gap-4 mt-2">
              {/* Divider line */}
              <div
                className="h-px flex-1"
                style={{
                  background: "linear-gradient(90deg,#E8E0F5,transparent)",
                }}
              />

              {/* Read more button */}
              <a
                href={news.link}
                className="inline-flex items-center gap-1.5 text-[12px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-4 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 hover:text-white hover:border-transparent"
                style={{}}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    `linear-gradient(135deg,${news.accentFrom},${news.accentTo})`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "";
                }}
              >
                Read More ↗
              </a>
            </div>

            {/* Bottom purple glow strip */}
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-60 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#8B00DC,transparent)",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* ── View All CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative z-10 flex justify-center mt-14"
      >
        <a
          href="#news-updates"
          className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-2xl shadow-xl shadow-purple-300/30 transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
          style={{ background: "linear-gradient(135deg,#7B00CC,#CC00FF)" }}
        >
          View All Updates
          <span className="text-base">↗</span>
        </a>
      </motion.div>
    </section>
  );
};

export default NewsUpdates;
