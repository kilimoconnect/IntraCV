import React from "react";

const W = 794;
const H = 1123;
const SIDE_W = 232;
const ACCENT_X = SIDE_W;
const ACCENT_W = 2;
const BODY_X = SIDE_W + ACCENT_W;
const BODY_W = W - BODY_X;
const PAD = 20;
const FONT = "'Inter', 'Segoe UI', sans-serif";

type ThemeName =
  | "corporate"
  | "ocean"
  | "forest"
  | "sunset"
  | "monochrome"
  | "royal"
  | "cherry"
  | "emerald"
  | "lavender"
  | "amber";

type ThemeColors = {
  sidebarBg: string;
  accent: string;
  headerBg: string;
  headerText: string;
  heading: string;
  text: string;
  muted: string;
  sub: string;
  divider: string;
  pillBg: string;
  pillBorder: string;
  cardBg: string;
  barBg: string;
};

const themes: Record<ThemeName, ThemeColors> = {
  corporate: {
    sidebarBg: "#F8FAFC",
    accent: "#4F46E5",
    headerBg: "#1E293B",
    headerText: "#FFFFFF",
    heading: "#4F46E5",
    text: "#1E293B",
    muted: "#64748B",
    sub: "#94A3B8",
    divider: "#E2E8F0",
    pillBg: "#EEF2FF",
    pillBorder: "#C7D2FE",
    cardBg: "#FAFBFF",
    barBg: "#E2E8F0",
  },
  ocean: {
    sidebarBg: "#F0F9FF",
    accent: "#0EA5E9",
    headerBg: "#0C4A6E",
    headerText: "#FFFFFF",
    heading: "#0EA5E9",
    text: "#0F172A",
    muted: "#64748B",
    sub: "#94A3B8",
    divider: "#BAE6FD",
    pillBg: "#E0F2FE",
    pillBorder: "#7DD3FC",
    cardBg: "#F0F9FF",
    barBg: "#BAE6FD",
  },
  forest: {
    sidebarBg: "#F0FDF4",
    accent: "#16A34A",
    headerBg: "#14532D",
    headerText: "#FFFFFF",
    heading: "#16A34A",
    text: "#14532D",
    muted: "#6B7280",
    sub: "#9CA3AF",
    divider: "#D1FAE5",
    pillBg: "#DCFCE7",
    pillBorder: "#86EFAC",
    cardBg: "#F0FDF4",
    barBg: "#D1FAE5",
  },
  sunset: {
    sidebarBg: "#FFF7ED",
    accent: "#EA580C",
    headerBg: "#7C2D12",
    headerText: "#FFFFFF",
    heading: "#EA580C",
    text: "#451A03",
    muted: "#78716C",
    sub: "#A8A29E",
    divider: "#FED7AA",
    pillBg: "#FFEDD5",
    pillBorder: "#FDBA74",
    cardBg: "#FFF7ED",
    barBg: "#FED7AA",
  },
  monochrome: {
    sidebarBg: "#F9FAFB",
    accent: "#374151",
    headerBg: "#111827",
    headerText: "#FFFFFF",
    heading: "#374151",
    text: "#111827",
    muted: "#6B7280",
    sub: "#9CA3AF",
    divider: "#E5E7EB",
    pillBg: "#F3F4F6",
    pillBorder: "#D1D5DB",
    cardBg: "#F9FAFB",
    barBg: "#E5E7EB",
  },
  royal: {
    sidebarBg: "#F8F4FF",
    accent: "#7C3AED",
    headerBg: "#4C1D95",
    headerText: "#FFFFFF",
    heading: "#7C3AED",
    text: "#1F2937",
    muted: "#6B7280",
    sub: "#9CA3AF",
    divider: "#E9D5FF",
    pillBg: "#F3E8FF",
    pillBorder: "#D8B4FE",
    cardBg: "#FAF5FF",
    barBg: "#E9D5FF",
  },
  cherry: {
    sidebarBg: "#FFF1F2",
    accent: "#E11D48",
    headerBg: "#881337",
    headerText: "#FFFFFF",
    heading: "#E11D48",
    text: "#1F2937",
    muted: "#6B7280",
    sub: "#9CA3AF",
    divider: "#FECACA",
    pillBg: "#FEE2E2",
    pillBorder: "#FCA5A5",
    cardBg: "#FFF1F2",
    barBg: "#FECACA",
  },
  emerald: {
    sidebarBg: "#F0FDF4",
    accent: "#10B981",
    headerBg: "#047857",
    headerText: "#FFFFFF",
    heading: "#10B981",
    text: "#1F2937",
    muted: "#6B7280",
    sub: "#9CA3AF",
    divider: "#A7F3D0",
    pillBg: "#D1FAE5",
    pillBorder: "#6EE7B7",
    cardBg: "#F0FDF4",
    barBg: "#A7F3D0",
  },
  lavender: {
    sidebarBg: "#FAF5FF",
    accent: "#8B5CF6",
    headerBg: "#5B21B6",
    headerText: "#FFFFFF",
    heading: "#8B5CF6",
    text: "#1F2937",
    muted: "#6B7280",
    sub: "#9CA3AF",
    divider: "#DDD6FE",
    pillBg: "#EDE9FE",
    pillBorder: "#C4B5FD",
    cardBg: "#FAF5FF",
    barBg: "#DDD6FE",
  },
  amber: {
    sidebarBg: "#FFFBEB",
    accent: "#F59E0B",
    headerBg: "#92400E",
    headerText: "#FFFFFF",
    heading: "#F59E0B",
    text: "#1F2937",
    muted: "#6B7280",
    sub: "#9CA3AF",
    divider: "#FED7AA",
    pillBg: "#FEF3C7",
    pillBorder: "#FCD34D",
    cardBg: "#FFFBEB",
    barBg: "#FED7AA",
  },
};

