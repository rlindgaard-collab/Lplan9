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

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'Ingen fil uploadet' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Læs PDF indhold som tekst (simpel ekstraktion)
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Konverter til tekst (dette er en simpel tilgang - i praksis ville du bruge en PDF parser)
    let extractedText = ""
    try {
      // Simpel tekst ekstraktion - i virkeligheden ville du bruge pdf-parse eller lignende
      const decoder = new TextDecoder('utf-8', { fatal: false })
      extractedText = decoder.decode(uint8Array)
      
      // Hvis ingen tekst kunne ekstraheres, brug filinfo
      if (!extractedText || extractedText.length < 50) {
        extractedText = `Læreplan dokument: ${file.name} (${Math.round(file.size / 1024)} KB)`
      }
    } catch (e) {
      extractedText = `Læreplan dokument: ${file.name} (${Math.round(file.size / 1024)} KB)`
    }

    // Kald OpenAI API for opsummering
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API nøgle ikke konfigureret' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

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
            content: 'Du er en ekspert i pædagogiske læreplaner. Lav en kort, struktureret opsummering af den uploadede læreplan på dansk. Fokuser på hovedmål, kompetencer og vigtige elementer.'
          },
          {
            role: 'user',
            content: `Lav en opsummering af denne læreplan:\n\n${extractedText.substring(0, 3000)}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API fejl: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const summary = openaiData.choices[0]?.message?.content || 'Kunne ikke generere opsummering'

    return new Response(
      JSON.stringify({ summary }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Fejl i pdfsummary:', error)
    return new Response(
      JSON.stringify({ error: 'Fejl ved behandling af PDF' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})