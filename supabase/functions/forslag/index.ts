import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      })
    }

    const { text, profile } = await req.json()
    
    if (!text || !profile) {
      return new Response(JSON.stringify({ error: 'Mangler tekst eller profil' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generer forslag baseret på profil og indhold
    let suggestion = ""
    
    if (profile.includes("Dagtilbudspædagogik")) {
      suggestion = `Forslag til aktivitet for ${profile}:

🎨 KREATIV LÆRINGSAKTIVITET
Titel: "Naturens farver og former"

Formål:
- Udvikle børnenes æstetiske sans og kreativitet
- Styrke observationsevner og sprogudvikling
- Fremme samarbejde og social læring

Aktivitet:
1. Tag børnene med på en naturvandring i haven/parken
2. Saml forskellige naturmaterialer (blade, sten, pinde)
3. Lav kollektive kunstværker med de fundne materialer
4. Dokumenter processen med fotos og børnenes egne ord

Evaluering:
- Observer børnenes engagement og kreative processer
- Dokumenter sproglig udvikling gennem samtaler
- Reflekter over aktivitetens bidrag til kompetencemålene

Denne aktivitet understøtter både æstetisk læring, naturoplevelser og sprogudvikling som nævnt i kompetencemålene.`
    
    } else if (profile.includes("Skole- og fritidspædagogik")) {
      suggestion = `Forslag til aktivitet for ${profile}:

⚽ TVÆRFAGLIG BEVÆGELSESAKTIVITET
Titel: "Matematik i bevægelse"

Formål:
- Kombinere læring og bevægelse
- Styrke samarbejde mellem skole og fritid
- Udvikle både faglige og sociale kompetencer

Aktivitet:
1. Design bevægelsesopgaver der integrerer matematik
2. Skab teams på tværs af aldersgrupper
3. Brug skolegården til praktiske regneopgaver
4. Evaluer både faglig læring og trivsel

Tværprofessionelt samarbejde:
- Koordiner med lærere om faglige mål
- Inddrag børnenes egne ideer og interesser
- Dokumenter læreprocesser og sociale dynamikker

Denne aktivitet fremmer både faglig læring og trivsel gennem bevægelse og samarbejde.`
    
    } else if (profile.includes("Social- og specialpædagogik")) {
      suggestion = `Forslag til aktivitet for ${profile}:

🤝 RELATIONSSKABENDE AKTIVITET
Titel: "Fælles fortællinger"

Formål:
- Styrke professionelle relationer
- Udvikle kommunikative kompetencer
- Fremme inklusion og deltagelse

Aktivitet:
1. Skab trygge rammer for personlige fortællinger
2. Brug kreative metoder (tegning, musik, drama)
3. Fokuser på ressourcer og styrker
4. Dokumenter udvikling i relationer

Etiske overvejelser:
- Respekter grænser og privatliv
- Sikr ligeværdige deltagelsesmuligheder
- Reflekter over magt og ansvar i relationen

Denne aktivitet understøtter professionel kommunikation og relationsdannelse som beskrevet i målene.`
    }

    return new Response(
      JSON.stringify({ suggestion }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Fejl i forslag:', error)
    return new Response(
      JSON.stringify({ error: 'Fejl ved generering af forslag' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})