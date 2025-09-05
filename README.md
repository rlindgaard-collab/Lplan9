# Læringsassistent

En React-baseret læringsassistent til pædagogstuderende.

## Funktioner

- Upload PDF læreplaner og få AI-genererede opsummeringer
- Vælg praktikprofil og se relevante kompetencemål
- Få skræddersyede aktivitetsforslag baseret på læreplan og profil
- Gem og reflektér over aktiviteter
- Eksportér aktiviteter til PDF

## Opsætning for live deployment

For at få AI-funktionaliteten til at virke på den publicerede side skal du:

### 1. Opsæt Supabase projekt
- Opret et nyt projekt på [supabase.com](https://supabase.com)
- Gå til Settings > API og kopier:
  - Project URL
  - Anon public key

### 2. Opsæt OpenAI API
- Få en API nøgle fra [OpenAI](https://platform.openai.com/api-keys)
- Gå til dit Supabase projekt > Settings > Environment variables
- Tilføj: `OPENAI_API_KEY` med din OpenAI API nøgle

### 3. Deploy edge functions
```bash
# Installer Supabase CLI
npm install -g supabase

# Login til Supabase
supabase login

# Link til dit projekt
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy pdfsummary
supabase functions deploy forslag
```

### 4. Opdater environment variabler
Erstat placeholder værdierne i `.env` filen med dine rigtige Supabase værdier:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Gendeployér appen
Efter du har opdateret environment variablerne, skal du gendeployere appen for at få ændringerne med.

## Lokal udvikling

Kør lokalt med mock data:
```bash
npm install
npm run dev
```

Appen vil automatisk bruge mock implementering lokalt og rigtige API calls når deployed.