import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Tag } from "lucide-react";

import aware1 from "../../assets/images/aware1.avif";
import aware2 from "../../assets/images/aware2.avif";
import aware3 from "../../assets/images/aware3.avif";
import aware4 from "../../assets/images/aware4.avif";
import aware5 from "../../assets/images/aware5.avif";
import aware6 from "../../assets/images/aware6.avif";

const blogData = [
  {
    title: "Healthy Eating Habits",
    description:
      "Learn the essentials of a balanced, nourishing lifestyle — from meal timing to mindful portions that fuel your day.",
    category: "Health",
    readTime: "5 min read",
    image: aware1,
    accent: "#7B00CC",
  },
  {
    title: "Fitness Trends 2025",
    description:
      "Stay ahead with the latest movement science — hybrid training, wearable tech, and recovery protocols reshaping fitness.",
    category: "Fitness",
    readTime: "4 min read",
    image: aware2,
    accent: "#9500CC",
  },
  {
    title: "Mental Health Awareness",
    description:
      "Understanding the importance of mental well-being and practical tools to build emotional resilience every day.",
    category: "Mental Health",
    readTime: "6 min read",
    image: aware3,
    accent: "#B800EE",
  },
  {
    title: "Nutrition Tips",
    description:
      "Evidence-based nutrition guidance for a balanced diet — macros, micros, and the science of eating for longevity.",
    category: "Nutrition",
    readTime: "5 min read",
    image: aware4,
    accent: "#7B00CC",
  },
  {
    title: "Workplace Wellness",
    description:
      "How to maintain physical and mental wellness at work — ergonomics, movement breaks, and stress management.",
    category: "Work",
    readTime: "4 min read",
    image: aware5,
    accent: "#9500CC",
  },
  {
    title: "Yoga and Meditation",
    description:
      "Find peace and clarity with yoga and meditation techniques backed by neuroscience and ancient wisdom.",
    category: "Wellness",
    readTime: "7 min read",
    image: aware6,
    accent: "#B800EE",
  },
];

/* ── Organic blob SVG paths ── */
const BlobDecor = ({
  style,
  opacity = 0.07,
  color = "#8B00DC",
}: {
  style?: React.CSSProperties;
  opacity?: number;
  color?: string;
}) => (
  <svg
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: "absolute",
      pointerEvents: "none",
      fill: color,
      opacity,
      ...style,
    }}
  >
    <path
      d="M44.7,-57.1C56.2,-46.7,62.2,-30.5,65.1,-13.7C68,3.1,67.8,20.5,60.2,33.8C52.6,47.1,37.7,56.4,21.5,62.1C5.3,67.8,-12.1,69.9,-27.6,64.5C-43.1,59.1,-56.7,46.2,-63.5,30.3C-70.4,14.4,-70.5,-4.5,-63.6,-19.7C-56.7,-34.9,-42.8,-46.4,-28.7,-56.3C-14.6,-66.3,0.7,-74.7,14.4,-72.2C28.1,-69.7,33.2,-67.5,44.7,-57.1Z"
      transform="translate(100 100)"
    />
  </svg>
);

const BlobDecor2 = ({
  style,
  opacity = 0.06,
  color = "#CC00FF",
}: {
  style?: React.CSSProperties;
  opacity?: number;
  color?: string;
}) => (
  <svg
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: "absolute",
      pointerEvents: "none",
      fill: color,
      opacity,
      ...style,
    }}
  >
    <path
      d="M38.5,-49.3C49.7,-38.6,58.5,-25.8,62.1,-11.1C65.7,3.6,64.1,20.2,56,32.8C47.9,45.4,33.4,54,17.8,59.1C2.3,64.2,-14.3,65.8,-29.4,60.4C-44.6,55,-58.4,42.6,-65.2,27.1C-72,11.5,-71.8,-7.2,-64.5,-22.1C-57.2,-37,-42.8,-48.1,-28.2,-57.8C-13.6,-67.5,1.1,-75.8,14.5,-73.1C27.9,-70.4,27.3,-60,38.5,-49.3Z"
      transform="translate(100 100)"
    />
  </svg>
);

