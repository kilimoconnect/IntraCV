import React from "react";
import { CVTemplateData } from "./types";
import { TemplateConfig, FONT_STACKS, DENSITY } from "./template-config";

interface Props {
  data: CVTemplateData;
  config: TemplateConfig;
}

// ═══════════════════════════════════════
// INLINE SVG ICONS (12px, stroke-based)
// ═══════════════════════════════════════
const I = ({ d, color, size = 12 }: { d: string; color: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}><path d={d} /></svg>
);
const IconPhone = ({ c, s }: { c: string; s?: number }) => <I d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" color={c} size={s} />;
const IconMail = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const IconPin = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconLinkedin = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
  </svg>
);
const IconGlobe = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
  </svg>
);
const IconBriefcase = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconGradCap = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);
const IconStar = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconShield = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
  </svg>
);
const IconTrophy = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
const IconUser = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconZap = ({ c, s }: { c: string; s?: number }) => <I d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" color={c} size={s} />;
const IconInfo = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
);
const IconFileText = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
  </svg>
);
const IconUsers = ({ c, s }: { c: string; s?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={s||12} height={s||12} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// Section label → icon mapping
const SECTION_ICONS: Record<string, (c: string) => React.ReactNode> = {
  "Professional Summary": (c) => <IconUser c={c} />,
  "Core Skills": (c) => <IconZap c={c} />,
  "Professional Experience": (c) => <IconBriefcase c={c} />,
  "Key Achievements": (c) => <IconTrophy c={c} />,
  "Education": (c) => <IconGradCap c={c} />,
  "Certifications": (c) => <IconShield c={c} />,
  "Additional Information": (c) => <IconInfo c={c} />,
  "Referees": (c) => <IconUsers c={c} />,
  "Declaration": (c) => <IconFileText c={c} />,
};

// ─── Modern bullet point ───
function Bullet({ color, style: bs }: { color: string; style?: string }) {
  if (bs === "arrow") return <span style={{ color, fontSize: "10px", marginRight: "4px", fontWeight: 700 }}>›</span>;
  if (bs === "check") return (
    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: "4px", marginTop: "2px" }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
  if (bs === "diamond") return <span style={{ color, fontSize: "6px", marginRight: "5px", marginTop: "3px", display: "inline-block", transform: "rotate(45deg)" }}>■</span>;
  // Default: colored dot
  return <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0, marginRight: "5px", marginTop: "5px" }} />;
}

// Choose bullet style based on template config
function getBulletStyle(config: TemplateConfig): string {
  const styles = ["dot", "arrow", "check", "diamond"];
  const hash = config.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return styles[hash % styles.length];
}