type LanguageItem = {
  name: string;
  level: number;
  label: string;
};

type ExperienceItem = {
  role: string;
  company: string;
  dates: string;
  location?: string;
  bullets: string[];
};

type EducationItem = {
  degree: string;
  school: string;
  year: string;
  details?: string;
};

type CertificationItem = {
  name: string;
  issuer: string;
  year: string;
};

type AwardItem = {
  title: string;
  description?: string;
};

type ProjectItem = {
  name: string;
  description: string;
  tech?: string;
};

type ReferenceItem = {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
};

type BoardRoleItem = {
  title: string;
  organization: string;
  dates: string;
  description?: string;
};

type ExecutiveTrainingItem = {
  name: string;
  institution: string;
  year: string;
};

type PublicationItem = {
  title: string;
  publisher: string;
  year: string;
  type?: string;
};

type DeclarationItem = {
  declaration: string;
  place?: string;
  date?: string;
};

export interface CVData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  location: string;
  profile: string;
  tagline?: string;
  skills: string[];
  languages: LanguageItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  awards: AwardItem[];
  history: ExperienceItem[];
  projects: ProjectItem[];
  references: ReferenceItem[];
  tools?: string[];
  achievements?: string[];
  boardRoles?: BoardRoleItem[];
  executiveTraining?: ExecutiveTrainingItem[];
  publications?: PublicationItem[];
  declaration?: DeclarationItem;
}

export interface CVTemplateProps {
  data: CVData;
  theme?: ThemeName;
}

export type { ThemeName };

