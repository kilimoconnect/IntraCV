import React from "react";
import { CVTemplateData } from "./types";

interface Props {
  data: CVTemplateData;
}

export default function OnePageTemplate({ data }: Props) {
  const { personalInfo, summary, experiences, education, skills, certifications, languages } = data;

  const groupedSkills = skills.reduce((acc: Record<string, string[]>, s) => {
    const cat = s.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s.name);
    return acc;
  }, {});

  return (
    <div
      className="cv-template"
      style={{
        width: "794px",
        height: "1123px",
        overflow: "hidden",
        background: "#fff",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        fontSize: "11px",
        lineHeight: "1.4",
        color: "#1a1a1a",
        padding: "40px 48px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: "2px solid #2563eb", paddingBottom: "16px", marginBottom: "16px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "#111" }}>
          {personalInfo.fullName}
        </h1>
        {personalInfo.headline && (
          <p style={{ fontSize: "13px", color: "#2563eb", margin: "4px 0 0", fontWeight: 500 }}>
            {personalInfo.headline}
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px", fontSize: "10px", color: "#555" }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
          {personalInfo.website && <span>• {personalInfo.website}</span>}
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: "flex", gap: "28px" }}>
        {/* Main column */}
        <div style={{ flex: "1 1 65%", minWidth: 0 }}>
          {/* Summary */}
          {summary && (
            <div style={{ marginBottom: "14px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#2563eb", margin: "0 0 6px", borderBottom: "1px solid #e5e7eb", paddingBottom: "3px" }}>
                Professional Summary
              </h2>
              <p style={{ margin: 0, color: "#333", fontSize: "10.5px" }}>{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#2563eb", margin: "0 0 6px", borderBottom: "1px solid #e5e7eb", paddingBottom: "3px" }}>
                Experience
              </h2>
              {experiences.slice(0, 3).map((exp, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <strong style={{ fontSize: "11px" }}>{exp.title}</strong>
                    <span style={{ fontSize: "9px", color: "#666", whiteSpace: "nowrap" }}>
                      {exp.startDate}{exp.startDate && exp.endDate ? " – " : ""}{exp.endDate}
                    </span>
                  </div>
                  {exp.company && <p style={{ margin: "1px 0 0", color: "#2563eb", fontSize: "10px", fontWeight: 500 }}>{exp.company}</p>}
                  {exp.description && (
                    <p style={{ margin: "3px 0 0", color: "#444", fontSize: "10px", whiteSpace: "pre-line" }}>
                      {exp.description.slice(0, 200)}{exp.description.length > 200 ? "..." : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#2563eb", margin: "0 0 6px", borderBottom: "1px solid #e5e7eb", paddingBottom: "3px" }}>
                Education
              </h2>
              {education.slice(0, 2).map((edu, i) => (
                <div key={i} style={{ marginBottom: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <strong style={{ fontSize: "11px" }}>{edu.degree}</strong>
                    {edu.year && <span style={{ fontSize: "9px", color: "#666" }}>{edu.year}</span>}
                  </div>
                  {edu.institution && <p style={{ margin: "1px 0 0", color: "#2563eb", fontSize: "10px" }}>{edu.institution}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ flex: "0 0 30%", minWidth: 0 }}>
          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#2563eb", margin: "0 0 6px", borderBottom: "1px solid #e5e7eb", paddingBottom: "3px" }}>
                Skills
              </h2>
              {Object.entries(groupedSkills).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: "6px" }}>
                  <p style={{ fontSize: "9px", fontWeight: 600, color: "#888", textTransform: "uppercase", margin: "0 0 2px" }}>{cat}</p>
                  <p style={{ margin: 0, fontSize: "10px", color: "#333" }}>{(items as string[]).join(", ")}</p>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#2563eb", margin: "0 0 6px", borderBottom: "1px solid #e5e7eb", paddingBottom: "3px" }}>
                Languages
              </h2>
              {languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "3px" }}>
                  <span>{lang.name}</span>
                  <span style={{ color: "#666" }}>{lang.proficiency}</span>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#2563eb", margin: "0 0 6px", borderBottom: "1px solid #e5e7eb", paddingBottom: "3px" }}>
                Certifications
              </h2>
              {certifications.slice(0, 4).map((cert, i) => (
                <div key={i} style={{ marginBottom: "4px" }}>
                  <p style={{ margin: 0, fontSize: "10px", fontWeight: 600 }}>{cert.name}</p>
                  <p style={{ margin: 0, fontSize: "9px", color: "#666" }}>
                    {cert.issuer}{cert.issuer && cert.year ? " • " : ""}{cert.year}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
