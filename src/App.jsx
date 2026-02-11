import React, { useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Quiz from "./components/Quiz";
import "./styles/quiz.css";
import cutuImg from "./assets/cutu.png";
import MentalHealth from "./pages/MentalHealth";
import DiseaseMap from "./components/heatmap_file";
import { useLanguage } from "./LanguageContext";

/* ================= NAVBAR ================= */
function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        Aarogya AI
      </Link>

      <div className="nav-links">
        <Link to="/">{t("navbar.home")}</Link>
        <Link to="/map">Outbreak Map</Link> 
        <Link to="/xray">{t("navbar.xray")}</Link>
        <Link to="/risk">{t("navbar.risk")}</Link>
        <Link to="/mental-health">{t("navbar.mentalHealth")}</Link>

        {/* LANGUAGE DROPDOWN */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            marginLeft: "12px",
            padding: "6px 8px",
            borderRadius: "6px",
            background: "#0f172a",
            color: "#ffffff",
            border: "1px solid #334155",
            cursor: "pointer",
          }}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
          <option value="bn">Bengali</option>
          <option value="te">Telugu</option>
          <option value="ta">Tamil</option>
        </select>
      </div>
    </nav>
  );
}

/* ================= HOME PAGE ================= */
function HomePage() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <h1>{t("hero.title")}</h1>
          <div className="project-desc-container">
            <p className="project-desc">{t("hero.description")}</p>
            <div className="hackathon-badge">{t("hero.badge")}</div>
          </div>
          <p style={{ color: "#53d8fb", marginTop: "10px", fontWeight: "500" }}>
            {t("hero.builtFor")}
          </p>
        </div>

        <div style={{ flex: 1, minWidth: "200px", textAlign: "center" }}>
          <img src={cutuImg} alt="Health Illustration" style={{ width: "70%", maxWidth: "280px", borderRadius: "12px" }} />
        </div>
      </div>

      <div className="features info-cards">
        <div className="feature-card">
          <span className="feature-icon">🩻</span>
          <h3>{t("features.xray.title")}</h3>
          <p>{t("features.xray.description")}</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">📊</span>
          <h3>{t("features.risk.title")}</h3>
          <p>{t("features.risk.description")}</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">💬</span>
          <h3>{t("features.chatbot.title")}</h3>
          <p>{t("features.chatbot.description")}</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🎧</span>
          <h3>AI Voice Companion</h3>
          <ul style={{ marginTop: "8px", paddingLeft: "18px" }}>
            <li>24/7 emotional support</li>
            <li>Judgment-free conversations</li>
            <li>Voice-based AI companion</li>
            <li>Available in Mental Health section</li>
          </ul>
        </div>
      </div>

      <df-messenger
        intent="WELCOME"
        chat-title="Aarogya AI"
        agent-id="22591bdc-f998-476e-81c4-af92f6f54692"
        language-code="en"
      ></df-messenger>
    </section>
  );
}

/* ================= XRAY PAGE ================= */
function XrayPage() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const getEndpoint = () => {
    if (selectedArea === "Lungs") return "/predict/xray/lung";
    if (selectedArea === "Bones") return "/predict/xray/bones";
    if (selectedArea === "Kidney") return "/predict/xray/kidney";
    return null;
  };

  const handlePredict = async () => {
    if (!selectedFile || !selectedArea) return;
    const endpoint = getEndpoint();
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      let assessment, color;
      if (data.confidence >= 0.75) { assessment = "High likelihood of abnormality detected"; color = "#ff6b6b"; }
      else if (data.confidence >= 0.4) { assessment = "Inconclusive evaluation recommended"; color = "#facc15"; }
      else { assessment = "No significant abnormality detected"; color = "#4ade80"; }
      setResult({ confidence: data.confidence, assessment, color });
    } catch {
      alert("Backend connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>X-Ray Upload</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["Kidney", "Lungs", "Bones"].map((area) => (
          <button key={area} className={`btn ${selectedArea === area ? "btn-active" : ""}`} onClick={() => setSelectedArea(area)}>
            {area}
          </button>
        ))}
      </div>
      <input type="file" ref={fileInputRef} hidden onChange={(e) => setSelectedFile(e.target.files[0])} />
      <button className="btn" onClick={() => fileInputRef.current.click()}>Select Image</button>
      {selectedFile && <p>{selectedFile.name}</p>}
      <button className="btn" onClick={handlePredict} disabled={!selectedFile || loading}>Scan</button>
      {result && <div style={{ marginTop: "20px" }}><p style={{ color: result.color }}>{result.assessment}</p></div>}
    </div>
  );
}

/* ================= RISK PAGE ================= */
function RiskPage() {
  return (
    <div className="page-container">
      <Quiz />
    </div>
  );
}

/* ================= MAP PAGE ================= */
function MapPage() {
  return (
    <div className="page-container">
      <h2 style={{ marginBottom: "20px" }}>Live Disease Outbreak Surveillance</h2>
      <p style={{ marginBottom: "20px", color: "#94a3b8" }}>
        This map shows real-time data of communicable diseases like Bird Flu and Influenza.
      </p>
      <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #334155" }}>
        <DiseaseMap />
      </div>
    </div>
  );
}

/* ================= APP ROOT ================= */
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/xray" element={<XrayPage />} />
        <Route path="/risk" element={<RiskPage />} />
        <Route path="/mental-health" element={<MentalHealth />} />
      </Routes>
    </BrowserRouter>
  );
}