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

    // Kald OpenAI API for aktivitetsforslag
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API nøgle ikke konfigureret' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const systemPrompt = `Du er en erfaren pædagogisk vejleder der hjælper studerende med at planlægge praktiske læringsaktiviteter. 

Baseret på den givne læreplan og praktikprofil skal du foreslå en konkret, praktisk aktivitet der:
1. Matcher kompetence- og læringsmålene
2. Er relevant for den specifikke praktikprofil
3. Kan gennemføres i praksis
4. Inkluderer evaluering og refleksion

Strukturer dit svar med:
- Titel på aktiviteten
- Formål og læringsmål
- Konkrete trin til gennemførelse
- Materialer/ressourcer
- Evalueringsmetoder
- Refleksionsspørgsmål

Skriv på dansk og vær konkret og handlingsorienteret.`

    const userPrompt = `Praktikprofil: ${profile}

Læreplan og mål:
${text}

Lav et konkret forslag til en læringsaktivitet der passer til denne profil og disse mål.`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API fejl: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const suggestion = openaiData.choices[0]?.message?.content || 'Kunne ikke generere forslag'

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
      }
    )
  }
})