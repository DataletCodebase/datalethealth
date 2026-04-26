import { useState } from "react";
import avatar1 from "../../assets/images/avatar_1.avif";
import avatar2 from "../../assets/images/avatar_2.avif";
import avatar3 from "../../assets/images/avatar_3.avif";
import avatar4 from "../../assets/images/avatar_4.avif";
import avatar5 from "../../assets/images/avatar_5.avif";
import avatar6 from "../../assets/images/avatar_6.avif";
import avatar7 from "../../assets/images/avatar_7.avif";

const teamMembers = [
  {
    id: 1,
    name: "Dibyaranjan Sahoo",
    role: "Frontend Engineer",
    initials: "DS",
    avatar: avatar1,
    linkedin: "#",
    twitter: "#",
    github: "#",
  },
  {
    id: 2,
    name: "Dr. Joy Lal Sarkar",
    role: "Research Lead",
    initials: "JL",
    avatar: avatar2,
    linkedin: "#",
    twitter: "#",
    github: "#",
  },
  {
    id: 3,
    name: "Milan Sahoo",
    role: "Full Stack Developer",
    initials: "MS",
    avatar: avatar3,
    linkedin: "#",
    twitter: "#",
    github: "#",
  },
  {
    id: 4,
    name: "Pritish Kumar Ray",
    role: "Backend Engineer",
    initials: "PR",
    avatar: avatar4,
    linkedin: "#",
    twitter: "#",
    github: "#",
  },
  {
    id: 5,
    name: "Siddhartha Deb",
    role: "Backend Engineer",
    initials: "SD",
    avatar: avatar5,
    linkedin: "#",
    twitter: "#",
    github: "#",
  },
  {
    id: 6,
    name: "Subhashish Das Mohapatra",
    role: "Lead Architect",
    initials: "SM",
    avatar: avatar6,
    linkedin: "#",
    twitter: "#",
    github: "#",
  },
  {
    id: 7,
    name: "Swarup Kumar Behera",
    role: "UI/UX Designer",
    initials: "SK",
    avatar: avatar7,
    linkedin: "#",
    twitter: "#",
    github: "#",
  },
];

const LinkedInIcon = () => (
  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const TwitterIcon = () => (
  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
  </svg>
);
const GitHubIcon = () => (
  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
  </svg>
);

interface Member {
  id: number;
  name: string;
  role: string;
  initials: string;
  avatar: string;
  linkedin: string;
  twitter: string;
  github: string;
}

function MemberCard({ member, index }: { member: Member; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <style>{`
        @keyframes fadeUp-${member.id} {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-enter-${member.id} {
          animation: fadeUp-${member.id} 0.48s cubic-bezier(0.22,1,0.36,1) ${index * 0.07}s both;
        }
        .avatar-img-${member.id} {
          transition: transform 0.38s cubic-bezier(0.34,1.56,0.64,1);
          transform: scale(1);
        }
        .avatar-img-${member.id}:hover {
          transform: scale(1.13);
        }
      `}</style>

      <div
        className={`card-enter-${member.id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#ffffff",
          borderRadius: 18,
          padding: "36px 28px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          cursor: "pointer",
          border: hovered ? "1.5px solid #8B00DC" : "1.5px solid #E8E0F5",
          boxShadow: hovered
            ? "0 14px 44px rgba(123,0,204,0.12), 0 2px 8px rgba(0,0,0,0.04)"
            : "0 2px 14px rgba(0,0,0,0.05)",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          transition: "all 0.28s cubic-bezier(0.22,1,0.36,1)",
          position: "relative",
          overflow: "hidden",
          clipPath:
            "polygon(0% 0%, 92% 0%, 100% 6%, 100% 100%, 8% 100%, 0% 94%)",
        }}
      >
        {/* Top accent stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2.5,
            background:
              "linear-gradient(90deg, transparent, #7B00CC 50%, transparent)",
            opacity: hovered ? 0.9 : 0.2,
            transition: "opacity 0.3s",
          }}
        />

        {/* Avatar */}
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            overflow: "hidden",
            border: hovered ? "2.5px solid #8B00DC" : "2.5px solid #E8E0F5",
            transition: "border-color 0.28s",
            flexShrink: 0,
            background: "#f3e8ff",
            marginBottom: 20,
          }}
        >
          <img
            src={member.avatar}
            alt={member.name}
            className={`avatar-img-${member.id}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* Name */}
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#0D0D0D",
            lineHeight: 1.3,
            marginBottom: 6,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {member.name}
        </h3>

        {/* Role pill */}
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 600,
            color: "#7B00CC",
            background: "#FAF7FF",
            border: "1px solid #E8E0F5",
            padding: "4px 12px",
            borderRadius: 100,
            marginBottom: 22,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: 0.1,
          }}
        >
          {member.role}
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: 1,
            background: "#E8E0F5",
            marginBottom: 16,
          }}
        />

        {/* Social icons */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { href: member.linkedin, Icon: LinkedInIcon, label: "LinkedIn" },
            { href: member.twitter, Icon: TwitterIcon, label: "Twitter" },
            { href: member.github, Icon: GitHubIcon, label: "GitHub" },
          ].map(({ href, Icon, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                borderRadius: 9,
                color: "#9898A8",
                background: "#FAF7FF",
                border: "1px solid #E8E0F5",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "#7B00CC";
                el.style.background = "#f3e8ff";
                el.style.borderColor = "#C084FC";
                el.style.transform = "translateY(-2px)";
                el.style.boxShadow = "0 4px 12px rgba(123,0,204,0.16)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "#9898A8";
                el.style.background = "#FAF7FF";
                el.style.borderColor = "#E8E0F5";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              <Icon />
            </a>
          ))}
        </div>

        {/* Bottom strip */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, #7B00CC 50%, transparent)",
            opacity: hovered ? 0.4 : 0.06,
            transition: "opacity 0.3s",
          }}
        />
      </div>
    </>
  );
}

export function Team() {
  return (
    <section
      id="team"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#FAF7FF",
        padding: "90px 24px 110px",
      }}
    >
      {/* ── Section Header ── */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h2
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 900,
            color: "#0D0D0D",
            margin: "0 0 14px",
            letterSpacing: -0.5,
          }}
        >
          Our{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #7B00CC, #CC00FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Team
          </span>
        </h2>

        <p
          style={{
            fontSize: 15,
            color: "#5A5A72",
            maxWidth: 400,
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          The brilliant minds behind every innovation — driven by purpose,
          powered by expertise.
        </p>

        {/* Decorative rule */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginTop: 24,
          }}
        >
          <div
            style={{
              height: 1.5,
              width: 44,
              background: "linear-gradient(90deg,transparent,#C084FC)",
            }}
          />
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#7B00CC",
            }}
          />
          <div
            style={{
              height: 1.5,
              width: 44,
              background: "linear-gradient(90deg,#C084FC,transparent)",
            }}
          />
        </div>
      </div>

      {/* ── Cards Grid — fixed 3 columns ── */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 28,
          }}
        >
          {teamMembers.map((m, i) => (
            <MemberCard key={m.id} member={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