function BlogCard({
  blog,
  index,
  featured = false,
}: {
  blog: (typeof blogData)[0];
  index: number;
  featured?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          gridColumn: "span 2",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderRadius: 22,
          overflow: "hidden",
          border: hovered ? "1.5px solid #8B00DC" : "1.5px solid #EDE5F8",
          background: "#fff",
          boxShadow: hovered
            ? "0 24px 64px rgba(123,0,204,0.16)"
            : "0 4px 20px rgba(0,0,0,0.06)",
          transform: hovered ? "translateY(-5px)" : "translateY(0)",
          transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
          cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Image side */}
        <div
          style={{ position: "relative", overflow: "hidden", minHeight: 280 }}
        >
          <img
            src={blog.image}
            alt={blog.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              transition: "transform 0.6s ease",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              display: "block",
            }}
          />
          {/* Gradient over image */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg,rgba(123,0,204,0.35) 0%,rgba(0,0,0,0.1) 100%)",
            }}
          />
          {/* Featured label */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#fff",
              background: "linear-gradient(135deg,#7B00CC,#CC00FF)",
              padding: "5px 12px",
              borderRadius: 100,
            }}
          >
            Featured
          </div>

          {/* Blob decor on image */}
          <BlobDecor
            color="#fff"
            opacity={0.08}
            style={{ width: 180, bottom: -40, right: -40 }}
          />
        </div>

        {/* Content side */}
        <div
          style={{
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle blob background */}
          <BlobDecor2
            color="#CC00FF"
            opacity={0.04}
            style={{ width: 260, top: -60, right: -60 }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#7B00CC",
                background: "#f3e8ff",
                border: "1px solid #E8D9FF",
                padding: "3px 10px",
                borderRadius: 100,
                letterSpacing: 0.2,
              }}
            >
              {blog.category}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#AEAEBF",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Clock size={11} /> {blog.readTime}
            </span>
          </div>

          <h3
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: "#0D0D0D",
              lineHeight: 1.2,
              marginBottom: 14,
              letterSpacing: -0.5,
            }}
          >
            {blog.title}
          </h3>

          <p
            style={{
              fontSize: 14,
              color: "#5A5A72",
              lineHeight: 1.75,
              marginBottom: 24,
              fontWeight: 400,
            }}
          >
            {blog.description}
          </p>

          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
              color: "#7B00CC",
              textDecoration: "none",
              transition: "gap 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.gap = "12px";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.gap = "8px";
            }}
          >
            Read Article <ArrowRight size={15} />
          </a>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.07,
        duration: 0.52,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: hovered ? "1.5px solid #8B00DC" : "1.5px solid #EDE5F8",
        background: "#fff",
        boxShadow: hovered
          ? "0 16px 48px rgba(123,0,204,0.13)"
          : "0 2px 14px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.32s cubic-bezier(0.22,1,0.36,1)",
        cursor: "pointer",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden", height: 200 }}>
        <img
          src={blog.image}
          alt={blog.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            transition: "transform 0.6s ease",
            transform: hovered ? "scale(1.07)" : "scale(1)",
          }}
        />
        {/* Gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,0,28,0.55) 0%, transparent 60%)",
          }}
        />

        {/* Blob shape over image bottom */}
        <svg
          viewBox="0 0 400 80"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            bottom: -2,
            left: 0,
            width: "100%",
            fill: "#ffffff",
          }}
          preserveAspectRatio="none"
        >
          <path d="M0,40 C100,80 300,0 400,40 L400,80 L0,80 Z" />
        </svg>

        {/* Category chip */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: "#fff",
            background: "rgba(123,0,204,0.75)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            padding: "4px 10px",
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <Tag size={9} /> {blog.category}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "20px 22px 22px",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle blob behind content */}
        <BlobDecor
          color="#8B00DC"
          opacity={0.04}
          style={{ width: 160, bottom: -30, right: -30 }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10,
            fontSize: 11,
            color: "#AEAEBF",
          }}
        >
          <Clock size={11} />
          {blog.readTime}
        </div>

        <h3
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#0D0D0D",
            lineHeight: 1.3,
            marginBottom: 10,
            letterSpacing: -0.2,
          }}
        >
          {blog.title}
        </h3>

        <p
          style={{
            fontSize: 13,
            color: "#6B6B85",
            lineHeight: 1.7,
            flexGrow: 1,
            marginBottom: 18,
            fontWeight: 400,
          }}
        >
          {blog.description}
        </p>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: hovered
              ? "linear-gradient(90deg,#C084FC,transparent)"
              : "#F0EAFF",
            marginBottom: 16,
            transition: "background 0.3s",
          }}
        />

        <a
          href="#"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13,
            fontWeight: 700,
            color: "#7B00CC",
            textDecoration: "none",
            transition: "gap 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.gap = "11px";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.gap = "7px";
          }}
        >
          Read More <ArrowRight size={14} />
        </a>
      </div>
    </motion.article>
  );
}