export const SLOT_RULES = {
  header: { fullNameMax: 25, taglineMaxChars: 100 },
  contact: { items: 5, maxChars: 26 },
  profile: { minChars: 380, maxChars: 440 },
  skills: { count: 24, maxLabelChars: 14 },
  experience: {
    roles: 2,
    role1Bullets: 9,
    role2Bullets: 8,
    maxRoleChars: 36,
    maxCompanyChars: 42,
    maxDatesChars: 22,
    bulletMinChars: 105,
    bulletMaxChars: 125,
  },
  education: {
    entries: 3,
    maxDegreeChars: 52,
    maxSchoolChars: 28,
  },
  certifications: {
    max: 7,
    maxNameChars: 52,
    maxIssuerChars: 30,
  },
  history: {
    roles: 3,
    bulletsPerRole: 3,
    maxRoleChars: 36,
    maxCompanyChars: 40,
    maxDatesChars: 20,
    maxBulletChars: 110,
  },
  projects: {
    count: 2,
    maxNameChars: 36,
    descMinChars: 210,
    descMaxChars: 240,
    maxTechChars: 65,
  },
  awards: { max: 5, maxTitleChars: 40, maxDescChars: 60 },
  languages: { max: 5, maxNameChars: 16, maxLabelChars: 14 },
  references: { count: 2, maxNameChars: 30, maxTitleChars: 32, maxCompanyChars: 32 },
  tools: { count: 12, maxLabelChars: 18 },
  achievements: { count: 6, minChars: 45, maxChars: 110 },
  boardRoles: {
    max: 4,
    maxTitleChars: 38,
    maxOrganizationChars: 34,
    maxDatesChars: 26,
    maxDescriptionChars: 140,
  },
  executiveTraining: {
    max: 5,
    maxNameChars: 44,
    maxInstitutionChars: 30,
  },
  publications: {
    max: 4,
    maxTitleChars: 60,
    maxPublisherChars: 34,
    maxTypeChars: 20,
  },
  declaration: { maxChars: 220 },
} as const;

const abs = (left: number, top: number, width: number, height: number): React.CSSProperties => ({
  position: "absolute",
  left,
  top,
  width,
  height,
  overflow: "hidden",
});

const pos = (left: number, top: number, width: number): React.CSSProperties => ({
  position: "absolute",
  left,
  top,
  width,
});

function SectionTitle({
  children,
  top,
  left,
  width,
  colors,
}: {
  children: React.ReactNode;
  top: number;
  left: number;
  width: number;
  colors: ThemeColors;
}) {
  const sidebar = left < BODY_X;

  return (
    <div
      style={{
        ...abs(left, top, width, 24),
        fontFamily: FONT,
        fontSize: sidebar ? "9pt" : "11pt",
        fontWeight: 700,
        color: colors.heading,
        textTransform: "uppercase",
        letterSpacing: "1.2px",
        borderBottom: `2px solid ${sidebar ? colors.divider : colors.accent}`,
        lineHeight: "22px",
      }}
    >
      {children}
    </div>
  );
}

function PageNumber({ page, colors }: { page: number; colors: ThemeColors }) {
  return (
    <div style={abs(PAD + 50, H - 8, 100, 20)}>
      <div style={{ fontSize: "7pt", color: colors.sub, lineHeight: "20px" }}>
        Page {page}
      </div>
    </div>
  );
}

function PageFrame({
  children,
  colors,
  header,
}: {
  children: React.ReactNode;
  colors: ThemeColors;
  header?: boolean;
}) {
  return (
    <div
      className="cv-page-sheet"
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        background: "#FFFFFF",
        fontFamily: FONT,
        color: colors.text,
      }}
    >
      <div style={abs(0, 0, SIDE_W, H)}>
        <div style={{ width: "100%", height: "100%", background: colors.sidebarBg }} />
      </div>
      {header ? (
        <>
          <div style={abs(0, 0, W, 140)}>
            <div style={{ width: "100%", height: "100%", background: colors.headerBg }} />
          </div>
          <div style={abs(ACCENT_X, 140, ACCENT_W, H - 140)}>
            <div style={{ width: "100%", height: "100%", background: colors.accent }} />
          </div>
        </>
      ) : (
        <div style={abs(ACCENT_X, 0, ACCENT_W, H)}>
          <div style={{ width: "100%", height: "100%", background: colors.accent }} />
        </div>
      )}
      {children}
    </div>
  );
}

