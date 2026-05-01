import React from "react";
import { CVTemplateData } from "./types";
import { normalizeDate } from "@/lib/normalize-date";

interface Props {
  data: CVTemplateData;
}

export default function TwoPageTemplate({ data }: Props) {
  const { personalInfo, summary, experiences, education, skills, certifications, languages, areasOfExpertise, referees, declaration } = data;

  const groupedSkills = skills.reduce((acc: Record<string, string[]>, s) => {
    const cat = s.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s.name);
    return acc;
  }, {});

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color: "#0f172a",
    margin: "0 0 8px",
    paddingBottom: "4px",
    borderBottom: "2px solid #0f172a",
  };

  const pageStyle: React.CSSProperties = {
    width: "794px",
    height: "1123px",
    overflow: "hidden",
    background: "#fff",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontSize: "11px",
    lineHeight: "1.45",
    color: "#1a1a1a",
    padding: "44px 52px",
    boxSizing: "border-box",
  };

  return (
    <div className="cv-template">
      {/* ════ PAGE 1 ════ */}
      <div style={pageStyle}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "3px solid #0f172a", paddingBottom: "16px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0, color: "#0f172a", letterSpacing: "1px" }}>
            {personalInfo.fullName}
          </h1>
          {personalInfo.headline && (
            <p style={{ fontSize: "14px", color: "#475569", margin: "4px 0 0", fontWeight: 500 }}>
              {personalInfo.headline}
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "16px", marginTop: "10px", fontSize: "10px", color: "#64748b" }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>|  {personalInfo.phone}</span>}
            {personalInfo.location && <span>|  {personalInfo.location}</span>}
            {personalInfo.linkedin && <span>|  {personalInfo.linkedin}</span>}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div style={{ marginBottom: "18px" }}>
            <h2 style={sectionHeadingStyle}>Professional Summary</h2>
            <p style={{ margin: 0, color: "#334155", fontSize: "11px", lineHeight: "1.6" }}>{summary}</p>
          </div>
        )}

        {/* Areas of Expertise */}
        {areasOfExpertise.length > 0 && (
          <div style={{ marginBottom: "18px" }}>
            <h2 style={sectionHeadingStyle}>Areas of Expertise</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {areasOfExpertise.map((a, i) => (
                <span key={i} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "3px 10px", fontSize: "10px", fontWeight: 500 }}>
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <div style={{ marginBottom: "18px" }}>
            <h2 style={sectionHeadingStyle}>Professional Experience</h2>
            {experiences.slice(0, 4).map((exp, i) => (
              <div key={i} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "12px" }}>{exp.title}</strong>
                  <span style={{ fontSize: "10px", color: "#64748b", whiteSpace: "nowrap" }}>
                    {normalizeDate(exp.startDate)}{exp.startDate && exp.endDate ? " – " : ""}{normalizeDate(exp.endDate)}
                  </span>
                </div>
                {exp.company && <p style={{ margin: "1px 0 0", color: "#0f172a", fontSize: "11px", fontWeight: 600 }}>{exp.company}</p>}
                {exp.description && (
                  <p style={{ margin: "4px 0 0", color: "#475569", fontSize: "10.5px", whiteSpace: "pre-line", lineHeight: "1.5" }}>
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
        {experiences.length > 4 && (
          <div style={{ marginBottom: "18px" }}>
            <h2 style={sectionHeadingStyle}>Professional Experience (continued)</h2>
            {experiences.slice(4).map((exp, i) => (
              <div key={i} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "12px" }}>{exp.title}</strong>
                  <span style={{ fontSize: "10px", color: "#64748b", whiteSpace: "nowrap" }}>
                    {normalizeDate(exp.startDate)}{exp.startDate && exp.endDate ? " – " : ""}{normalizeDate(exp.endDate)}
                  </span>
                </div>
                {exp.company && <p style={{ margin: "1px 0 0", color: "#0f172a", fontSize: "11px", fontWeight: 600 }}>{exp.company}</p>}
                {exp.description && (
                  <p style={{ margin: "4px 0 0", color: "#475569", fontSize: "10.5px", whiteSpace: "pre-line", lineHeight: "1.5" }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={{ marginBottom: "18px" }}>
            <h2 style={sectionHeadingStyle}>Education</h2>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "11px" }}>{edu.degree}</strong>
                  {edu.year && <span style={{ fontSize: "10px", color: "#64748b" }}>{edu.year}</span>}
                </div>
                {edu.institution && <p style={{ margin: "1px 0 0", color: "#0f172a", fontSize: "10.5px", fontWeight: 500 }}>{edu.institution}</p>}
                {edu.description && <p style={{ margin: "2px 0 0", color: "#475569", fontSize: "10px" }}>{edu.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Two columns: Skills + Languages/Certs */}
        <div style={{ display: "flex", gap: "28px" }}>
          <div style={{ flex: 1 }}>
            {/* Skills */}
            {skills.length > 0 && (
              <div style={{ marginBottom: "18px" }}>
                <h2 style={sectionHeadingStyle}>Skills</h2>
                {Object.entries(groupedSkills).map(([cat, items]) => (
                  <div key={cat} style={{ marginBottom: "6px" }}>
                    <p style={{ fontSize: "9px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", margin: "0 0 2px" }}>{cat}</p>
                    <p style={{ margin: 0, fontSize: "10.5px", color: "#334155" }}>{(items as string[]).join("  •  ")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            {/* Languages */}
            {languages.length > 0 && (
              <div style={{ marginBottom: "18px" }}>
                <h2 style={sectionHeadingStyle}>Languages</h2>
                {languages.map((lang, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 500 }}>{lang.name}</span>
                    <span style={{ color: "#64748b" }}>{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div style={{ marginBottom: "18px" }}>
                <h2 style={sectionHeadingStyle}>Certifications</h2>
                {certifications.map((cert, i) => (
                  <div key={i} style={{ marginBottom: "5px" }}>
                    <p style={{ margin: 0, fontSize: "10.5px", fontWeight: 600 }}>{cert.name}</p>
                    <p style={{ margin: 0, fontSize: "9.5px", color: "#64748b" }}>
                      {cert.issuer}{cert.issuer && cert.year ? " • " : ""}{cert.year}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Referees */}
        {referees.length > 0 && (
          <div style={{ marginBottom: "18px" }}>
            <h2 style={sectionHeadingStyle}>References</h2>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {referees.map((ref, i) => (
                <div key={i} style={{ flex: "1 1 45%", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "10px" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "11px" }}>{ref.name}</p>
                  {ref.title && <p style={{ margin: "1px 0 0", fontSize: "10px", color: "#475569" }}>{ref.title}</p>}
                  {ref.company && <p style={{ margin: "1px 0 0", fontSize: "10px", color: "#0f172a", fontWeight: 500 }}>{ref.company}</p>}
                  <div style={{ marginTop: "4px", fontSize: "9.5px", color: "#64748b" }}>
                    {ref.phone && <span>{ref.phone}</span>}
                    {ref.phone && ref.email && <span> • </span>}
                    {ref.email && <span>{ref.email}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Declaration */}
        {declaration?.declaration && (
          <div style={{ marginBottom: "18px" }}>
            <h2 style={sectionHeadingStyle}>Declaration</h2>
            <p style={{ margin: 0, color: "#475569", fontSize: "10.5px", fontStyle: "italic", lineHeight: "1.6" }}>
              {declaration.declaration}
            </p>
            {(declaration.place || declaration.date) && (
              <p style={{ margin: "6px 0 0", fontSize: "10px", color: "#64748b" }}>
                {declaration.place}{declaration.place && declaration.date ? ", " : ""}{declaration.date}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