export const Blog = () => {
  const [featured, ...rest] = blogData;

  return (
    <section
      id="blog"
      style={{
        background: "#FAF7FF",
        padding: "90px 24px 120px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ── Background decoration ── */}
      <BlobDecor
        color="#8B00DC"
        opacity={0.06}
        style={{ width: 500, top: -120, right: -100 }}
      />
      <BlobDecor2
        color="#CC00FF"
        opacity={0.05}
        style={{ width: 400, bottom: -80, left: -80 }}
      />
      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.016,
          backgroundImage:
            "radial-gradient(circle,#8B00DC 1px,transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#7B00CC",
              background: "#f3e8ff",
              border: "1px solid #D8B4FE",
              padding: "5px 16px",
              borderRadius: 100,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#7B00CC,#CC00FF)",
                display: "inline-block",
              }}
            />
            Health & Wellness Insights
          </div>

          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 900,
              color: "#0D0D0D",
              margin: "0 0 16px",
              letterSpacing: -1,
              lineHeight: 1.1,
            }}
          >
            Our Latest{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#7B00CC,#CC00FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Blogs
            </span>
          </h2>

          <p
            style={{
              fontSize: 15,
              color: "#5A5A72",
              maxWidth: 460,
              margin: "0 auto",
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            Expert-written articles on health, nutrition, fitness, and mental
            well-being to help you live better every day.
          </p>
        </motion.div>

        {/* ── Grid ── */}
        <div className="blog-grid">
          {/* Featured card — spans 2 cols */}
          <BlogCard blog={featured} index={0} featured />

          {/* Remaining 5 cards */}
          {rest.map((blog, i) => (
            <BlogCard key={blog.title} blog={blog} index={i + 1} />
          ))}
        </div>

        {/* ── View All CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ textAlign: "center", marginTop: 52 }}
        >
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(135deg,#7B00CC,#CC00FF)",
              padding: "14px 32px",
              borderRadius: 100,
              textDecoration: "none",
              boxShadow: "0 8px 28px rgba(123,0,204,0.3)",
              transition: "all 0.25s ease",
              letterSpacing: 0.2,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-3px)";
              el.style.boxShadow = "0 14px 36px rgba(123,0,204,0.4)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "0 8px 28px rgba(123,0,204,0.3)";
            }}
          >
            View All Articles <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>

      <style>{`
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .blog-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .blog-grid > article:first-child {
            grid-column: span 2;
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 640px) {
          .blog-grid {
            grid-template-columns: 1fr;
          }
          .blog-grid > article:first-child {
            grid-column: span 1;
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default Blog;
