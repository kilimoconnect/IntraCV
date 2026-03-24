import React from "react";
import { CVTemplateData } from "./types";

interface Props {
  data: CVTemplateData;
}

export default function ExecutiveTemplate({ data }: Props) {
  const { personalInfo, summary, experiences, education, skills, certifications, languages, areasOfExpertise, referees, declaration } = data;

  const groupedSkills = skills.reduce((acc: Record<string, string[]>, s) => {
    const cat = s.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s.name);
    return acc;
  }, {});

  const accent = "#1e3a5f";

  const sectionHeading: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "2px",
    color: accent,
    margin: "0 0 10px",
    paddingBottom: "5px",
    borderBottom: `2px solid ${accent}`,
  };

  const pageStyle: React.CSSProperties = {
    width: "794px",
    height: "1123px",
    overflow: "hidden",
    background: "#fff",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: "11px",
    lineHeight: "1.5",
    color: "#1a1a1a",
    padding: "48px 56px",
    boxSizing: "border-box",
  };

  return (
    <div className="cv-template">
      {/* ════ PAGE 1 ════ */}
      <div style={pageStyle}>
        {/* Header */}
        <div style={{ borderBottom: `4px double ${accent}`, paddingBottom: "18px", marginBottom: "22px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 700, margin: 0, color: accent, fontFamily: "'Georgia', serif" }}>
            {personalInfo.fullName}
          </h1>
          {personalInfo.headline && (
            <p style={{ fontSize: "15px", color: "#475569", margin: "4px 0 0", fontStyle: "italic" }}>
              {personalInfo.headline}
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "10px", fontSize: "10.5px", color: "#64748b" }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>|  {personalInfo.phone}</span>}
            {personalInfo.location && <span>|  {personalInfo.location}</span>}
            {personalInfo.linkedin && <span>|  {personalInfo.linkedin}</span>}
            {personalInfo.website && <span>|  {personalInfo.website}</span>}
          </div>
        </div>

        {/* Executive Summary */}
        {summary && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>Executive Summary</h2>
            <p style={{ margin: 0, color: "#334155", fontSize: "11.5px", lineHeight: "1.7", textAlign: "justify" }}>{summary}</p>
          </div>
        )}

        {/* Areas of Expertise */}
        {areasOfExpertise.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>Core Competencies</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 16px" }}>
              {areasOfExpertise.map((a, i) => (
                <div key={i} style={{ fontSize: "10.5px", padding: "3px 0", borderBottom: "1px dotted #cbd5e1" }}>
                  ▸ {a.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>Professional Experience</h2>
            {experiences.slice(0, 3).map((exp, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "12.5px", color: accent }}>{exp.title}</strong>
                  <span style={{ fontSize: "10px", color: "#64748b", whiteSpace: "nowrap", fontStyle: "italic" }}>
                    {exp.startDate}{exp.startDate && exp.endDate ? " – " : ""}{exp.endDate}
                  </span>
                </div>
                {exp.company && <p style={{ margin: "2px 0 0", fontSize: "11px", fontWeight: 600 }}>{exp.company}</p>}
                {exp.description && (
                  <p style={{ margin: "5px 0 0", color: "#475569", fontSize: "10.5px", whiteSpace: "pre-line", lineHeight: "1.55" }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════ PAGE 2 ════ */}
      <div style={{ ...pageStyle, marginTop: "20px" }}>
        {/* Remaining Experience */}
        {experiences.length > 3 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>Professional Experience (continued)</h2>
            {experiences.slice(3, 6).map((exp, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "12.5px", color: accent }}>{exp.title}</strong>
                  <span style={{ fontSize: "10px", color: "#64748b", whiteSpace: "nowrap", fontStyle: "italic" }}>
                    {exp.startDate}{exp.startDate && exp.endDate ? " – " : ""}{exp.endDate}
                  </span>
                </div>
                {exp.company && <p style={{ margin: "2px 0 0", fontSize: "11px", fontWeight: 600 }}>{exp.company}</p>}
                {exp.description && (
                  <p style={{ margin: "5px 0 0", color: "#475569", fontSize: "10.5px", whiteSpace: "pre-line", lineHeight: "1.55" }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>Education</h2>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "11.5px" }}>{edu.degree}</strong>
                  {edu.year && <span style={{ fontSize: "10px", color: "#64748b", fontStyle: "italic" }}>{edu.year}</span>}
                </div>
                {edu.institution && <p style={{ margin: "1px 0 0", fontSize: "11px", fontWeight: 500, color: accent }}>{edu.institution}</p>}
                {edu.description && <p style={{ margin: "3px 0 0", color: "#475569", fontSize: "10.5px" }}>{edu.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>Technical & Professional Skills</h2>
            {Object.entries(groupedSkills).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: "6px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{cat}: </span>
                <span style={{ fontSize: "10.5px", color: "#334155" }}>{(items as string[]).join("  •  ")}</span>
              </div>
            ))}
          </div>
        )}

        {/* Certifications & Languages side by side */}
        <div style={{ display: "flex", gap: "28px" }}>
          {certifications.length > 0 && (
            <div style={{ flex: 1, marginBottom: "20px" }}>
              <h2 style={sectionHeading}>Certifications</h2>
              {certifications.map((cert, i) => (
                <div key={i} style={{ marginBottom: "5px" }}>
                  <p style={{ margin: 0, fontSize: "11px", fontWeight: 600 }}>{cert.name}</p>
                  <p style={{ margin: 0, fontSize: "9.5px", color: "#64748b" }}>
                    {cert.issuer}{cert.issuer && cert.year ? " • " : ""}{cert.year}
                  </p>
                </div>
              ))}
            </div>
          )}
          {languages.length > 0 && (
            <div style={{ flex: 1, marginBottom: "20px" }}>
              <h2 style={sectionHeading}>Languages</h2>
              {languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 500 }}>{lang.name}</span>
                  <span style={{ color: "#64748b", fontStyle: "italic" }}>{lang.proficiency}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ════ PAGE 3 ════ */}
      <div style={{ ...pageStyle, marginTop: "20px" }}>
        {/* Remaining Experience */}
        {experiences.length > 6 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>Additional Experience</h2>
            {experiences.slice(6).map((exp, i) => (
              <div key={i} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "12px", color: accent }}>{exp.title}</strong>
                  <span style={{ fontSize: "10px", color: "#64748b", whiteSpace: "nowrap", fontStyle: "italic" }}>
                    {exp.startDate}{exp.startDate && exp.endDate ? " – " : ""}{exp.endDate}
                  </span>
                </div>
                {exp.company && <p style={{ margin: "2px 0 0", fontSize: "11px", fontWeight: 600 }}>{exp.company}</p>}
                {exp.description && (
                  <p style={{ margin: "5px 0 0", color: "#475569", fontSize: "10.5px", whiteSpace: "pre-line", lineHeight: "1.55" }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* References */}
        {referees.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>References</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {referees.map((ref, i) => (
                <div key={i} style={{ border: `1px solid ${accent}20`, borderRadius: "6px", padding: "12px" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "11.5px", color: accent }}>{ref.name}</p>
                  {ref.title && <p style={{ margin: "2px 0 0", fontSize: "10.5px", color: "#475569" }}>{ref.title}</p>}
                  {ref.company && <p style={{ margin: "1px 0 0", fontSize: "10.5px", fontWeight: 600 }}>{ref.company}</p>}
                  <div style={{ marginTop: "6px", fontSize: "9.5px", color: "#64748b" }}>
                    {ref.phone && <div>{ref.phone}</div>}
                    {ref.email && <div>{ref.email}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Declaration */}
        {declaration?.declaration && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={sectionHeading}>Declaration</h2>
            <p style={{ margin: 0, color: "#475569", fontSize: "11px", fontStyle: "italic", lineHeight: "1.6" }}>{declaration.declaration}</p>
            {(declaration.place || declaration.date) && (
              <p style={{ margin: "10px 0 0", fontSize: "10.5px", color: "#334155" }}>
                {declaration.place}{declaration.place && declaration.date ? ", " : ""}{declaration.date}
              </p>
            )}
          </div>
        )}

        {/* Signature line */}
        <div style={{ marginTop: "40px" }}>
          <div style={{ width: "200px", borderTop: `1px solid ${accent}`, paddingTop: "6px" }}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 600 }}>{personalInfo.fullName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
