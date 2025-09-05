import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";

// Simpel styling
const styles = {
  container: {
    display: "flex",
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5"
  },
  column: {
    flex: 1,
    padding: "20px"
  },
  card: {
    marginBottom: "20px",
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
    marginBottom: "10px"
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px"
  },
  textarea: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    minHeight: "80px",
    resize: "vertical"
  },
  select: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px"
  }
};

function App() {
  const SUPABASE_URL =
    "https://fjwpfesqfwtozaciphnc.supabase.co/functions/v1";

  const [summary, setSummary] = useState("");
  const [profile, setProfile] = useState("");
  const [kompetenceData, setKompetenceData] = useState({});
  const [goals, setGoals] = useState({});
  const [suggestion, setSuggestion] = useState("");
  const [activities, setActivities] = useState(
    JSON.parse(localStorage.getItem("activities") || "[]")
  );

  // Hent kompetencemål.json
  useEffect(() => {
    fetch("/kompetencemal.json")
      .then((res) => res.json())
      .then((data) => setKompetenceData(data));
      .catch((err) => console.error("Fejl ved indlæsning af kompetencemål:", err));
  }, []);

  // Gem aktiviteter i localStorage
  useEffect(() => {
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  // Upload PDF → pdfsummary
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${SUPABASE_URL}/pdfsummary`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setSummary(data.summary || "");
  };

  // Skift praktikprofil → vis mål
  const handleProfileChange = (e) => {
    const selected = e.target.value;
    setProfile(selected);
    if (selected && kompetenceData[selected]) {
      setGoals(kompetenceData[selected]);
    } else {
      setGoals({});
    }
  };

  // Lav forslag → forslag-function
  const handleSuggestion = async () => {
    if (!summary) {
      alert("Upload først en PDF, så vi har et resumé at arbejde med.");
      return;
    }

    const combinedText = `
Resumé:
${summary}

Kompetencemål:
${goals.kompetencemål || ""}

Vidensmål:
${(goals.vidensmål || []).join("\n")}

Færdighedsmål:
${(goals.færdighedsmål || []).join("\n")}
`;

    const res = await fetch(`${SUPABASE_URL}/forslag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: combinedText, profile }),
    });

    const data = await res.json();
    setSuggestion(data.suggestion || "Intet forslag modtaget");
  };

  // Gem aktivitet (max 3)
  const saveActivity = () => {
    if (!suggestion) {
      alert("Der er intet forslag at gemme.");
      return;
    }
    if (activities.length >= 3) {
      alert("Du kan kun gemme op til 3 aktiviteter.");
      return;
    }
    setActivities([...activities, { text: suggestion, reflection: "" }]);
  };

  // Opdater refleksion
  const updateReflection = (index, value) => {
    const newActs = [...activities];
    newActs[index].reflection = value;
    setActivities(newActs);
  };

  // Slet aktivitet
  const deleteActivity = (index) => {
    const newActs = activities.filter((_, i) => i !== index);
    setActivities(newActs);
  };

  // Udskriv til PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    activities.forEach((act, idx) => {
      doc.text(`Aktivitet ${idx + 1}:`, 10, y);
      y += 10;
      doc.text(doc.splitTextToSize(act.text, 180), 10, y);
      y += 20;
      doc.text("Refleksioner:", 10, y);
      y += 10;
      doc.text(doc.splitTextToSize(act.reflection || "-", 180), 10, y);
      y += 30;
    });
    doc.save("aktiviteter.pdf");
  };

  return (
    <div style={styles.container}>
      {/* Venstre side */}
      <div style={styles.column}>
        <h1>Læringsassistent</h1>

        <div style={styles.card}>
          <h2>Upload PDF</h2>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={handlePdfUpload}
            style={styles.input}
          />
        </div>

        <div style={styles.card}>
          <h2>Mine aktiviteter (max 3)</h2>
          {activities.map((act, idx) => (
            <div key={idx} style={{ 
              border: "1px solid #ddd", 
              padding: "10px", 
              marginBottom: "10px", 
              borderRadius: "6px",
              backgroundColor: "#f9f9f9"
            }}>
              <strong>Aktivitet {idx + 1}</strong>
              <p>{act.text}</p>
              <textarea
                placeholder="Skriv dine refleksioner..."
                value={act.reflection}
                onChange={(e) => updateReflection(idx, e.target.value)}
                style={styles.textarea}
              />
              <button 
                onClick={() => deleteActivity(idx)}
                style={{...styles.button, backgroundColor: "#dc3545"}}
              >
                Slet
              </button>
            </div>
          ))}
          {activities.length > 0 && (
            <button onClick={downloadPDF} style={styles.button}>
              Udskriv alle aktiviteter
            </button>
          )}
        </div>
      </div>

      {/* Højre side */}
      <div style={styles.column}>
        <div style={styles.card}>
          <h2>Opsummering af læreplan</h2>
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "10px", 
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            minHeight: "100px"
          }}>
            {summary || "Upload en PDF for at se opsummering"}
          </div>
        </div>

        <div style={styles.card}>
          <h2>Praktikprofil & mål</h2>
          <select value={profile} onChange={handleProfileChange} style={styles.select}>
            <option value="">Vælg profil</option>
            {Object.keys(kompetenceData).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
          {profile && goals && (
            <div>
              <h3>Kompetencemål</h3>
              <p>{goals.kompetencemål}</p>
              <h3>Vidensmål</h3>
              <ul>{(goals.vidensmål || []).map((m, i) => <li key={i}>{m}</li>)}</ul>
              <h3>Færdighedsmål</h3>
              <ul>{(goals.færdighedsmål || []).map((m, i) => <li key={i}>{m}</li>)}</ul>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2>Lav forslag til aktivitet</h2>
          <button onClick={handleSuggestion} style={styles.button}>
            Lav forslag
          </button>
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "10px", 
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            minHeight: "100px",
            marginBottom: "10px"
          }}>
            {suggestion || "Klik på 'Lav forslag' for at få aktivitetsforslag"}
          </div>
          {suggestion && (
            <button onClick={saveActivity} style={styles.button}>
              Gem aktivitet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