function BulletList({
  items,
  colors,
  fontSize = "8.5pt",
  lineHeight = "17px",
}: {
  items: string[];
  colors: ThemeColors;
  fontSize?: string;
  lineHeight?: string;
}) {
  return (
    <>
      {items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          style={{
            display: "flex",
            fontSize,
            lineHeight,
            marginBottom: 5,
          }}
        >
          <span
            style={{
              color: colors.accent,
              fontSize: "5pt",
              marginRight: 8,
              marginTop: 4,
              flexShrink: 0,
            }}
          >
            ●
          </span>
          <span>{item}</span>
        </div>
      ))}
    </>
  );
}

function ContactBlock({
  data,
  colors,
  top,
}: {
  data: CVData;
  colors: ThemeColors;
  top: number;
}) {
  const sideInner = SIDE_W - PAD * 2;

  const contactItems = [
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone },
    { label: "Location", value: data.location },
    { label: "LinkedIn", value: data.linkedin },
    { label: "Website", value: data.website },
  ].filter((item) => item.value);

  return (
    <>
      <SectionTitle top={top} left={PAD} width={sideInner} colors={colors}>
        Contact
      </SectionTitle>
      <div style={{ ...pos(PAD, top + 30, sideInner) }}>
        {contactItems.map((item) => (
          <div key={item.label} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: "7pt", color: colors.muted, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              {item.label}
            </div>
            <div style={{ fontSize: "8pt", color: colors.text, wordBreak: "break-word" }}>{item.value}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function Page1({ data, theme }: { data: CVData; theme: ThemeName }) {
  const colors = themes[theme];
  const sideInner = SIDE_W - PAD * 2;
  const bodyInner = BODY_W - PAD * 2;

  return (
    <>
      <PageFrame colors={colors} header>
        <div style={pos(PAD, 36, W - PAD * 2)}>
          <div style={{ fontSize: "30pt", fontWeight: 800, color: colors.headerText, lineHeight: 1.1 }}>
            {data.fullName}
          </div>
          <div style={{ fontSize: "13pt", fontWeight: 400, color: colors.sub, letterSpacing: "0.4px", marginTop: 8 }}>
            {data.title}
          </div>
          {data.tagline ? (
            <div
              style={{
                fontSize: "10pt",
                fontWeight: 500,
                color: colors.headerText,
                opacity: 0.85,
                marginTop: 4,
                lineHeight: 1.3,
              }}
            >
              {data.tagline}
            </div>
          ) : null}
        </div>

        <ContactBlock data={data} colors={colors} top={160} />

        <SectionTitle top={360} left={PAD} width={sideInner} colors={colors}>
          Core Skills
        </SectionTitle>
        <div style={{ ...pos(PAD, 390, sideInner) }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {data.skills.map((skill, index) => (
              <div
                key={`${skill}-${index}`}
                style={{
                  background: colors.pillBg,
                  border: `1px solid ${colors.pillBorder}`,
                  borderRadius: 4,
                  fontSize: "7.5pt",
                  padding: "3px 4px",
                  textAlign: "center",
                  color: colors.accent,
                  fontWeight: 600,
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        <SectionTitle top={790} left={PAD} width={sideInner} colors={colors}>
          Languages
        </SectionTitle>
        <div style={{ ...pos(PAD, 820, sideInner) }}>
          {data.languages.slice(0, 5).map((language) => (
            <div key={language.name} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "8.5pt", fontWeight: 600 }}>{language.name}</span>
                <span style={{ fontSize: "7.5pt", color: colors.muted }}>{language.label}</span>
              </div>
              <div style={{ height: 6, background: colors.barBg, borderRadius: 3, marginTop: 4 }}>
                <div
                  style={{
                    width: `${Math.max(0, Math.min(100, language.level))}%`,
                    height: "100%",
                    background: colors.accent,
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <SectionTitle top={160} left={BODY_X + PAD} width={bodyInner} colors={colors}>
          Executive Profile
        </SectionTitle>
        <div
          style={{
            ...pos(BODY_X + PAD, 190, bodyInner),
            fontSize: "9pt",
            lineHeight: "20px",
            textAlign: "justify",
          }}
        >
          {data.profile}
        </div>

        <SectionTitle top={326} left={BODY_X + PAD} width={bodyInner} colors={colors}>
          Professional Experience
        </SectionTitle>
        <div style={abs(BODY_X + PAD, 356, bodyInner, 730)}>
          {data.experience.map((experience, index) => (
            <div key={`${experience.role}-${index}`} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 700, fontSize: "10.5pt", color: colors.text }}>{experience.role}</div>
                <div style={{ fontSize: "8pt", color: colors.muted, whiteSpace: "nowrap", marginLeft: 8 }}>
                  {experience.dates}
                </div>
              </div>
              <div style={{ fontSize: "9pt", color: colors.accent, fontWeight: 600, marginBottom: 6 }}>
                {experience.company}
                {experience.location ? ` - ${experience.location}` : ""}
              </div>
              <BulletList
                items={experience.bullets.slice(
                  0,
                  index === 0 ? SLOT_RULES.experience.role1Bullets : SLOT_RULES.experience.role2Bullets
                )}
                colors={colors}
                fontSize="8pt"
                lineHeight="16px"
              />
            </div>
          ))}
        </div>
      </PageFrame>
      <PageNumber page={1} colors={colors} />
    </>
  );
}

function Page2({ data, theme }: { data: CVData; theme: ThemeName }) {
  const colors = themes[theme];
  const sideInner = SIDE_W - PAD * 2;
  const bodyInner = BODY_W - PAD * 2;
  const history = data.history.length > 0 ? data.history : data.experience.slice(2);

  return (
    <>
      <PageFrame colors={colors}>
        <SectionTitle top={20} left={PAD} width={sideInner} colors={colors}>
          Education
        </SectionTitle>
        <div style={{ ...pos(PAD, 50, sideInner) }}>
          {data.education.slice(0, 3).map((education, index) => (
            <div key={`${education.degree}-${index}`} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "9pt", fontWeight: 700 }}>{education.degree}</div>
              <div style={{ fontSize: "8.5pt", color: colors.accent, fontWeight: 600 }}>{education.school}</div>
              <div style={{ fontSize: "7.5pt", color: colors.muted }}>{education.year}</div>
              {education.details ? (
                <div style={{ fontSize: "7.5pt", color: colors.text, marginTop: 2, lineHeight: "13px" }}>
                  {education.details}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {data.certifications.length > 0 ? (
          <>
            <SectionTitle top={260} left={PAD} width={sideInner} colors={colors}>
              Certifications
            </SectionTitle>
            <div style={{ ...pos(PAD, 290, sideInner) }}>
              {data.certifications.slice(0, 7).map((certification, index) => (
                <div key={`${certification.name}-${index}`} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: "8.5pt", fontWeight: 600 }}>{certification.name}</div>
                  <div style={{ fontSize: "7.5pt", color: colors.muted }}>
                    {certification.issuer}
                    {certification.year ? ` - ${certification.year}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {data.awards.length > 0 ? (
          <>
            <SectionTitle top={580} left={PAD} width={sideInner} colors={colors}>
              Awards
            </SectionTitle>
            <div style={{ ...pos(PAD, 610, sideInner) }}>
              {data.awards.slice(0, 5).map((award, index) => (
                <div key={`${award.title}-${index}`} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: "8.5pt", fontWeight: 700 }}>{award.title}</div>
                  {award.description ? (
                    <div style={{ fontSize: "7.5pt", color: colors.muted, marginTop: 2, lineHeight: "13px" }}>
                      {award.description}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : null}

        <SectionTitle top={20} left={BODY_X + PAD} width={bodyInner} colors={colors}>
          Career History
        </SectionTitle>
        <div style={{ ...pos(BODY_X + PAD, 50, bodyInner) }}>
          {history.map((experience, index) => (
            <div key={`${experience.role}-${index}`} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 700, fontSize: "9.5pt" }}>{experience.role}</div>
                <div style={{ fontSize: "8pt", color: colors.muted, whiteSpace: "nowrap", marginLeft: 8 }}>
                  {experience.dates}
                </div>
              </div>
              <div style={{ fontSize: "8.5pt", color: colors.accent, fontWeight: 600, marginBottom: 2 }}>
                {experience.company}
                {experience.location ? ` - ${experience.location}` : ""}
              </div>
              <BulletList items={experience.bullets} colors={colors} fontSize="8pt" lineHeight="15px" />
            </div>
          ))}
        </div>

        {data.projects.length > 0 ? (
          <>
            <SectionTitle top={520} left={BODY_X + PAD} width={bodyInner} colors={colors}>
              Project Portfolio
            </SectionTitle>
            <div style={{ ...pos(BODY_X + PAD, 550, bodyInner) }}>
              {data.projects.slice(0, 2).map((project, index) => (
                <div
                  key={`${project.name}-${index}`}
                  style={{
                    background: colors.cardBg,
                    border: `1px solid ${colors.divider}`,
                    borderLeft: `3px solid ${colors.accent}`,
                    borderRadius: 4,
                    padding: "8px 10px",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "9.5pt", marginBottom: 4 }}>{project.name}</div>
                  <div style={{ fontSize: "8pt", lineHeight: 1.5, marginBottom: 4 }}>{project.description}</div>
                  {project.tech ? (
                    <div style={{ fontSize: "7.5pt", color: colors.accent, fontWeight: 600 }}>
                      Tech: {project.tech}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </PageFrame>
      <PageNumber page={2} colors={colors} />
    </>
  );
}

function Page3({ data, theme }: { data: CVData; theme: ThemeName }) {
  const colors = themes[theme];
  const sideInner = SIDE_W - PAD * 2;
  const bodyInner = BODY_W - PAD * 2;
  const achievements =
    data.achievements && data.achievements.length > 0
      ? data.achievements
      : data.awards.map((award) => award.title);

  return (
    <>
      <PageFrame colors={colors}>
        {data.tools && data.tools.length > 0 ? (
          <>
            <SectionTitle top={20} left={PAD} width={sideInner} colors={colors}>
              Tools
            </SectionTitle>
            <div style={{ ...pos(PAD, 50, sideInner) }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {data.tools.map((tool, index) => (
                  <span
                    key={`${tool}-${index}`}
                    style={{
                      display: "inline-block",
                      background: colors.pillBg,
                      color: colors.accent,
                      border: `1px solid ${colors.pillBorder}`,
                      borderRadius: 999,
                      padding: "3px 8px",
                      fontSize: "7.5pt",
                      fontWeight: 600,
                    }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {data.executiveTraining && data.executiveTraining.length > 0 ? (
          <>
            <SectionTitle top={230} left={PAD} width={sideInner} colors={colors}>
              Executive Training
            </SectionTitle>
            <div style={{ ...pos(PAD, 260, sideInner) }}>
              {data.executiveTraining.slice(0, 5).map((item, index) => (
                <div key={`${item.name}-${index}`} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: "8.5pt", fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: "7.5pt", color: colors.accent }}>{item.institution}</div>
                  <div style={{ fontSize: "7pt", color: colors.muted }}>{item.year}</div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {data.references.length > 0 ? (
          <>
            <SectionTitle top={620} left={PAD} width={sideInner} colors={colors}>
              References
            </SectionTitle>
            <div style={{ ...pos(PAD, 650, sideInner) }}>
              {data.references.slice(0, 2).map((reference, index) => (
                <div key={`${reference.name}-${index}`} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: "8.5pt", fontWeight: 700 }}>{reference.name}</div>
                  <div style={{ fontSize: "7.5pt", color: colors.accent }}>{reference.title}</div>
                  <div style={{ fontSize: "7pt", color: colors.muted }}>{reference.company}</div>
                  <div style={{ fontSize: "7pt", marginTop: 2 }}>{reference.phone}</div>
                  <div style={{ fontSize: "7pt" }}>{reference.email}</div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {achievements.length > 0 ? (
          <>
            <SectionTitle top={20} left={BODY_X + PAD} width={bodyInner} colors={colors}>
              Career Highlights
            </SectionTitle>
            <div style={{ ...pos(BODY_X + PAD, 50, bodyInner) }}>
              {achievements.slice(0, 6).map((achievement, index) => (
                <div
                  key={`${achievement}-${index}`}
                  style={{
                    background: colors.cardBg,
                    border: `1px solid ${colors.divider}`,
                    borderLeft: `3px solid ${colors.accent}`,
                    borderRadius: 4,
                    padding: "8px 10px",
                    marginBottom: 10,
                    fontSize: "8.5pt",
                    lineHeight: "15px",
                  }}
                >
                  {achievement}
                </div>
              ))}
            </div>
          </>
        ) : null}

        {data.boardRoles && data.boardRoles.length > 0 ? (
          <>
            <SectionTitle top={330} left={BODY_X + PAD} width={bodyInner} colors={colors}>
              Board Roles
            </SectionTitle>
            <div style={{ ...pos(BODY_X + PAD, 360, bodyInner) }}>
              {data.boardRoles.slice(0, 4).map((role, index) => (
                <div key={`${role.title}-${index}`} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: "9pt", fontWeight: 700 }}>{role.title}</div>
                    <div style={{ fontSize: "7.5pt", color: colors.muted, marginLeft: 8 }}>{role.dates}</div>
                  </div>
                  <div style={{ fontSize: "8pt", color: colors.accent, fontWeight: 600 }}>{role.organization}</div>
                  {role.description ? (
                    <div style={{ fontSize: "8pt", color: colors.text, marginTop: 4, lineHeight: "15px" }}>
                      {role.description}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : null}

        {data.publications && data.publications.length > 0 ? (
          <>
            <SectionTitle top={660} left={BODY_X + PAD} width={bodyInner} colors={colors}>
              Publications
            </SectionTitle>
            <div style={{ ...pos(BODY_X + PAD, 690, bodyInner) }}>
              {data.publications.slice(0, 4).map((publication, index) => (
                <div key={`${publication.title}-${index}`} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: "8.5pt", fontWeight: 700 }}>{publication.title}</div>
                  <div style={{ fontSize: "7.5pt", color: colors.accent }}>
                    {publication.publisher}
                    {publication.type ? ` - ${publication.type}` : ""}
                  </div>
                  <div style={{ fontSize: "7pt", color: colors.muted }}>{publication.year}</div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {data.declaration?.declaration ? (
          <>
            <SectionTitle top={900} left={BODY_X + PAD} width={bodyInner} colors={colors}>
              Declaration
            </SectionTitle>
            <div style={{ ...pos(BODY_X + PAD, 930, bodyInner), fontSize: "8pt", lineHeight: "15px" }}>
              <div>{data.declaration.declaration}</div>
              {(data.declaration.place || data.declaration.date) ? (
                <div style={{ marginTop: 8, color: colors.muted }}>
                  {data.declaration.place || ""}
                  {data.declaration.place && data.declaration.date ? ", " : ""}
                  {data.declaration.date || ""}
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </PageFrame>
      <PageNumber page={3} colors={colors} />
    </>
  );
}

export default function CVTemplate3Pages({
  data,
  theme = "corporate",
}: CVTemplateProps) {
  return (
    <>
      <style>{`
        @page { size: A4; margin: 10mm; }
        .cv-page-wrapper {
          page-break-after: always;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          margin: 20px auto;
          padding: 20px;
          background: white;
          width: 834px;
          height: 1163px;
          position: relative;
        }
        .cv-page-wrapper + .cv-page-wrapper {
          margin-top: 40px;
        }
        @media print {
          .cv-page-wrapper {
            margin: 0;
            box-shadow: none;
            padding: 20px;
            width: 834px;
            height: 1163px;
            position: relative;
          }
          .cv-page-wrapper + .cv-page-wrapper {
            margin-top: 0;
            page-break-before: always;
          }
        }
      `}</style>

      <div className="cv-page-wrapper">
        <Page1 data={data} theme={theme} />
      </div>
      <div className="cv-page-wrapper">
        <Page2 data={data} theme={theme} />
      </div>
      <div className="cv-page-wrapper">
        <Page3 data={data} theme={theme} />
      </div>
    </>
  );
}
