"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency, calculateTVA } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Save,
  Send,
  Sparkles,
  Calculator,
  Users,
  Package,
  Calendar,
  Building,
  FileText,
  Loader2,
  Brain,
} from "lucide-react";

interface Client {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  tva_number: string;
}

interface Produit {
  id: string;
  nom: string;
  description: string;
  prix_unitaire: number;
  tva_rate: number;
  stock_quantite: number;
}

interface LigneFacture {
  id: string;
  description: string;
  quantite: number;
  prix_unitaire: number;
  tva_rate: number;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  produit_id?: string;
}

export default function NouvelleFacturePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [user, setUser] = useState<any>(null);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [dateEmission, setDateEmission] = useState(new Date().toISOString().split('T')[0]);
  const [dateEcheance, setDateEcheance] = useState("");
  const [devise, setDevise] = useState("TND");
  const [notes, setNotes] = useState("");
  const [lignes, setLignes] = useState<LigneFacture[]>([
    {
      id: "1",
      description: "",
      quantite: 1,
      prix_unitaire: 0,
      tva_rate: 19,
      montant_ht: 0,
      montant_tva: 0,
      montant_ttc: 0,
    }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { data: userProfile },
        { data: clientsData },
        { data: produitsData }
      ] = await Promise.all([
        supabase.from("users").select("*").eq("id", user.id).single(),
        supabase.from("clients").select("*").eq("user_id", user.id),
        supabase.from("produits").select("*").eq("user_id", user.id)
      ]);

      setUser(userProfile);
      setClients(clientsData || []);
      setProduits(produitsData || []);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  const generateAISuggestions = async (context: string) => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          clientId: selectedClientId,
          userBusiness: user?.company_name || "Entreprise",
        }),
      });

      if (response.ok) {
        const suggestions = await response.json();
        // Appliquer les suggestions IA aux lignes de facture
        if (suggestions.items && suggestions.items.length > 0) {
          const newLignes = suggestions.items.map((item: any, index: number) => ({
            id: (lignes.length + index + 1).toString(),
            description: item.description,
            quantite: item.quantite || 1,
            prix_unitaire: item.prix_unitaire || 0,
            tva_rate: item.tva_rate || 19,
            montant_ht: 0,
            montant_tva: 0,
            montant_ttc: 0,
          }));
          
          setLignes(prev => [...prev, ...newLignes]);
          calculerTotaux();
        }
      }
    } catch (error) {
      console.error("Erreur IA:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const calculerLigne = (ligne: LigneFacture): LigneFacture => {
    const montant_ht = ligne.quantite * ligne.prix_unitaire;
    const montant_tva = calculateTVA(montant_ht, ligne.tva_rate);
    const montant_ttc = montant_ht + montant_tva;

    return {
      ...ligne,
      montant_ht,
      montant_tva,
      montant_ttc,
    };
  };

  const calculerTotaux = () => {
    setLignes(prev => prev.map(ligne => calculerLigne(ligne)));
  };

  const updateLigne = (id: string, field: string, value: any) => {
    setLignes(prev => 
      prev.map(ligne => 
        ligne.id === id 
          ? calculerLigne({ ...ligne, [field]: value })
          : ligne
      )
    );
  };

  const ajouterLigne = () => {
    const newId = (lignes.length + 1).toString();
    setLignes(prev => [...prev, {
      id: newId,
      description: "",
      quantite: 1,
      prix_unitaire: 0,
      tva_rate: 19,
      montant_ht: 0,
      montant_tva: 0,
      montant_ttc: 0,
    }]);
  };

  const supprimerLigne = (id: string) => {
    if (lignes.length > 1) {
      setLignes(prev => prev.filter(ligne => ligne.id !== id));
    }
  };

  const selectionnerProduit = (ligneId: string, produit: Produit) => {
    updateLigne(ligneId, "description", produit.nom);
    updateLigne(ligneId, "prix_unitaire", produit.prix_unitaire);
    updateLigne(ligneId, "tva_rate", produit.tva_rate);
    updateLigne(ligneId, "produit_id", produit.id);
  };

  const totaux = {
    sous_total: lignes.reduce((sum, ligne) => sum + ligne.montant_ht, 0),
    total_tva: lignes.reduce((sum, ligne) => sum + ligne.montant_tva, 0),
    total_ttc: lignes.reduce((sum, ligne) => sum + ligne.montant_ttc, 0),
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non connecté");

    const { data, error } = await supabase.rpc('generate_invoice_number', {
      user_id_param: user.id
    });

    if (error) throw error;
    return data;
  };

  const sauvegarderFacture = async (statut: 'brouillon' | 'envoyee') => {
    if (!selectedClientId) {
      alert("Veuillez sélectionner un client");
      return;
    }

    if (lignes.some(ligne => !ligne.description.trim())) {
      alert("Veuillez remplir toutes les descriptions");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const numeroFacture = await generateInvoiceNumber();

      // Créer la facture
      const { data: factureData, error: factureError } = await supabase
        .from("factures")
        .insert({
          user_id: user.id,
          client_id: selectedClientId,
          numero_facture: numeroFacture,
          date_emission: dateEmission,
          date_echeance: dateEcheance || null,
          devise,
          sous_total: totaux.sous_total,
          total_tva: totaux.total_tva,
          total_ttc: totaux.total_ttc,
          statut,
          notes,
        })
        .select()
        .single();

      if (factureError) throw factureError;

      // Créer les lignes de facture
      const lignesData = lignes.map(ligne => ({
        facture_id: factureData.id,
        produit_id: ligne.produit_id || null,
        description: ligne.description,
        quantite: ligne.quantite,
        prix_unitaire: ligne.prix_unitaire,
        tva_rate: ligne.tva_rate,
        montant_ht: ligne.montant_ht,
        montant_tva: ligne.montant_tva,
        montant_ttc: ligne.montant_ttc,
      }));

      const { error: lignesError } = await supabase
        .from("ligne_factures")
        .insert(lignesData);

      if (lignesError) throw lignesError;

      // Mettre à jour le stock des produits
      for (const ligne of lignes) {
        if (ligne.produit_id) {
          await supabase.rpc('update_product_stock', {
            product_id: ligne.produit_id,
            quantity_sold: ligne.quantite
          });
        }
      }

      alert(`Facture ${numeroFacture} ${statut === 'brouillon' ? 'sauvegardée' : 'envoyée'} avec succès!`);
      router.push("/dashboard/factures");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde de la facture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nouvelle Facture IA</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Créez une facture avec l'assistance de l'intelligence artificielle
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => sauvegarderFacture('brouillon')}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
          <Button 
            onClick={() => sauvegarderFacture('envoyee')}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Envoyer Facture
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client et dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Informations de facturation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client *</Label>
                  <select
                    id="client"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="devise">Devise</Label>
                  <select
                    id="devise"
                    value={devise}
                    onChange={(e) => setDevise(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="TND">🇹🇳 Dinar Tunisien (TND)</option>
                    <option value="EUR">🇪🇺 Euro (EUR)</option>
                    <option value="USD">🇺🇸 Dollar US (USD)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="dateEmission">Date d'émission</Label>
                  <Input
                    id="dateEmission"
                    type="date"
                    value={dateEmission}
                    onChange={(e) => setDateEmission(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="dateEcheance">Date d'échéance</Label>
                  <Input
                    id="dateEcheance"
                    type="date"
                    value={dateEcheance}
                    onChange={(e) => setDateEcheance(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assistance IA */}
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                <Brain className="h-5 w-5 mr-2" />
                Assistant IA Tunisien
              </CardTitle>
              <CardDescription>
                Décrivez votre prestation et l'IA vous suggérera automatiquement les lignes de facture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="aiPrompt">Décrivez votre prestation ou service</Label>
                  <textarea
                    id="aiPrompt"
                    placeholder="Ex: Développement d'un site web e-commerce avec paiement en ligne pour une boutique de vêtements..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 h-20"
                  />
                </div>
                <Button 
                  onClick={(e) => {
                    const prompt = (document.getElementById('aiPrompt') as HTMLTextAreaElement)?.value;
                    if (prompt) generateAISuggestions(prompt);
                  }}
                  disabled={aiLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Générer avec l'IA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lignes de facture */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Lignes de facture
                </CardTitle>
                <Button onClick={ajouterLigne} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter ligne
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lignes.map((ligne, index) => (
                  <div key={ligne.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Ligne {index + 1}</span>
                      {lignes.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => supprimerLigne(ligne.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Sélection rapide de produit */}
                    {produits.length > 0 && (
                      <div>
                        <Label>Sélection rapide (optionnel)</Label>
                        <select
                          onChange={(e) => {
                            const produit = produits.find(p => p.id === e.target.value);
                            if (produit) selectionnerProduit(ligne.id, produit);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                        >
                          <option value="">Choisir un produit existant</option>
                          {produits.map((produit) => (
                            <option key={produit.id} value={produit.id}>
                              {produit.nom} - {formatCurrency(produit.prix_unitaire, devise)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <Label>Description *</Label>
                        <Input
                          value={ligne.description}
                          onChange={(e) => updateLigne(ligne.id, "description", e.target.value)}
                          placeholder="Description du service/produit"
                        />
                      </div>

                      <div>
                        <Label>Quantité</Label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={ligne.quantite}
                          onChange={(e) => updateLigne(ligne.id, "quantite", parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <Label>Prix unitaire ({devise})</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.001"
                          value={ligne.prix_unitaire}
                          onChange={(e) => updateLigne(ligne.id, "prix_unitaire", parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <Label>TVA (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={ligne.tva_rate}
                          onChange={(e) => updateLigne(ligne.id, "tva_rate", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">HT:</span>
                        <span className="font-medium ml-2">
                          {formatCurrency(ligne.montant_ht, devise)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">TVA:</span>
                        <span className="font-medium ml-2">
                          {formatCurrency(ligne.montant_tva, devise)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">TTC:</span>
                        <span className="font-bold ml-2">
                          {formatCurrency(ligne.montant_ttc, devise)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes et conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes additionnelles, conditions de paiement, etc."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 h-24"
              />
            </CardContent>
          </Card>
        </div>

        {/* Résumé */}
        <div className="space-y-6">
          {/* Totaux */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Résumé de la facture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Sous-total HT:</span>
                  <span className="font-medium">
                    {formatCurrency(totaux.sous_total, devise)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>TVA totale:</span>
                  <span className="font-medium">
                    {formatCurrency(totaux.total_tva, devise)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC:</span>
                    <span className="text-blue-600">
                      {formatCurrency(totaux.total_ttc, devise)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <div className="font-medium mb-2">🇹🇳 Conformité Tunisienne</div>
                  <ul className="space-y-1 text-xs">
                    <li>✓ TVA 19% (taux standard)</li>
                    <li>✓ Calculs certifiés conformes</li>
                    <li>✓ Numérotation légale automatique</li>
                    <li>✓ QR code fiscal (à venir)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations entreprise */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Votre entreprise
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="font-medium">{user.company_name || `${user.prenom} ${user.nom}`}</div>
                {user.company_address && (
                  <div className="text-gray-600 dark:text-gray-400">{user.company_address}</div>
                )}
                {user.company_tva_number && (
                  <div className="text-gray-600 dark:text-gray-400">
                    TVA: {user.company_tva_number}
                  </div>
                )}
                <div className="text-gray-600 dark:text-gray-400">{user.email}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}