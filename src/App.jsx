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
      .then((data) => setKompetenceData(data))
      .catch((err) => console.error("Fejl ved indlæsning af kompetencemål:", err));
  }, []);

  // Gem aktiviteter i localStorage
  useEffect(() => {
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  // Mock PDF processing function
  const processPdfMock = async (file) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fileName = file.name;
    const fileSize = file.size;
    
    return `Opsummering af ${fileName}:

Dette er en læreplan der indeholder pædagogiske mål og aktiviteter. 
Dokumentet er ${Math.round(fileSize / 1024)} KB stort.

Hovedpunkter:
- Kompetencemål for praktikperioden
- Vidensmål der skal opnås
- Færdighedsmål for den studerende
- Pædagogiske aktiviteter og metoder
- Evaluering og dokumentation

Dokumentet fokuserer på at udvikle den studerendes faglige kompetencer 
gennem praktisk erfaring og teoretisk viden.

Baseret på indholdet anbefales det at fokusere på praktiske øvelser 
der kombinerer teoretisk viden med hands-on erfaring.`;
  };

  // Mock suggestion function
  const generateSuggestionMock = async (combinedText, profile) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const suggestions = {
      "Kontor og administration": `Forslag til aktivitet for ${profile}:

1. PRAKTISK ØVELSE: Opret og administrer et digitalt arkiveringssystem
   - Brug Microsoft 365 eller lignende platform
   - Organiser dokumenter efter kategorier og datoer
   - Implementer navngivningskonventioner

2. KOMMUNIKATIONSOPGAVE: Skriv og send professionelle e-mails
   - Øv forskellige e-mail typer (forespørgsler, bekræftelser, opfølgning)
   - Fokus på tone, struktur og etikette
   - Inkluder vedhæftede filer og formatering

3. PLANLÆGNINGSAKTIVITET: Koordiner et møde eller event
   - Brug kalendersystemer til planlægning
   - Send invitationer og følg op
   - Forbered dagsorden og materialer

Disse aktiviteter udvikler dine administrative færdigheder og forbereder dig på arbejdslivet.`,
      
      "IT og digitale medier": `Forslag til aktivitet for ${profile}:

1. WEBUDVIKLING: Byg en responsiv hjemmeside
   - Brug HTML, CSS og JavaScript
   - Implementer mobile-first design
   - Test på forskellige enheder og browsere

2. DATABASER: Design og implementer en database
   - Opret tabeller og relationer
   - Skriv SQL queries til data manipulation
   - Implementer sikkerhedsforanstaltninger

3. PROJEKTLEDELSE: Planlæg et IT-projekt
   - Brug agile metoder som Scrum
   - Opret user stories og sprint planning
   - Dokumenter proces og resultater

Disse aktiviteter styrker dine tekniske færdigheder og projektledelseskompetencer.`,
      
      "Handel og service": `Forslag til aktivitet for ${profile}:

1. KUNDESERVICE: Håndter kundehenvendelser
   - Øv telefonisk og skriftlig kommunikation
   - Løs problemer og klager professionelt
   - Dokumenter kundeinteraktioner

2. SALGSAKTIVITET: Gennemfør et salgsforløb
   - Identificer kundens behov
   - Præsenter produkter/services
   - Følg op på tilbud og lukke salg

3. MARKEDSFØRING: Planlæg en marketingkampagne
   - Analyser målgruppe og konkurrenter
   - Udvikl budskaber og materialer
   - Mål og evaluer kampagnens effekt

Disse aktiviteter udvikler dine kommercielle og kommunikative færdigheder.`
    };
    
    return suggestions[profile] || `Forslag til aktivitet:

Baseret på den uploadede læreplan og den valgte profil anbefales følgende aktiviteter:

1. Gennemfør en praktisk øvelse der kombinerer teori og praksis
2. Dokumenter din læring gennem refleksion
3. Evaluer dine resultater i forhold til kompetencemålene

Disse aktiviteter vil hjælpe dig med at opnå de ønskede læringsmål.`;
  };

  // Upload PDF → pdfsummary
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Vælg venligst en PDF fil');
      return;
    }

    try {
      setSummary("Behandler PDF...");
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/pdfsummary`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setSummary(data.summary);
    } catch (error) {
      console.error('Fejl ved upload:', error);
      setSummary('Fejl ved behandling af PDF. Prøv igen.');
    }
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

    try {
      setSuggestion("Genererer forslag...");
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/forslag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: combinedText,
          profile: profile
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestion(data.suggestion);
    } catch (error) {
      console.error('Fejl ved forslag:', error);
      setSuggestion('Fejl ved generering af forslag. Prøv igen.');
    }
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
