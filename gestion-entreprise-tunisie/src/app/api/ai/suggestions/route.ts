import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { context, clientId, userBusiness } = await request.json();

    if (!context) {
      return NextResponse.json(
        { error: 'Le contexte est requis' },
        { status: 400 }
      );
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: 'Configuration IA manquante' },
        { status: 500 }
      );
    }

    // Prompt optimisé pour le contexte tunisien
    const prompt = `
Tu es un assistant spécialisé dans la facturation pour les entreprises tunisiennes. 
Génère des lignes de facture détaillées basées sur la description suivante.

CONTEXTE:
- Entreprise: ${userBusiness}
- Description du projet/service: ${context}
- Pays: Tunisie (TVA standard 19%)

INSTRUCTIONS:
1. Analyse la description et crée entre 2-5 lignes de facture pertinentes
2. Utilise des prix réalistes en Dinars Tunisiens (TND)
3. Respecte la TVA tunisienne de 19% (sauf exceptions justifiées)
4. Utilise des descriptions professionnelles en français
5. Sois précis sur les quantités et unités

RÉPONSE ATTENDUE (JSON uniquement):
{
  "items": [
    {
      "description": "Description détaillée du service/produit",
      "quantite": 1,
      "prix_unitaire": 0,
      "tva_rate": 19
    }
  ]
}

Réponds UNIQUEMENT avec le JSON, sans texte additionnel.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'Gestion Entreprise Tunisie',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('Erreur OpenRouter:', await response.text());
      return NextResponse.json(
        { error: 'Erreur lors de la génération IA' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'Réponse IA vide' },
        { status: 500 }
      );
    }

    try {
      // Nettoyer la réponse et extraire le JSON
      const cleanedResponse = aiResponse.trim();
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('Pas de JSON trouvé dans la réponse');
      }

      const jsonResponse = cleanedResponse.slice(jsonStart, jsonEnd);
      const suggestions = JSON.parse(jsonResponse);

      // Validation des suggestions
      if (!suggestions.items || !Array.isArray(suggestions.items)) {
        throw new Error('Format de réponse invalide');
      }

      // Validation et nettoyage de chaque item
      const validatedItems = suggestions.items
        .filter((item: any) => item.description && item.description.trim())
        .map((item: any) => ({
          description: item.description.trim(),
          quantite: Math.max(0.01, parseFloat(item.quantite) || 1),
          prix_unitaire: Math.max(0, parseFloat(item.prix_unitaire) || 0),
          tva_rate: Math.min(100, Math.max(0, parseFloat(item.tva_rate) || 19)),
        }));

      return NextResponse.json({
        items: validatedItems,
        source: 'openrouter_ai',
        model: 'claude-3-haiku',
      });

    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      
      // Fallback: suggestions par défaut basées sur le contexte
      const fallbackItems = generateFallbackSuggestions(context);
      
      return NextResponse.json({
        items: fallbackItems,
        source: 'fallback',
        note: 'Suggestions générées localement suite à une erreur IA',
      });
    }

  } catch (error) {
    console.error('Erreur API suggestions:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

function generateFallbackSuggestions(context: string) {
  const lowerContext = context.toLowerCase();
  
  // Suggestions basées sur des mots-clés
  if (lowerContext.includes('site web') || lowerContext.includes('website')) {
    return [
      {
        description: "Conception et développement du site web",
        quantite: 1,
        prix_unitaire: 2500,
        tva_rate: 19
      },
      {
        description: "Intégration système de paiement",
        quantite: 1,
        prix_unitaire: 800,
        tva_rate: 19
      },
      {
        description: "Formation et documentation",
        quantite: 4,
        prix_unitaire: 150,
        tva_rate: 19
      }
    ];
  }
  
  if (lowerContext.includes('formation') || lowerContext.includes('cours')) {
    return [
      {
        description: "Formation professionnelle personnalisée",
        quantite: 8,
        prix_unitaire: 200,
        tva_rate: 19
      },
      {
        description: "Support et documentation",
        quantite: 1,
        prix_unitaire: 300,
        tva_rate: 19
      }
    ];
  }
  
  if (lowerContext.includes('consultant') || lowerContext.includes('conseil')) {
    return [
      {
        description: "Consultation et analyse",
        quantite: 10,
        prix_unitaire: 180,
        tva_rate: 19
      },
      {
        description: "Rapport et recommandations",
        quantite: 1,
        prix_unitaire: 500,
        tva_rate: 19
      }
    ];
  }
  
  // Suggestion générique
  return [
    {
      description: "Prestation de service professionnelle",
      quantite: 1,
      prix_unitaire: 1000,
      tva_rate: 19
    },
    {
      description: "Frais additionnels et support",
      quantite: 1,
      prix_unitaire: 200,
      tva_rate: 19
    }
  ];
}