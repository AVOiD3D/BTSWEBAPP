"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import {
  Save,
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  Building,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function NouveauClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    code_postal: "",
    tva_number: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      alert("Le nom du client est obligatoire");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const { data, error } = await supabase
        .from("clients")
        .insert({
          user_id: user.id,
          ...formData,
        })
        .select()
        .single();

      if (error) throw error;

      alert("Client ajouté avec succès !");
      router.push("/dashboard/clients");
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      alert("Erreur lors de l'ajout du client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nouveau Client</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ajouter un nouveau client à votre base de données
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Informations principales
            </CardTitle>
            <CardDescription>
              Informations de base du client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom du client *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleChange("nom", e.target.value)}
                placeholder="Nom complet ou raison sociale"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Informations de contact
            </CardTitle>
            <CardDescription>
              Moyens de communication avec le client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="client@exemple.com"
              />
            </div>

            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => handleChange("telephone", e.target.value)}
                placeholder="+216 XX XXX XXX"
              />
            </div>
          </CardContent>
        </Card>

        {/* Adresse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Adresse
            </CardTitle>
            <CardDescription>
              Adresse de facturation et de livraison
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => handleChange("adresse", e.target.value)}
                placeholder="Numéro, rue, quartier..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code_postal">Code postal</Label>
                <Input
                  id="code_postal"
                  value={formData.code_postal}
                  onChange={(e) => handleChange("code_postal", e.target.value)}
                  placeholder="1000"
                />
              </div>

              <div>
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  value={formData.ville}
                  onChange={(e) => handleChange("ville", e.target.value)}
                  placeholder="Tunis"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations fiscales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Informations fiscales
            </CardTitle>
            <CardDescription>
              Informations nécessaires pour la facturation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tva_number">Numéro TVA</Label>
              <Input
                id="tva_number"
                value={formData.tva_number}
                onChange={(e) => handleChange("tva_number", e.target.value)}
                placeholder="TVA123456789"
              />
              <p className="text-sm text-gray-500 mt-1">
                Obligatoire pour les entreprises assujetties à la TVA
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" asChild>
            <Link href="/dashboard/clients">
              Annuler
            </Link>
          </Button>

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Enregistrer le client
            </Button>
          </div>
        </div>
      </form>

      {/* Tips */}
      <Card className="max-w-2xl bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <div className="font-medium mb-2">💡 Conseils</div>
            <ul className="space-y-1 text-xs">
              <li>• Seul le nom est obligatoire, vous pouvez compléter les autres informations plus tard</li>
              <li>• L'email permettra d'envoyer automatiquement les factures</li>
              <li>• Le numéro TVA est important pour les entreprises</li>
              <li>• Une adresse complète facilite la facturation et la livraison</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}