// ─── Section Heading (with icon) ───
function SH({ label, config }: { label: string; config: TemplateConfig }) {
  const { colors, sectionHeadingStyle, font, showIcons } = config;
  const icon = showIcons && SECTION_ICONS[label] ? SECTION_ICONS[label](colors.accent) : null;
  const base: React.CSSProperties = { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 5px", fontFamily: FONT_STACKS[font], display: "flex", alignItems: "center", gap: "5px" };
  const inner = <>{icon}<span>{label}</span></>;
  switch (sectionHeadingStyle) {
    case "underline": return <h2 style={{ ...base, color: colors.accent, paddingBottom: "3px", borderBottom: `2px solid ${colors.accent}` }}>{inner}</h2>;
    case "bordered": return <h2 style={{ ...base, color: colors.accent, paddingLeft: "8px", borderLeft: `3px solid ${colors.accent}` }}>{inner}</h2>;
    case "pill": return <h2 style={{ ...base, color: colors.accent, background: colors.accentLight, display: "inline-flex", padding: "2px 10px", borderRadius: "10px", fontSize: "9.5px" }}>{inner}</h2>;
    case "filled": return <h2 style={{ ...base, color: "#fff", background: colors.accent, padding: "3px 10px", fontSize: "9.5px", borderRadius: "2px" }}>{inner}</h2>;
    case "uppercase-bar": return <h2 style={{ ...base, color: colors.accent, fontSize: "9.5px", letterSpacing: "1.5px", paddingBottom: "3px", borderBottom: `1px solid ${colors.border}` }}>{inner}</h2>;
    default: return <h2 style={{ ...base, color: colors.accent }}>{inner}</h2>;
  }
}

// ─── 1️⃣ Header Container ───
function HeaderBlock({ data, config, padX }: { data: CVTemplateData; config: TemplateConfig; padX?: string }) {
  const pi = data.personalInfo;
  const { colors, headerStyle, font } = config;
  const ff = FONT_STACKS[font];
  const px = padX || "24px";
  const nm: React.CSSProperties = { fontSize: "22px", fontWeight: 700, margin: 0, fontFamily: ff };
  const title: React.CSSProperties = { fontSize: "11px", margin: "2px 0 0", fontWeight: 600, letterSpacing: "0.5px" };
  const tagline: React.CSSProperties = { fontSize: "9px", margin: "2px 0 0", fontStyle: "italic", opacity: 0.8 };
  const ct: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "6px", fontSize: "8.5px" };

  // Contact items with icons
  const contactItems: { icon: React.ReactNode; text: string }[] = [];
  if (pi.phone) contactItems.push({ icon: <IconPhone c={colors.accent} s={10} />, text: pi.phone });
  if (pi.email) contactItems.push({ icon: <IconMail c={colors.accent} s={10} />, text: pi.email });
  if (pi.location) contactItems.push({ icon: <IconPin c={colors.accent} s={10} />, text: pi.location });
  if (pi.linkedin) contactItems.push({ icon: <IconLinkedin c={colors.accent} s={10} />, text: pi.linkedin });
  if (pi.website) contactItems.push({ icon: <IconGlobe c={colors.accent} s={10} />, text: pi.website });

  // Build contact row helper — renders icons with text
  function ContactRow({ iconColor, textColor, centered, vertical }: { iconColor?: string; textColor?: string; centered?: boolean; vertical?: boolean }) {
    const ic = iconColor || colors.accent;
    const tc = textColor || colors.mutedText;
    if (vertical) return (
      <div style={{ fontSize: "8.5px", color: tc, lineHeight: "1.8", marginTop: "6px" }}>
        {pi.phone && <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><IconPhone c={ic} s={10} />{pi.phone}</div>}
        {pi.email && <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><IconMail c={ic} s={10} />{pi.email}</div>}
        {pi.location && <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><IconPin c={ic} s={10} />{pi.location}</div>}
        {pi.linkedin && <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><IconLinkedin c={ic} s={10} />{pi.linkedin}</div>}
        {pi.website && <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><IconGlobe c={ic} s={10} />{pi.website}</div>}
      </div>
    );
    return (
      <div style={{ ...ct, color: tc, justifyContent: centered ? "center" : undefined }}>
        {contactItems.map((c, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>{c.icon}{c.text}</span>
        ))}
      </div>
    );
  }

  const photo = config.showPhoto ? (
    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: colors.accentLight, border: `2px solid ${colors.accent}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: colors.accent, fontFamily: ff }}>
      {pi.fullName?.charAt(0) || "?"}
    </div>
  ) : null;

  if (headerStyle === "banner") return (
    <div style={{ background: colors.headerBg, color: colors.headerText, padding: `18px ${px} 14px`, display: config.showPhoto ? "flex" : "block", gap: "14px", alignItems: "center" }}>
      {config.showPhoto && <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: colors.headerText, fontFamily: ff }}>{pi.fullName?.charAt(0) || "?"}</div>}
      <div>
        <h1 style={{ ...nm, color: colors.headerText }}>{pi.fullName}</h1>
        {pi.headline && <p style={{ ...title, color: colors.headerText, opacity: 0.9 }}>{pi.headline}</p>}
        {pi.tagline && <p style={{ ...tagline, color: colors.headerText }}>{pi.tagline}</p>}
        <ContactRow iconColor="rgba(255,255,255,0.6)" textColor={colors.headerText} />
      </div>
    </div>
  );
  if (headerStyle === "centered") return (
    <div style={{ textAlign: "center", padding: `16px ${px} 10px`, borderBottom: `2px solid ${colors.accent}` }}>
      {photo && <div style={{ display: "flex", justifyContent: "center", marginBottom: "6px" }}>{photo}</div>}
      <h1 style={{ ...nm, color: colors.accent }}>{pi.fullName}</h1>
      {pi.headline && <p style={{ ...title, color: colors.bodyText }}>{pi.headline}</p>}
      {pi.tagline && <p style={{ ...tagline, color: colors.mutedText }}>{pi.tagline}</p>}
      <ContactRow centered />
    </div>
  );
  if (headerStyle === "split") return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: `16px ${px} 10px`, borderBottom: `2px solid ${colors.accent}`, alignItems: "center" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {photo}
        <div>
          <h1 style={{ ...nm, color: colors.accent }}>{pi.fullName}</h1>
          {pi.headline && <p style={{ ...title, color: colors.bodyText }}>{pi.headline}</p>}
          {pi.tagline && <p style={{ ...tagline, color: colors.mutedText }}>{pi.tagline}</p>}
        </div>
      </div>
      <ContactRow vertical />
    </div>
  );
  if (headerStyle === "accent-bar") return (
    <div style={{ borderLeft: `4px solid ${colors.accent}`, padding: `16px ${px} 10px`, paddingLeft: "16px" }}>
      <h1 style={{ ...nm, color: colors.accent }}>{pi.fullName}</h1>
      {pi.headline && <p style={{ ...title, color: colors.bodyText }}>{pi.headline}</p>}
      {pi.tagline && <p style={{ ...tagline, color: colors.mutedText }}>{pi.tagline}</p>}
      <ContactRow />
    </div>
  );
  if (headerStyle === "minimal") return (
    <div style={{ padding: `14px ${px} 8px` }}>
      <h1 style={{ ...nm, color: colors.accent, fontSize: "20px" }}>{pi.fullName}</h1>
      {pi.headline && <p style={{ ...title, color: colors.bodyText }}>{pi.headline}</p>}
      {pi.tagline && <p style={{ ...tagline, color: colors.mutedText }}>{pi.tagline}</p>}
      <ContactRow />
    </div>
  );
  // default: left
  return (
    <div style={{ padding: `16px ${px} 10px`, borderBottom: `2px solid ${colors.accent}` }}>
      <h1 style={{ ...nm, color: colors.accent }}>{pi.fullName}</h1>
      {pi.headline && <p style={{ ...title, color: colors.bodyText }}>{pi.headline}</p>}
      {pi.tagline && <p style={{ ...tagline, color: colors.mutedText }}>{pi.tagline}</p>}
      <ContactRow />
    </div>
  );
}

// ─── 2️⃣ Professional Summary ───
function SummaryBlock({ data, config }: { data: CVTemplateData; config: TemplateConfig }) {
  if (!data.summary) return null;
  const d = DENSITY[config.density];
  return (
    <div style={{ marginBottom: d.section }}>
      <SH label="Professional Summary" config={config} />
      <p style={{ margin: 0, fontSize: d.fontSize, lineHeight: d.lineHeight, borderLeft: `3px solid ${config.colors.accentLight}`, paddingLeft: "10px" }}>{data.summary}</p>
    </div>
  );
}

// ─── 3️⃣ Core Skills ───
function SkillsBlock({ data, config, inline }: { data: CVTemplateData; config: TemplateConfig; inline?: boolean }) {
  if (data.skills.length === 0) return null;
  const mode = config.skillDisplay || "text";
  const d = DENSITY[config.density];
  const g = data.skills.reduce((a: Record<string, string[]>, s) => { const c = s.category || "Skills"; if (!a[c]) a[c] = []; a[c].push(s.name); return a; }, {});

  // TAGS mode — colored pill badges
  if (mode === "tags") {
    return (
      <div style={{ marginBottom: d.section }}>
        <SH label="Core Skills" config={config} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {data.skills.map((s, i) => (
            <span key={i} style={{ display: "inline-block", padding: "2px 8px", borderRadius: config.borderRadius || "4px", background: config.colors.accentLight, color: config.colors.accent, fontSize: "8.5px", fontWeight: 600, border: `1px solid ${config.colors.accent}22` }}>{s.name}</span>
          ))}
        </div>
      </div>
    );
  }

  // BARS mode — horizontal progress bars
  if (mode === "bars") {
    return (
      <div style={{ marginBottom: d.section }}>
        <SH label="Core Skills" config={config} />
        {data.skills.slice(0, 8).map((s, i) => (
          <div key={i} style={{ marginBottom: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", marginBottom: "1px" }}>
              <span style={{ fontWeight: 600 }}>{s.name}</span>
            </div>
            <div style={{ height: "4px", background: config.colors.border, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${75 + (i % 4) * 7}%`, background: config.colors.accent, borderRadius: "2px" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // DOTS mode — filled/empty circle rating
  if (mode === "dots") {
    return (
      <div style={{ marginBottom: d.section }}>
        <SH label="Core Skills" config={config} />
        {data.skills.slice(0, 8).map((s, i) => {
          const filled = 3 + (i % 3);
          return (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "9px", fontWeight: 600 }}>{s.name}</span>
              <div style={{ display: "flex", gap: "3px" }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <div key={n} style={{ width: "6px", height: "6px", borderRadius: "50%", background: n <= filled ? config.colors.accent : config.colors.border }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // TEXT mode (default) — inline or grouped
  if (inline) {
    return (
      <div style={{ marginBottom: d.section }}>
        <SH label="Core Skills" config={config} />
        <p style={{ margin: 0, fontSize: "9.5px", lineHeight: "1.5" }}>{data.skills.map(s => s.name).join("  •  ")}</p>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: d.section }}>
      <SH label="Core Skills" config={config} />
      {Object.entries(g).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: "3px" }}>
          <p style={{ fontSize: "8.5px", fontWeight: 600, color: config.colors.mutedText, textTransform: "uppercase", margin: "0 0 1px" }}>{cat}</p>
          <p style={{ margin: 0, fontSize: "9.5px", lineHeight: "1.4" }}>{(items as string[]).join("  •  ")}</p>
        </div>
      ))}
    </div>
  );
}

// ─── 4️⃣ Professional Experience ───
function ExperienceBlock({ data, config }: { data: CVTemplateData; config: TemplateConfig }) {
  if (data.experiences.length === 0) return null;
  const d = DENSITY[config.density];
  const style = config.experienceStyle || "standard";

  // TIMELINE mode — vertical accent line on the left
  if (style === "timeline") {
    return (
      <div style={{ marginBottom: d.section }}>
        <SH label="Professional Experience" config={config} />
        {data.experiences.map((e, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", marginBottom: d.item }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: config.colors.accent, marginTop: "3px" }} />
              {i < data.experiences.length - 1 && <div style={{ width: "2px", flex: 1, background: config.colors.border, marginTop: "2px" }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: "2px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <strong style={{ fontSize: d.fontSize }}>{e.title}</strong>
                <span style={{ fontSize: "8.5px", color: config.colors.mutedText, whiteSpace: "nowrap" }}>{e.startDate}{e.startDate && e.endDate ? " – " : ""}{e.endDate}</span>
              </div>
              <p style={{ margin: "1px 0 0", color: config.colors.accent, fontSize: "9.5px", fontWeight: 500 }}>{e.company}{e.location ? ` | ${e.location}` : ""}</p>
              {e.description && <div style={{ margin: "3px 0 0", fontSize: "9.5px", color: config.colors.mutedText, lineHeight: "1.4" }}>{e.description.split("\n").map((line, li) => <div key={li} style={{ marginBottom: "1px" }}>{line}</div>)}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // CARD mode — bordered card per experience
  if (style === "card") {
    return (
      <div style={{ marginBottom: d.section }}>
        <SH label="Professional Experience" config={config} />
        {data.experiences.map((e, i) => (
          <div key={i} style={{ marginBottom: d.item, border: `1px solid ${config.colors.border}`, borderRadius: config.borderRadius || "4px", padding: "8px 10px", background: config.colors.accentLight + "33" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <strong style={{ fontSize: d.fontSize }}>{e.title}</strong>
              <span style={{ fontSize: "8px", color: config.colors.mutedText, whiteSpace: "nowrap", background: config.colors.accentLight, padding: "1px 6px", borderRadius: "8px" }}>{e.startDate}{e.startDate && e.endDate ? " – " : ""}{e.endDate}</span>
            </div>
            <p style={{ margin: "1px 0 0", color: config.colors.accent, fontSize: "9.5px", fontWeight: 500 }}>{e.company}{e.location ? ` | ${e.location}` : ""}</p>
            {e.description && <div style={{ margin: "3px 0 0", fontSize: "9.5px", color: config.colors.mutedText, lineHeight: "1.4" }}>{e.description.split("\n").map((line, li) => <div key={li} style={{ marginBottom: "1px" }}>{line}</div>)}</div>}
          </div>
        ))}
      </div>
    );
  }

  // COMPACT mode — single-line per experience
  if (style === "compact") {
    return (
      <div style={{ marginBottom: d.section }}>
        <SH label="Professional Experience" config={config} />
        {data.experiences.map((e, i) => (
          <div key={i} style={{ marginBottom: "5px", paddingBottom: "5px", borderBottom: i < data.experiences.length - 1 ? `1px solid ${config.colors.border}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: d.fontSize }}><strong>{e.title}</strong> <span style={{ color: config.colors.accent, fontSize: "9px" }}>@ {e.company}</span></span>
              <span style={{ fontSize: "8.5px", color: config.colors.mutedText, whiteSpace: "nowrap" }}>{e.startDate}{e.startDate && e.endDate ? " – " : ""}{e.endDate}</span>
            </div>
            {e.description && <div style={{ margin: "2px 0 0", fontSize: "9px", color: config.colors.mutedText, lineHeight: "1.35" }}>{e.description.split("\n").slice(0, 2).map((line, li) => <div key={li}>{line}</div>)}</div>}
          </div>
        ))}
      </div>
    );
  }

  // STANDARD mode (default)
  const bs = getBulletStyle(config);
  return (
    <div style={{ marginBottom: d.section }}>
      <SH label="Professional Experience" config={config} />
      {data.experiences.map((e, i) => (
        <div key={i} style={{ marginBottom: d.item }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <strong style={{ fontSize: d.fontSize }}>{e.title}</strong>
            <span style={{ fontSize: "8px", color: "#fff", whiteSpace: "nowrap", background: config.colors.accent, padding: "1px 7px", borderRadius: "8px", fontWeight: 500 }}>{e.startDate}{e.startDate && e.endDate ? " – " : ""}{e.endDate}</span>
          </div>
          <p style={{ margin: "2px 0 0", color: config.colors.accent, fontSize: "9.5px", fontWeight: 600 }}>
            {e.company}{e.location ? <span style={{ fontWeight: 400, color: config.colors.mutedText }}>{` · ${e.location}`}</span> : ""}
          </p>
          {e.description && (
            <div style={{ margin: "4px 0 0", fontSize: "9.5px", color: config.colors.mutedText, lineHeight: "1.5" }}>
              {e.description.split("\n").map((line, li) => {
                const cleaned = line.replace(/^[•\-\*]\s*/, "").trim();
                if (!cleaned) return null;
                return (
                  <div key={li} style={{ display: "flex", alignItems: "flex-start", marginBottom: "2px" }}>
                    <Bullet color={config.colors.accent} style={bs} />
                    <span>{cleaned}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── 5️⃣ Key Achievements ───
function AchievementsBlock({ data, config }: { data: CVTemplateData; config: TemplateConfig }) {
  if (!data.keyAchievements || data.keyAchievements.length === 0) return null;
  return (
    <div style={{ marginBottom: DENSITY[config.density].section }}>
      <SH label="Key Achievements" config={config} />
      {data.keyAchievements.map((a, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", fontSize: "9.5px", marginBottom: "3px", lineHeight: "1.45" }}>
          <IconStar c={config.colors.accent} s={10} />
          <span>{a}</span>
        </div>
      ))}
    </div>
  );
}

// ─── 6️⃣ Education ───
function EducationBlock({ data, config }: { data: CVTemplateData; config: TemplateConfig }) {
  if (data.education.length === 0) return null;
  const d = DENSITY[config.density];
  return (
    <div style={{ marginBottom: d.section }}>
      <SH label="Education" config={config} />
      {data.education.map((e, i) => (
        <div key={i} style={{ marginBottom: d.item, display: "flex", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: config.colors.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
            <IconGradCap c={config.colors.accent} s={14} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <strong style={{ fontSize: d.fontSize }}>{e.degree}</strong>
              {e.year && <span style={{ fontSize: "8px", color: config.colors.mutedText, background: config.colors.accentLight, padding: "1px 6px", borderRadius: "6px" }}>{e.year}</span>}
            </div>
            {e.institution && <p style={{ margin: "1px 0 0", color: config.colors.accent, fontSize: "9.5px", fontWeight: 500 }}>{e.institution}</p>}
            {e.description && <p style={{ margin: "2px 0 0", color: config.colors.mutedText, fontSize: "9px", lineHeight: "1.4" }}>{e.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 7️⃣ Certifications ───
function CertificationsBlock({ data, config }: { data: CVTemplateData; config: TemplateConfig }) {
  if (data.certifications.length === 0) return null;
  return (
    <div style={{ marginBottom: DENSITY[config.density].section }}>
      <SH label="Certifications" config={config} />
      {data.certifications.map((c, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "4px" }}>
          <IconShield c={config.colors.accent} s={11} />
          <div>
            <p style={{ margin: 0, fontSize: "9.5px", fontWeight: 600 }}>{c.name}</p>
            {(c.issuer || c.year) && <p style={{ margin: 0, fontSize: "8.5px", color: config.colors.mutedText }}>{c.issuer}{c.issuer && c.year ? " · " : ""}{c.year}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 8️⃣ Additional Information ───
const ADDL_ICONS: Record<string, (c: string) => React.ReactNode> = {
  "Languages": (c) => <IconGlobe c={c} s={10} />,
  "Tools": (c) => <IconZap c={c} s={10} />,
  "Memberships": (c) => <IconUsers c={c} s={10} />,
  "Volunteer": (c) => <IconUser c={c} s={10} />,
  "Projects": (c) => <IconBriefcase c={c} s={10} />,
  "Interests": (c) => <IconStar c={c} s={10} />,
};
function AdditionalInfoBlock({ data, config }: { data: CVTemplateData; config: TemplateConfig }) {
  const items: { label: string; value: string }[] = [];
  if (data.languages?.length) items.push({ label: "Languages", value: data.languages.map(l => `${l.name} (${l.proficiency})`).join(", ") });
  if (data.tools?.length) items.push({ label: "Tools", value: data.tools.join(", ") });
  if (data.memberships?.length) items.push({ label: "Memberships", value: data.memberships.join(", ") });
  if (data.volunteer?.length) items.push({ label: "Volunteer", value: data.volunteer.join(", ") });
  if (data.projects?.length) items.push({ label: "Projects", value: data.projects.map(p => p.name).join(", ") });
  if (data.interests?.length) items.push({ label: "Interests", value: data.interests.join(", ") });
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: DENSITY[config.density].section }}>
      <SH label="Additional Information" config={config} />
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "5px", fontSize: "9.5px", marginBottom: "3px", lineHeight: "1.45" }}>
          {ADDL_ICONS[item.label]?.(config.colors.accent)}
          <span><strong style={{ color: config.colors.accent }}>{item.label}:</strong> {item.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── 9️⃣ Referees ───
function RefereesBlock({ data, config }: { data: CVTemplateData; config: TemplateConfig }) {
  if (!data.referees || data.referees.length === 0) return null;
  return (
    <div style={{ marginBottom: DENSITY[config.density].section }}>
      <SH label="Referees" config={config} />
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {data.referees.map((r, i) => (
          <div key={i} style={{ fontSize: "9px", lineHeight: "1.5" }}>
            <strong style={{ fontSize: "9.5px" }}>{r.name}</strong>
            <div style={{ color: config.colors.mutedText }}>{r.title}</div>
            <div style={{ color: config.colors.mutedText }}>{r.company}</div>
            <div style={{ color: config.colors.mutedText }}>{r.email}</div>
            {r.phone && <div style={{ color: config.colors.mutedText }}>{r.phone}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 🔟 Declaration ───
function DeclarationBlock({ data, config }: { data: CVTemplateData; config: TemplateConfig }) {
  if (!data.declaration?.declaration) return null;
  return (
    <div style={{ marginBottom: DENSITY[config.density].section }}>
      <SH label="Declaration" config={config} />
      <p style={{ margin: 0, fontSize: "9px", lineHeight: "1.4", fontStyle: "italic", color: config.colors.mutedText }}>{data.declaration.declaration}</p>
      {(data.declaration.place || data.declaration.date) && (
        <p style={{ margin: "4px 0 0", fontSize: "8.5px", color: config.colors.mutedText }}>
          {data.declaration.place}{data.declaration.place && data.declaration.date ? ", " : ""}{data.declaration.date}
        </p>
      )}
    </div>
  );
}

// ─── Footer bar — always at the very bottom, fills any remaining space ───
function FooterBar({ config, data }: { config: TemplateConfig; data: CVTemplateData }) {
  const pi = data.personalInfo;
  const ic = config.colors.accentLight;
  return (
    <div style={{ marginTop: "auto", flexShrink: 0, background: config.colors.accent, color: config.colors.accentLight, padding: "8px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "7.5px", letterSpacing: "0.3px" }}>
      <span style={{ fontWeight: 600 }}>{pi.fullName}</span>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {pi.phone && <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><IconPhone c={ic} s={8} />{pi.phone}</span>}
        {pi.email && <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><IconMail c={ic} s={8} />{pi.email}</span>}
        {pi.location && <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><IconPin c={ic} s={8} />{pi.location}</span>}
        {pi.linkedin && <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><IconLinkedin c={ic} s={8} />{pi.linkedin}</span>}
      </div>
    </div>
  );
}

// ─── Section divider between content blocks ───
function SDivider({ config }: { config: TemplateConfig }) {
  const s = config.sectionDivider || "none";
  if (s === "none") return null;
  if (s === "line") return <div style={{ height: "1px", background: `linear-gradient(90deg, ${config.colors.border}, transparent)`, margin: "8px 0" }} />;
  if (s === "dots") return (
    <div style={{ display: "flex", justifyContent: "center", gap: "4px", margin: "6px 0" }}>
      {[1, 2, 3].map(n => <div key={n} style={{ width: "4px", height: "4px", borderRadius: "50%", background: config.colors.accent, opacity: 0.4 }} />)}
    </div>
  );
  if (s === "gradient") return <div style={{ height: "2px", background: `linear-gradient(90deg, ${config.colors.accent}, ${config.colors.accentLight}, transparent)`, margin: "8px 0", borderRadius: "1px" }} />;
  return null;
}

// ─── Section visual wrapper (cards / accent-rows / flow) ───
function SW({ config, idx, children }: { config: TemplateConfig; idx: number; children: React.ReactNode }) {
  const ss = config.sectionStyle || "flow";
  if (ss === "cards") {
    return <div style={{ border: `1px solid ${config.colors.border}`, borderRadius: config.borderRadius || "4px", padding: "8px 10px", marginBottom: DENSITY[config.density].section, background: "#fff" }}>{children}</div>;
  }
  if (ss === "accent-rows" && idx % 2 === 1) {
    return <div style={{ background: config.colors.accentLight, padding: "6px 12px", margin: "0 -12px", marginBottom: DENSITY[config.density].section, borderRadius: config.borderRadius || "0px" }}>{children}</div>;
  }
  return <>{children}</>;
}

// ─── Height calculation constants (must match budget calculator in route.ts) ───
const PAGE_H = 1123;
const STRIPE_H = 4;
const HDR_H = 110;  // estimated header height
const FTR_H = 28;   // estimated footer height
const CPAD_T = 10;  // content area padding-top
const DIV_H = 17;   // divider height (1px + 8px*2 margin)
const SB_INFO_H = 190; // sidebar personal-info block height

// ─── Content-proportional height estimation ───
// Estimates the natural pixel height a section's content needs
function contentPx(data: CVTemplateData, section: string, density: string): number {
  const dm = DENSITY[density] || DENSITY.compact;
  const bodyLine = parseFloat(dm.fontSize) * parseFloat(dm.lineHeight);
  const smallLine = 9.5 * 1.45; // bullet/achievement line height
  const iGap = parseFloat(dm.item);
  const sGap = parseFloat(dm.section);
  const SHpx = 22; // section heading

  switch (section) {
    case "summary": {
      if (!data.summary) return 0;
      const lines = Math.ceil(data.summary.length / 95);
      return SHpx + lines * bodyLine + sGap;
    }
    case "skills": {
      if (data.skills.length === 0) return 0;
      const text = data.skills.map(s => s.name).join("  •  ");
      return SHpx + Math.ceil(text.length / 80) * smallLine + sGap;
    }
    case "experience": {
      if (data.experiences.length === 0) return 0;
      let px = SHpx;
      for (const e of data.experiences) {
        px += bodyLine + 4; // title line + date badge padding
        px += 14; // company line (9.5px + margins)
        const bullets = (e.description || "").split("\n").filter(l => l.trim());
        if (bullets.length > 0) px += 4; // bullet container margin-top
        for (const b of bullets) {
          const cleaned = b.replace(/^[•\-*]\s*/, "").trim();
          const bLines = Math.ceil(Math.max(1, cleaned.length / 80)); // 80 chars/line (conservative)
          px += bLines * smallLine + 2; // line height + marginBottom
        }
        px += iGap;
      }
      return px + sGap;
    }
    case "achievements": {
      const items = data.keyAchievements || [];
      if (items.length === 0) return 0;
      let px = SHpx;
      for (const a of items) px += Math.ceil(Math.max(1, a.length / 90)) * smallLine + 3;
      return px + sGap;
    }
    case "education": {
      if (data.education.length === 0) return 0;
      let px = SHpx;
      for (const e of data.education) {
        px += bodyLine + 12; // degree + institution
        if (e.description) px += Math.ceil(e.description.length / 80) * (9 * 1.4);
        px += iGap;
      }
      return px + sGap;
    }
    case "certifications": {
      if (data.certifications.length === 0) return 0;
      return SHpx + data.certifications.length * 26 + sGap;
    }
    case "additional": {
      let items = 0;
      if (data.languages?.length) items++;
      if (data.tools?.length) items++;
      if (data.memberships?.length) items++;
      if (data.volunteer?.length) items++;
      if (data.projects?.length) items++;
      if (data.interests?.length) items++;
      return items > 0 ? SHpx + items * (smallLine + 3) + sGap : 0;
    }
    case "referees": {
      const refs = data.referees || [];
      if (refs.length === 0) return 0;
      return SHpx + Math.ceil(refs.length / 2) * (5 * 13.5) + sGap;
    }
    case "declaration": {
      if (!data.declaration?.declaration) return 0;
      return SHpx + Math.ceil(data.declaration.declaration.length / 100) * (9 * 1.4) + 20 + sGap;
    }
    default: return 0;
  }
}

// Content-fit distribution: uses actual content sizes as weights
// instead of hardcoded numbers. Caps each section at 2× its natural height
// so small sections don't get absurd amounts of space.
function contentFitDist(
  data: CVTemplateData, density: string,
  sections: [boolean, string, number][], // [hasData, sectionName, fallbackWeight]
  avail: number,
): number[] {
  // Estimate natural height for each section
  const naturals = sections.map(([on, name]) => on ? contentPx(data, name, density) : 0);
  const totalNatural = naturals.reduce((s, n) => s + n, 0);

  if (totalNatural <= 0) {
    // No content — fall back to fixed weights
    return distPx(sections.map(([on, , w]) => [on, w] as [boolean, number]), avail);
  }

  // Use natural heights as weights for proportional distribution
  const distributed = distPx(
    sections.map(([on], i) => [on, Math.max(1, naturals[i])] as [boolean, number]),
    avail,
  );

  // Cap each section height to prevent huge gaps
  // Experience gets 3× cap (it's the largest & most important section)
  // Other sections get 2× cap
  const capped = distributed.map((h, i) => {
    if (!sections[i][0] || naturals[i] <= 0) return h;
    const capMultiplier = sections[i][1] === "experience" ? 3 : 2;
    return Math.min(h, Math.ceil(naturals[i] * capMultiplier));
  });

  return capped;
}

// Helper: sum weights of active sections
function sumW(pairs: [boolean, number][]): number {
  return pairs.filter(([on]) => on).reduce((s, [, w]) => s + w, 0);
}

// Distribute avail pixels across weighted sections — no pixels lost
// Returns an array of integer heights matching the input pairs length
function distPx(pairs: [boolean, number][], avail: number): number[] {
  const tw = pairs.filter(([on]) => on).reduce((s, [, w]) => s + w, 0);
  if (tw <= 0) return pairs.map(() => 0);
  const raw = pairs.map(([on, w]) => (on ? (w / tw) * avail : 0));
  const floored = raw.map((v) => Math.floor(v));
  let rem = avail - floored.reduce((s, v) => s + v, 0);
  // Distribute remainder 1px at a time to sections with largest fractional part
  const order = pairs
    .map((_, i) => i)
    .filter((i) => pairs[i][0])
    .sort((a, b) => (raw[b] - floored[b]) - (raw[a] - floored[a]));
  for (const idx of order) {
    if (rem <= 0) break;
    floored[idx]++;
    rem--;
  }
  return floored;
}

// ─── Section Container — explicit pixel height, NO flex-grow ───
// html2canvas misrenders flex-grow; explicit height is reliable everywhere
function SC({ h: heightPx, children }: { h: number; children: React.ReactNode }) {
  if (!children || heightPx <= 0) return null;
  return (
    <div style={{ height: `${heightPx}px`, overflow: "hidden" }}>
      {children}
    </div>
  );
}

// Helper: check if section has data
function hasData(data: CVTemplateData) {
  return {
    summary: !!data.summary,
    skills: data.skills.length > 0,
    experience: data.experiences.length > 0,
    achievements: !!(data.keyAchievements && data.keyAchievements.length > 0),
    education: data.education.length > 0,
    certifications: data.certifications.length > 0,
    additional: !!(data.languages?.length || data.tools?.length || data.memberships?.length || data.volunteer?.length || data.projects?.length || data.interests?.length),
    referees: !!(data.referees && data.referees.length > 0),
    declaration: !!data.declaration?.declaration,
  };
}

// ═══════════════════════════════════════════════
// MAIN RENDERER — 10 layouts × 3 section styles = 30 visual modes
// ═══════════════════════════════════════════════
export default function ConfigRenderer({ data, config }: Props) {
  const d = DENSITY[config.density];
  const hasBanner = config.headerStyle === "banner";
  const pad = d.page.split(" ");
  const padX = pad[1] || pad[0] || "32px";
  const layout = config.layout;

  const pageBase: React.CSSProperties = {
    width: "794px",
    height: `${PAGE_H}px`,
    overflow: "hidden",
    background: "#fff",
    fontFamily: FONT_STACKS[config.font],
    fontSize: d.fontSize,
    lineHeight: d.lineHeight,
    color: config.colors.bodyText,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column" as const,
  };

  const h = hasData(data);

  const topStripe = !hasBanner ? (
    <div style={{ height: "4px", background: config.colors.accent, width: "100%", flexShrink: 0 }} />
  ) : null;

  // Resolve sidebar colors (darkSidebar / accentSidebar overrides)
  let sbBg = config.colors.sidebarBg;
  let sbTx = config.colors.sidebarText;
  if (config.darkSidebar) { sbBg = "#1a1a2e"; sbTx = "#e0e0e0"; }
  else if (config.accentSidebar) { sbBg = config.colors.accent; sbTx = config.colors.headerText; }

  // ─── Height helpers ───
  const stripeH = hasBanner ? 0 : STRIPE_H;
  const contentH = PAGE_H - stripeH - HDR_H - FTR_H;

  // ─── LAYOUT 1 & 2: Single Column / Narrow Centered ───
  if (layout === "single-column" || layout === "narrow-centered") {
    const px = layout === "narrow-centered" ? "72px" : padX;
    // Count dividers
    let dc = 0;
    if (h.summary && h.skills) dc++;
    if (h.skills && h.experience) dc++;
    if (h.experience && h.achievements) dc++;
    const avail = contentH - dc * DIV_H;
    const [hSumm,hSkills,hExp,hAch,hEdu,hCert,hAddl,hRef,hDecl] = contentFitDist(data, config.density,
      [[h.summary,"summary",1],[h.skills,"skills",1.5],[h.experience,"experience",5],[h.achievements,"achievements",1.5],
       [h.education,"education",2],[h.certifications,"certifications",1],[h.additional,"additional",1],
       [h.referees,"referees",1.5],[h.declaration,"declaration",1]], avail);

    return (
      <div className="cv-template">
        <div style={pageBase}>
          {topStripe}
          <div style={{ height: `${HDR_H}px`, flexShrink: 0, overflow: "hidden" }}><HeaderBlock data={data} config={config} padX={px} /></div>
          <div style={{ height: `${contentH}px`, flexShrink: 0, padding: `0 ${px}`, overflow: "hidden", boxSizing: "border-box" }}>
            {h.summary && <SC h={hSumm}><SW config={config} idx={0}><SummaryBlock data={data} config={config} /></SW></SC>}
            {h.summary && h.skills && <SDivider config={config} />}
            {h.skills && <SC h={hSkills}><SW config={config} idx={1}><SkillsBlock data={data} config={config} inline /></SW></SC>}
            {h.skills && h.experience && <SDivider config={config} />}
            {h.experience && <SC h={hExp}><SW config={config} idx={2}><ExperienceBlock data={data} config={config} /></SW></SC>}
            {h.experience && h.achievements && <SDivider config={config} />}
            {h.achievements && <SC h={hAch}><SW config={config} idx={3}><AchievementsBlock data={data} config={config} /></SW></SC>}
            {h.education && <SC h={hEdu}><SW config={config} idx={4}><EducationBlock data={data} config={config} /></SW></SC>}
            {h.certifications && <SC h={hCert}><SW config={config} idx={5}><CertificationsBlock data={data} config={config} /></SW></SC>}
            {h.additional && <SC h={hAddl}><SW config={config} idx={6}><AdditionalInfoBlock data={data} config={config} /></SW></SC>}
            {h.referees && <SC h={hRef}><SW config={config} idx={7}><RefereesBlock data={data} config={config} /></SW></SC>}
            {h.declaration && <SC h={hDecl}><SW config={config} idx={8}><DeclarationBlock data={data} config={config} /></SW></SC>}
          </div>
          <div style={{ height: `${FTR_H}px`, flexShrink: 0, overflow: "hidden" }}><FooterBar config={config} data={data} /></div>
        </div>
      </div>
    );
  }

  // ─── LAYOUT 3, 4, 5: Two-Column Equal / Wide-Left / Wide-Right ───
  if (layout === "two-column-equal" || layout === "two-column-wide-left" || layout === "two-column-wide-right") {
    let lPct = "50%", rPct = "50%";
    if (layout === "two-column-wide-left") { lPct = "60%"; rPct = "40%"; }
    if (layout === "two-column-wide-right") { lPct = "40%"; rPct = "60%"; }
    const divLine = config.columnDivider ? { borderRight: `1px solid ${config.colors.border}`, paddingRight: "8px" } : {};

    // Summary takes a content-proportional portion, then columns fill the rest
    const summDivH = h.summary ? DIV_H : 0;
    const [summH] = contentFitDist(data, config.density,
      [[h.summary, "summary", 1], [true, "experience", 8]], contentH - summDivH);
    const colsH = contentH - (h.summary ? summH : 0) - summDivH;

    // Left/right column section heights — content-proportional
    const [lExp, lAch, lEdu] = contentFitDist(data, config.density,
      [[h.experience, "experience", 4], [h.achievements, "achievements", 1.5], [h.education, "education", 2]], colsH);
    const [rSkills, rCert, rAddl, rRef, rDecl] = contentFitDist(data, config.density,
      [[h.skills, "skills", 1.5], [h.certifications, "certifications", 1], [h.additional, "additional", 1],
       [h.referees, "referees", 1.5], [h.declaration, "declaration", 1]], colsH);

    return (
      <div className="cv-template">
        <div style={pageBase}>
          {topStripe}
          <div style={{ height: `${HDR_H}px`, flexShrink: 0, overflow: "hidden" }}><HeaderBlock data={data} config={config} padX={padX} /></div>
          <div style={{ height: `${contentH}px`, flexShrink: 0, padding: `0 ${padX}`, overflow: "hidden", boxSizing: "border-box" }}>
            {h.summary && <SC h={summH}><SW config={config} idx={0}><SummaryBlock data={data} config={config} /></SW></SC>}
            {h.summary && <SDivider config={config} />}
            <div style={{ display: "flex", gap: "16px", height: `${colsH}px`, overflow: "hidden" }}>
              <div style={{ width: lPct, height: "100%", overflow: "hidden", ...divLine }}>
                {h.experience && <SC h={lExp}><SW config={config} idx={1}><ExperienceBlock data={data} config={config} /></SW></SC>}
                {h.achievements && <SC h={lAch}><SW config={config} idx={2}><AchievementsBlock data={data} config={config} /></SW></SC>}
                {h.education && <SC h={lEdu}><SW config={config} idx={3}><EducationBlock data={data} config={config} /></SW></SC>}
              </div>
              <div style={{ width: rPct, height: "100%", overflow: "hidden" }}>
                {h.skills && <SC h={rSkills}><SW config={config} idx={4}><SkillsBlock data={data} config={config} /></SW></SC>}
                {h.certifications && <SC h={rCert}><SW config={config} idx={5}><CertificationsBlock data={data} config={config} /></SW></SC>}
                {h.additional && <SC h={rAddl}><SW config={config} idx={6}><AdditionalInfoBlock data={data} config={config} /></SW></SC>}
                {h.referees && <SC h={rRef}><SW config={config} idx={7}><RefereesBlock data={data} config={config} /></SW></SC>}
                {h.declaration && <SC h={rDecl}><SW config={config} idx={8}><DeclarationBlock data={data} config={config} /></SW></SC>}
              </div>
            </div>
          </div>
          <div style={{ height: `${FTR_H}px`, flexShrink: 0, overflow: "hidden" }}><FooterBar config={config} data={data} /></div>
        </div>
      </div>
    );
  }

  // ─── LAYOUT 10: Three-Column ───
  if (layout === "three-column") {
    const summDivH = h.summary ? DIV_H : 0;
    const [summH] = contentFitDist(data, config.density,
      [[h.summary, "summary", 1], [true, "experience", 8]], contentH - summDivH);
    const colsH = contentH - (h.summary ? summH : 0) - summDivH;

    // Column section heights — content-proportional
    const [c1Exp] = contentFitDist(data, config.density, [[h.experience, "experience", 5]], colsH);
    const [c2Edu, c2Ach] = contentFitDist(data, config.density,
      [[h.education, "education", 2], [h.achievements, "achievements", 1.5]], colsH);
    const [c3Skills, c3Cert, c3Addl] = contentFitDist(data, config.density,
      [[h.skills, "skills", 1.5], [h.certifications, "certifications", 1], [h.additional, "additional", 1]], colsH);

    return (
      <div className="cv-template">
        <div style={pageBase}>
          {topStripe}
          <div style={{ height: `${HDR_H}px`, flexShrink: 0, overflow: "hidden" }}><HeaderBlock data={data} config={config} padX={padX} /></div>
          <div style={{ height: `${contentH}px`, flexShrink: 0, padding: `0 ${padX}`, overflow: "hidden", boxSizing: "border-box" }}>
            {h.summary && <SC h={summH}><SW config={config} idx={0}><SummaryBlock data={data} config={config} /></SW></SC>}
            {h.summary && <SDivider config={config} />}
            <div style={{ display: "flex", gap: "12px", height: `${colsH}px`, overflow: "hidden" }}>
              <div style={{ width: "38%", height: "100%", borderRight: `1px solid ${config.colors.border}`, paddingRight: "6px", overflow: "hidden" }}>
                {h.experience && <SC h={c1Exp}><SW config={config} idx={1}><ExperienceBlock data={data} config={config} /></SW></SC>}
              </div>
              <div style={{ width: "32%", height: "100%", borderRight: `1px solid ${config.colors.border}`, paddingRight: "6px", overflow: "hidden" }}>
                {h.education && <SC h={c2Edu}><SW config={config} idx={2}><EducationBlock data={data} config={config} /></SW></SC>}
                {h.achievements && <SC h={c2Ach}><SW config={config} idx={3}><AchievementsBlock data={data} config={config} /></SW></SC>}
              </div>
              <div style={{ width: "30%", height: "100%", overflow: "hidden" }}>
                {h.skills && <SC h={c3Skills}><SW config={config} idx={4}><SkillsBlock data={data} config={config} /></SW></SC>}
                {h.certifications && <SC h={c3Cert}><SW config={config} idx={5}><CertificationsBlock data={data} config={config} /></SW></SC>}
                {h.additional && <SC h={c3Addl}><SW config={config} idx={6}><AdditionalInfoBlock data={data} config={config} /></SW></SC>}
              </div>
            </div>
          </div>
          <div style={{ height: `${FTR_H}px`, flexShrink: 0, overflow: "hidden" }}><FooterBar config={config} data={data} /></div>
        </div>
      </div>
    );
  }

  // ─── LAYOUT 6-9: Sidebar layouts (left/right × standard/wide) ───
  const isLeft = layout === "sidebar-left" || layout === "sidebar-left-wide";
  let sbPct = config.sidebarWidthPercent;
  if (layout === "sidebar-left-wide" || layout === "sidebar-right-wide") sbPct = Math.max(sbPct, 40);
  const sidebarW = `${sbPct}%`;
  const mainW = `${100 - sbPct}%`;

  // Sidebar + main share the area below banner-header (if any) and above footer
  const panelH = PAGE_H - stripeH - (hasBanner ? HDR_H : 0) - FTR_H;
  // Sidebar sections available height (minus personal-info block if left sidebar)
  const sbInfoH = (!hasBanner && isLeft) ? SB_INFO_H : 0;
  let sbDivC = 0;
  if (h.skills && h.certifications) sbDivC++;
  if (h.certifications) sbDivC++;
  const sbSecAvail = panelH - sbInfoH - 28 - sbDivC * DIV_H;
  const [sbSkills, sbCert, sbAddl, sbRef, sbDecl] = contentFitDist(data, config.density,
    [[h.skills, "skills", 1.5], [h.certifications, "certifications", 1], [h.additional, "additional", 1],
     [h.referees, "referees", 1.5], [h.declaration, "declaration", 1]], sbSecAvail);

  // Main sections available height
  const mainHdrH = (!hasBanner && !isLeft) ? HDR_H : 0;
  let mainDivC = 0;
  if (h.summary && h.experience) mainDivC++;
  if (h.experience && h.achievements) mainDivC++;
  const mainSecAvail = panelH - mainHdrH - 30 - mainDivC * DIV_H;
  const [mSumm, mExp, mAch, mEdu] = contentFitDist(data, config.density,
    [[h.summary, "summary", 1], [h.experience, "experience", 5], [h.achievements, "achievements", 1.5],
     [h.education, "education", 2]], mainSecAvail);

  const sidebarDiv = (side: "left" | "right") => (
    <div style={{
      width: sidebarW, height: `${panelH}px`, background: sbBg, color: sbTx,
      padding: `${hasBanner ? "14px" : "0"} 14px 14px`, boxSizing: "border-box", overflow: "hidden",
    }}>
      {!hasBanner && side === "left" && (
        <div style={{ padding: "18px 0 12px" }}>
          {config.showPhoto && (
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: (config.darkSidebar || config.accentSidebar) ? "rgba(255,255,255,0.15)" : config.colors.accent + "22", border: `2px solid ${(config.darkSidebar || config.accentSidebar) ? "rgba(255,255,255,0.3)" : config.colors.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, color: (config.darkSidebar || config.accentSidebar) ? "#fff" : config.colors.accent, fontFamily: FONT_STACKS[config.font], marginBottom: "8px" }}>
              {data.personalInfo.fullName?.charAt(0) || "?"}
            </div>
          )}
          <h1 style={{ fontSize: "17px", fontWeight: 700, margin: 0, fontFamily: FONT_STACKS[config.font] }}>{data.personalInfo.fullName}</h1>
          {data.personalInfo.headline && <p style={{ fontSize: "9px", margin: "3px 0 0", opacity: 0.9, fontWeight: 600 }}>{data.personalInfo.headline}</p>}
          {data.personalInfo.tagline && <p style={{ fontSize: "8px", margin: "2px 0 0", opacity: 0.7, fontStyle: "italic" }}>{data.personalInfo.tagline}</p>}
          <div style={{ fontSize: "8px", marginTop: "10px", opacity: 0.85, lineHeight: "1.8" }}>
            {data.personalInfo.phone && <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><IconPhone c={sbTx} s={9} />{data.personalInfo.phone}</div>}
            {data.personalInfo.email && <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><IconMail c={sbTx} s={9} />{data.personalInfo.email}</div>}
            {data.personalInfo.location && <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><IconPin c={sbTx} s={9} />{data.personalInfo.location}</div>}
            {data.personalInfo.linkedin && <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><IconLinkedin c={sbTx} s={9} />{data.personalInfo.linkedin}</div>}
            {data.personalInfo.website && <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><IconGlobe c={sbTx} s={9} />{data.personalInfo.website}</div>}
          </div>
        </div>
      )}
      <div style={{ overflow: "hidden" }}>
        {h.skills && <SC h={sbSkills}><SW config={config} idx={0}><SkillsBlock data={data} config={config} /></SW></SC>}
        {h.skills && <SDivider config={config} />}
        {h.certifications && <SC h={sbCert}><SW config={config} idx={1}><CertificationsBlock data={data} config={config} /></SW></SC>}
        {h.certifications && <SDivider config={config} />}
        {h.additional && <SC h={sbAddl}><SW config={config} idx={2}><AdditionalInfoBlock data={data} config={config} /></SW></SC>}
        {h.referees && <SC h={sbRef}><SW config={config} idx={3}><RefereesBlock data={data} config={config} /></SW></SC>}
        {h.declaration && <SC h={sbDecl}><SW config={config} idx={4}><DeclarationBlock data={data} config={config} /></SW></SC>}
      </div>
    </div>
  );

  const mainDiv = (
    <div style={{
      width: mainW, height: `${panelH}px`,
      padding: `${hasBanner ? "14px" : "16px"} 20px 14px`,
      boxSizing: "border-box", overflow: "hidden",
    }}>
      {!hasBanner && !isLeft && <HeaderBlock data={data} config={config} padX="0" />}
      <div style={{ overflow: "hidden" }}>
        {h.summary && <SC h={mSumm}><SW config={config} idx={0}><SummaryBlock data={data} config={config} /></SW></SC>}
        {h.summary && <SDivider config={config} />}
        {h.experience && <SC h={mExp}><SW config={config} idx={1}><ExperienceBlock data={data} config={config} /></SW></SC>}
        {h.experience && <SDivider config={config} />}
        {h.achievements && <SC h={mAch}><SW config={config} idx={2}><AchievementsBlock data={data} config={config} /></SW></SC>}
        {h.education && <SC h={mEdu}><SW config={config} idx={3}><EducationBlock data={data} config={config} /></SW></SC>}
      </div>
    </div>
  );

  return (
    <div className="cv-template">
      <div style={pageBase}>
        {topStripe}
        {hasBanner && <div style={{ height: `${HDR_H}px`, flexShrink: 0, overflow: "hidden" }}><HeaderBlock data={data} config={config} padX="24px" /></div>}
        <div style={{ display: "flex", height: `${panelH}px`, flexShrink: 0, overflow: "hidden" }}>
          {isLeft ? <>{sidebarDiv("left")}{mainDiv}</> : <>{mainDiv}{sidebarDiv("right")}</>}
        </div>
        <div style={{ height: `${FTR_H}px`, flexShrink: 0, overflow: "hidden" }}><FooterBar config={config} data={data} /></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TWO-PAGE CONFIG RENDERER
// Renders 2 A4 pages using the SAME section blocks as the 1-page renderer.
// Page 1: Header + Summary + Skills + Experience
// Page 2: Mini header + Achievements + Education + Certs + Additional + Referees + Declaration
// ═══════════════════════════════════════════════════════════════════════

// Mini header for page 2 — just name + headline, much smaller than page 1
function MiniHeader({ data, config }: { data: CVTemplateData; config: TemplateConfig }) {
  const pi = data.personalInfo;
  const ff = FONT_STACKS[config.font];
  const hasBanner = config.headerStyle === "banner";
  if (hasBanner) {
    return (
      <div style={{ background: config.colors.headerBg, color: config.colors.headerText, padding: "8px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: ff }}>{pi.fullName}</span>
          {pi.headline && <span style={{ fontSize: "9px", opacity: 0.85 }}>{pi.headline}</span>}
        </div>
        <span style={{ fontSize: "8px", opacity: 0.7, fontStyle: "italic" }}>Page 2</span>
      </div>
    );
  }
  return (
    <div style={{ padding: "8px 24px", borderBottom: `2px solid ${config.colors.accent}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: ff, color: config.colors.accent }}>{pi.fullName}</span>
        {pi.headline && <span style={{ fontSize: "9px", color: config.colors.mutedText }}>{pi.headline}</span>}
      </div>
      <span style={{ fontSize: "8px", color: config.colors.mutedText, fontStyle: "italic" }}>Page 2</span>
    </div>
  );
}

// Height constants for 2-page layout
const MINI_HDR_H = 40; // Mini header on page 2

export function TwoPageConfigRenderer({ data, config }: Props) {
  const d = DENSITY[config.density];
  const hasBanner = config.headerStyle === "banner";
  const pad = d.page.split(" ");
  const padX = pad[1] || pad[0] || "32px";
  const layout = config.layout;
  const h = hasData(data);

  const stripeH = hasBanner ? 0 : STRIPE_H;

  // Content area heights (between header/mini-header and footer)
  const p1ContentH = PAGE_H - stripeH - HDR_H - FTR_H;
  const p2ContentH = PAGE_H - stripeH - MINI_HDR_H - FTR_H;

  const pageBase: React.CSSProperties = {
    width: "794px",
    height: `${PAGE_H}px`,
    overflow: "hidden",
    background: "#fff",
    fontFamily: FONT_STACKS[config.font],
    fontSize: d.fontSize,
    lineHeight: d.lineHeight,
    color: config.colors.bodyText,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column" as const,
  };

  const topStripe = !hasBanner ? (
    <div style={{ height: `${STRIPE_H}px`, background: config.colors.accent, width: "100%", flexShrink: 0 }} />
  ) : null;

  // Sidebar colors
  let sbBg = config.colors.sidebarBg;
  let sbTx = config.colors.sidebarText;
  if (config.darkSidebar) { sbBg = "#1a1a2e"; sbTx = "#e0e0e0"; }
  else if (config.accentSidebar) { sbBg = config.colors.accent; sbTx = config.colors.headerText; }

  // ════════════════════════════════════════
  // NON-SIDEBAR LAYOUTS
  // ════════════════════════════════════════
  if (layout === "single-column" || layout === "narrow-centered" ||
      layout === "two-column-equal" || layout === "two-column-wide-left" || layout === "two-column-wide-right" ||
      layout === "three-column") {

    const px = layout === "narrow-centered" ? "72px" : padX;
    const _padPx = parseInt(px) || 32; // kept for reference

    // Page 1 dividers
    const p1DivCnt = (h.summary && h.skills ? 1 : 0) + (h.skills && h.experience ? 1 : 0);
    const p1SecAvail = p1ContentH - p1DivCnt * DIV_H;
    const [p1hSumm, p1hSkills, p1hExp] = contentFitDist(data, config.density,
      [[h.summary, "summary", 1.5], [h.skills, "skills", 1.5], [h.experience, "experience", 5]], p1SecAvail);

    // Page 2 dividers
    const p2DivCnt = (h.achievements && h.education ? 1 : 0) + (h.education && h.certifications ? 1 : 0);
    const p2SecAvail = p2ContentH - p2DivCnt * DIV_H;
    const [p2hAch, p2hEdu, p2hCert, p2hAddl, p2hRef, p2hDecl] = contentFitDist(data, config.density,
      [[h.achievements, "achievements", 2], [h.education, "education", 2.5], [h.certifications, "certifications", 1.5],
       [h.additional, "additional", 1.5], [h.referees, "referees", 2], [h.declaration, "declaration", 1]], p2SecAvail);

    // ─── Two-column sub-layouts ───
    if (layout === "two-column-equal" || layout === "two-column-wide-left" || layout === "two-column-wide-right" || layout === "three-column") {
      let lPct = "50%", rPct = "50%";
      if (layout === "two-column-wide-left") { lPct = "60%"; rPct = "40%"; }
      if (layout === "two-column-wide-right" || layout === "three-column") { lPct = "45%"; rPct = "55%"; }
      const divLine = config.columnDivider || layout === "three-column" ? { borderRight: `1px solid ${config.colors.border}`, paddingRight: "8px" } : {};

      // Page 1: summary at top, then 2 cols (experience | skills)
      const summH = p1hSumm;
      const summDivH = h.summary ? DIV_H : 0;
      const p1ColsH = p1ContentH - summH - summDivH;

      // Page 2: 2 cols for all sections — content-proportional
      const [p2lAch, p2lEdu] = contentFitDist(data, config.density,
        [[h.achievements, "achievements", 2], [h.education, "education", 2.5]], p2ContentH);
      const [p2rCert, p2rAddl, p2rRef, p2rDecl] = contentFitDist(data, config.density,
        [[h.certifications, "certifications", 1.5], [h.additional, "additional", 1.5],
         [h.referees, "referees", 2], [h.declaration, "declaration", 1]], p2ContentH);

      return (
        <div className="cv-template">
          {/* PAGE 1 */}
          <div style={pageBase}>
            {topStripe}
            <div style={{ height: `${HDR_H}px`, flexShrink: 0, overflow: "hidden" }}><HeaderBlock data={data} config={config} padX={padX} /></div>
            <div style={{ height: `${p1ContentH}px`, flexShrink: 0, padding: `0 ${padX}`, overflow: "hidden", boxSizing: "border-box" }}>
              {h.summary && <SC h={summH}><SW config={config} idx={0}><SummaryBlock data={data} config={config} /></SW></SC>}
              {h.summary && <SDivider config={config} />}
              <div style={{ display: "flex", gap: "16px", height: `${p1ColsH}px`, overflow: "hidden" }}>
                <div style={{ width: lPct, height: "100%", overflow: "hidden", ...divLine }}>
                  {h.experience && <SC h={p1ColsH}><SW config={config} idx={1}><ExperienceBlock data={data} config={config} /></SW></SC>}
                </div>
                <div style={{ width: rPct, height: "100%", overflow: "hidden" }}>
                  {h.skills && <SC h={p1ColsH}><SW config={config} idx={2}><SkillsBlock data={data} config={config} /></SW></SC>}
                </div>
              </div>
            </div>
            <div style={{ height: `${FTR_H}px`, flexShrink: 0, overflow: "hidden" }}><FooterBar config={config} data={data} /></div>
          </div>
          {/* PAGE 2 */}
          <div style={pageBase}>
            {topStripe}
            <div style={{ height: `${MINI_HDR_H}px`, flexShrink: 0, overflow: "hidden" }}><MiniHeader data={data} config={config} /></div>
            <div style={{ height: `${p2ContentH}px`, flexShrink: 0, padding: `0 ${padX}`, overflow: "hidden", boxSizing: "border-box" }}>
              <div style={{ display: "flex", gap: "16px", height: `${p2ContentH}px`, overflow: "hidden" }}>
                <div style={{ width: lPct, height: "100%", overflow: "hidden", ...divLine }}>
                  {h.achievements && <SC h={p2lAch}><SW config={config} idx={0}><AchievementsBlock data={data} config={config} /></SW></SC>}
                  {h.education && <SC h={p2lEdu}><SW config={config} idx={1}><EducationBlock data={data} config={config} /></SW></SC>}
                </div>
                <div style={{ width: rPct, height: "100%", overflow: "hidden" }}>
                  {h.certifications && <SC h={p2rCert}><SW config={config} idx={2}><CertificationsBlock data={data} config={config} /></SW></SC>}
                  {h.additional && <SC h={p2rAddl}><SW config={config} idx={3}><AdditionalInfoBlock data={data} config={config} /></SW></SC>}
                  {h.referees && <SC h={p2rRef}><SW config={config} idx={4}><RefereesBlock data={data} config={config} /></SW></SC>}
                  {h.declaration && <SC h={p2rDecl}><SW config={config} idx={5}><DeclarationBlock data={data} config={config} /></SW></SC>}
                </div>
              </div>
            </div>
            <div style={{ height: `${FTR_H}px`, flexShrink: 0, overflow: "hidden" }}><FooterBar config={config} data={data} /></div>
          </div>
        </div>
      );
    }

    // ─── Single-column / narrow-centered ───
    return (
      <div className="cv-template">
        {/* PAGE 1 */}
        <div style={pageBase}>
          {topStripe}
          <div style={{ height: `${HDR_H}px`, flexShrink: 0, overflow: "hidden" }}><HeaderBlock data={data} config={config} padX={px} /></div>
          <div style={{ height: `${p1ContentH}px`, flexShrink: 0, padding: `0 ${px}`, overflow: "hidden", boxSizing: "border-box" }}>
            {h.summary && <SC h={p1hSumm}><SW config={config} idx={0}><SummaryBlock data={data} config={config} /></SW></SC>}
            {h.summary && h.skills && <SDivider config={config} />}
            {h.skills && <SC h={p1hSkills}><SW config={config} idx={1}><SkillsBlock data={data} config={config} inline /></SW></SC>}
            {h.skills && h.experience && <SDivider config={config} />}
            {h.experience && <SC h={p1hExp}><SW config={config} idx={2}><ExperienceBlock data={data} config={config} /></SW></SC>}
          </div>
          <div style={{ height: `${FTR_H}px`, flexShrink: 0, overflow: "hidden" }}><FooterBar config={config} data={data} /></div>
        </div>
        {/* PAGE 2 */}
        <div style={pageBase}>
          {topStripe}
          <div style={{ height: `${MINI_HDR_H}px`, flexShrink: 0, overflow: "hidden" }}><MiniHeader data={data} config={config} /></div>
          <div style={{ height: `${p2ContentH}px`, flexShrink: 0, padding: `0 ${px}`, overflow: "hidden", boxSizing: "border-box" }}>
            {h.achievements && <SC h={p2hAch}><SW config={config} idx={0}><AchievementsBlock data={data} config={config} /></SW></SC>}
            {h.achievements && h.education && <SDivider config={config} />}
            {h.education && <SC h={p2hEdu}><SW config={config} idx={1}><EducationBlock data={data} config={config} /></SW></SC>}
            {h.education && h.certifications && <SDivider config={config} />}
            {h.certifications && <SC h={p2hCert}><SW config={config} idx={2}><CertificationsBlock data={data} config={config} /></SW></SC>}
            {h.additional && <SC h={p2hAddl}><SW config={config} idx={3}><AdditionalInfoBlock data={data} config={config} /></SW></SC>}
            {h.referees && <SC h={p2hRef}><SW config={config} idx={4}><RefereesBlock data={data} config={config} /></SW></SC>}
            {h.declaration && <SC h={p2hDecl}><SW config={config} idx={5}><DeclarationBlock data={data} config={config} /></SW></SC>}
          </div>
          <div style={{ height: `${FTR_H}px`, flexShrink: 0, overflow: "hidden" }}><FooterBar config={config} data={data} /></div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // SIDEBAR LAYOUTS (left/right × standard/wide)
  // Page 1: Sidebar (personal info + skills + certs) + Main (summary + experience)
  // Page 2: Sidebar (additional + referees + declaration) + Main (achievements + education)
  // ════════════════════════════════════════
  const isLeft = layout === "sidebar-left" || layout === "sidebar-left-wide";
  let sbPct = config.sidebarWidthPercent;
  if (layout === "sidebar-left-wide" || layout === "sidebar-right-wide") sbPct = Math.max(sbPct, 40);
  const sidebarW = `${sbPct}%`;
  const mainW = `${100 - sbPct}%`;

  // Panel heights (the flex row between header and footer)
  const p1PanelH = PAGE_H - stripeH - (hasBanner ? HDR_H : 0) - FTR_H;
  const p2PanelH = PAGE_H - stripeH - MINI_HDR_H - FTR_H;

  // Page 1 sidebar section heights
  const sbInfoH = (!hasBanner && isLeft) ? SB_INFO_H : 0;
  const p1SbPad = 28; // top+bottom padding inside sidebar
  const p1SbAvail = p1PanelH - sbInfoH - p1SbPad;
  const p1SbDivCnt = h.skills && h.certifications ? 1 : 0;
  const p1SbSecAvail = p1SbAvail - p1SbDivCnt * DIV_H;
  const [p1sbSkills, p1sbCerts] = contentFitDist(data, config.density,
    [[h.skills, "skills", 1.5], [h.certifications, "certifications", 1]], p1SbSecAvail);

  // Page 1 main section heights
  const p1MainHdrH = (!hasBanner && !isLeft) ? HDR_H : 0;
  const p1MainPad = 30; // top+bottom padding
  const p1MainDivCnt = h.summary && h.experience ? 1 : 0;
  const p1MainAvail = p1PanelH - p1MainHdrH - p1MainPad - p1MainDivCnt * DIV_H;
  const [p1mSumm, p1mExp] = contentFitDist(data, config.density,
    [[h.summary, "summary", 1.5], [h.experience, "experience", 5]], p1MainAvail);

  // Page 2 sidebar section heights
  const p2SbPad = 28;
  const p2SbAvail = p2PanelH - p2SbPad;
  const p2SbDivCnt = (h.additional && h.referees ? 1 : 0) + (h.referees && h.declaration ? 1 : 0);
  const p2SbSecAvail = p2SbAvail - p2SbDivCnt * DIV_H;
  const [p2sbAddl, p2sbRef, p2sbDecl] = contentFitDist(data, config.density,
    [[h.additional, "additional", 1.5], [h.referees, "referees", 2], [h.declaration, "declaration", 1]], p2SbSecAvail);

  // Page 2 main section heights
  const p2MainPad = 30;
  const p2MainDivCnt = h.achievements && h.education ? 1 : 0;
  const p2MainAvail = p2PanelH - p2MainPad - p2MainDivCnt * DIV_H;
  const [p2mAch, p2mEdu] = contentFitDist(data, config.density,
    [[h.achievements, "achievements", 2], [h.education, "education", 2.5]], p2MainAvail);

  const p1Sidebar = (side: "left" | "right") => (
    <div style={{
      width: sidebarW, height: `${p1PanelH}px`, background: sbBg, color: sbTx,
      padding: `${hasBanner ? "14px" : "0"} 14px 14px`, boxSizing: "border-box", overflow: "hidden",
    }}>
      {!hasBanner && side === "left" && (
        <div style={{ height: `${sbInfoH}px`, overflow: "hidden", padding: "18px 0 12px", boxSizing: "border-box" }}>
          {config.showPhoto && (
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: (config.darkSidebar || config.accentSidebar) ? "rgba(255,255,255,0.15)" : config.colors.accent + "22", border: `2px solid ${(config.darkSidebar || config.accentSidebar) ? "rgba(255,255,255,0.3)" : config.colors.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, color: (config.darkSidebar || config.accentSidebar) ? "#fff" : config.colors.accent, fontFamily: FONT_STACKS[config.font], marginBottom: "8px" }}>
              {data.personalInfo.fullName?.charAt(0) || "?"}
            </div>
          )}
          <h1 style={{ fontSize: "17px", fontWeight: 700, margin: 0, fontFamily: FONT_STACKS[config.font] }}>{data.personalInfo.fullName}</h1>
          {data.personalInfo.headline && <p style={{ fontSize: "9px", margin: "3px 0 0", opacity: 0.9, fontWeight: 600 }}>{data.personalInfo.headline}</p>}
          {data.personalInfo.tagline && <p style={{ fontSize: "8px", margin: "2px 0 0", opacity: 0.7, fontStyle: "italic" }}>{data.personalInfo.tagline}</p>}
          <div style={{ fontSize: "8px", marginTop: "10px", opacity: 0.85, lineHeight: "1.8" }}>
            {data.personalInfo.phone && <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><IconPhone c={sbTx} s={9} />{data.personalInfo.phone}</div>}
            {data.personalInfo.email && <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><IconMail c={sbTx} s={9} />{data.personalInfo.email}</div>}
            {data.personalInfo.location && <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><IconPin c={sbTx} s={9} />{data.personalInfo.location}</div>}
            {data.personalInfo.linkedin && <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><IconLinkedin c={sbTx} s={9} />{data.personalInfo.linkedin}</div>}
            {data.personalInfo.website && <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><IconGlobe c={sbTx} s={9} />{data.personalInfo.website}</div>}
          </div>
        </div>
      )}
      <div style={{ height: `${p1SbAvail}px`, overflow: "hidden" }}>
        {h.skills && <SC h={p1sbSkills}><SW config={config} idx={0}><SkillsBlock data={data} config={config} /></SW></SC>}
        {h.skills && h.certifications && <SDivider config={config} />}
        {h.certifications && <SC h={p1sbCerts}><SW config={config} idx={1}><CertificationsBlock data={data} config={config} /></SW></SC>}
      </div>
    </div>
  );

  const p1Main = (
    <div style={{
      width: mainW, height: `${p1PanelH}px`,
      padding: `${hasBanner ? "14px" : "16px"} 20px 14px`,
      boxSizing: "border-box", overflow: "hidden",
    }}>
      {!hasBanner && !isLeft && <div style={{ height: `${p1MainHdrH}px`, overflow: "hidden" }}><HeaderBlock data={data} config={config} padX="0" /></div>}
      <div style={{ height: `${p1MainAvail + p1MainDivCnt * DIV_H}px`, overflow: "hidden" }}>
        {h.summary && <SC h={p1mSumm}><SW config={config} idx={0}><SummaryBlock data={data} config={config} /></SW></SC>}
        {h.summary && h.experience && <SDivider config={config} />}
        {h.experience && <SC h={p1mExp}><SW config={config} idx={1}><ExperienceBlock data={data} config={config} /></SW></SC>}
      </div>
    </div>
  );

  const p2Sidebar = () => (
    <div style={{
      width: sidebarW, height: `${p2PanelH}px`, background: sbBg, color: sbTx,
      padding: "14px", boxSizing: "border-box", overflow: "hidden",
    }}>
      <div style={{ height: `${p2SbAvail}px`, overflow: "hidden" }}>
        {h.additional && <SC h={p2sbAddl}><SW config={config} idx={0}><AdditionalInfoBlock data={data} config={config} /></SW></SC>}
        {h.additional && h.referees && <SDivider config={config} />}
        {h.referees && <SC h={p2sbRef}><SW config={config} idx={1}><RefereesBlock data={data} config={config} /></SW></SC>}
        {h.referees && h.declaration && <SDivider config={config} />}
        {h.declaration && <SC h={p2sbDecl}><SW config={config} idx={2}><DeclarationBlock data={data} config={config} /></SW></SC>}
      </div>
    </div>
  );

  const p2Main = (
    <div style={{
      width: mainW, height: `${p2PanelH}px`,
      padding: "14px 20px",
      boxSizing: "border-box", overflow: "hidden",
    }}>
      <div style={{ height: `${p2MainAvail + p2MainDivCnt * DIV_H}px`, overflow: "hidden" }}>
        {h.achievements && <SC h={p2mAch}><SW config={config} idx={0}><AchievementsBlock data={data} config={config} /></SW></SC>}
        {h.achievements && h.education && <SDivider config={config} />}
        {h.education && <SC h={p2mEdu}><SW config={config} idx={1}><EducationBlock data={data} config={config} /></SW></SC>}
      </div>
    </div>
  );

  return (
    <div className="cv-template">
      {/* PAGE 1 */}
      <div style={pageBase}>
        {topStripe}
        {hasBanner && <div style={{ height: `${HDR_H}px`, flexShrink: 0, overflow: "hidden" }}><HeaderBlock data={data} config={config} padX="24px" /></div>}
        <div style={{ display: "flex", height: `${p1PanelH}px`, flexShrink: 0, overflow: "hidden" }}>
          {isLeft ? <>{p1Sidebar("left")}{p1Main}</> : <>{p1Main}{p1Sidebar("right")}</>}
        </div>
        <div style={{ height: `${FTR_H}px`, flexShrink: 0, overflow: "hidden" }}><FooterBar config={config} data={data} /></div>
      </div>
      {/* PAGE 2 */}
      <div style={pageBase}>
        {topStripe}
        <div style={{ height: `${MINI_HDR_H}px`, flexShrink: 0, overflow: "hidden" }}><MiniHeader data={data} config={config} /></div>
        <div style={{ display: "flex", height: `${p2PanelH}px`, flexShrink: 0, overflow: "hidden" }}>
          {isLeft ? <>{p2Sidebar()}{p2Main}</> : <>{p2Main}{p2Sidebar()}</>}
        </div>
        <div style={{ height: `${FTR_H}px`, flexShrink: 0, overflow: "hidden" }}><FooterBar config={config} data={data} /></div>
      </div>
    </div>
  );
}
