"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Package,
  DollarSign,
  Plus,
  Eye,
  Calendar,
  Building,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalFactures: number;
  chiffreAffaires: number;
  clientsTotal: number;
  produitsStock: number;
  facturesEnAttente: number;
  paiementsEnRetard: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFactures: 0,
    chiffreAffaires: 0,
    clientsTotal: 0,
    produitsStock: 0,
    facturesEnAttente: 0,
    paiementsEnRetard: 0,
  });
  const [recentFactures, setRecentFactures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Charger les statistiques
      const [
        { data: factures },
        { data: clients },
        { data: produits },
        { data: userProfile }
      ] = await Promise.all([
        supabase.from("factures").select("*").eq("user_id", user.id),
        supabase.from("clients").select("*").eq("user_id", user.id),
        supabase.from("produits").select("*").eq("user_id", user.id),
        supabase.from("users").select("*").eq("id", user.id).single()
      ]);

      setUser(userProfile);

      const totalFactures = factures?.length || 0;
      const chiffreAffaires = factures?.reduce((sum, f) => sum + (f.total_ttc || 0), 0) || 0;
      const clientsTotal = clients?.length || 0;
      const produitsStock = produits?.reduce((sum, p) => sum + (p.stock_quantite || 0), 0) || 0;
      const facturesEnAttente = factures?.filter(f => f.statut === 'envoyee').length || 0;
      const paiementsEnRetard = factures?.filter(f => 
        f.statut === 'envoyee' && 
        f.date_echeance && 
        new Date(f.date_echeance) < new Date()
      ).length || 0;

      setStats({
        totalFactures,
        chiffreAffaires,
        clientsTotal,
        produitsStock,
        facturesEnAttente,
        paiementsEnRetard,
      });

      // Charger les factures récentes
      const { data: recentInvoices } = await supabase
        .from("factures")
        .select(`
          *,
          clients:client_id (nom)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentFactures(recentInvoices || []);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Chiffre d'Affaires",
      value: formatCurrency(stats.chiffreAffaires),
      icon: DollarSign,
      description: "Total des ventes",
      trend: "+12%",
      color: "text-green-600",
    },
    {
      title: "Factures",
      value: stats.totalFactures.toString(),
      icon: FileText,
      description: "Factures émises",
      trend: "+3",
      color: "text-blue-600",
    },
    {
      title: "Clients",
      value: stats.clientsTotal.toString(),
      icon: Users,
      description: "Clients actifs",
      trend: "+2",
      color: "text-purple-600",
    },
    {
      title: "Stock",
      value: stats.produitsStock.toString(),
      icon: Package,
      description: "Produits en stock",
      trend: "-5%",
      color: "text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Bienvenue, {user?.prenom || "Utilisateur"} ! 👋
            </h1>
            <p className="mt-2 opacity-90">
              {user?.company_name || "Votre entreprise"} - Tableau de bord
            </p>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(new Date())}
              </div>
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-1" />
                🇹🇳 Tunisie
              </div>
            </div>
          </div>
          <div className="text-right">
            <Button asChild className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/dashboard/factures/nouveau">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Facture IA
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">{card.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {(stats.facturesEnAttente > 0 || stats.paiementsEnRetard > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.facturesEnAttente > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <CardHeader>
                <CardTitle className="text-orange-800 dark:text-orange-200">
                  Factures en attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.facturesEnAttente}
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  factures en attente de paiement
                </p>
              </CardContent>
            </Card>
          )}
          
          {stats.paiementsEnRetard > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-200">
                  Paiements en retard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.paiementsEnRetard}
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  factures échues
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Factures récentes</CardTitle>
              <CardDescription>
                Dernières factures émises
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/factures">
                <Eye className="h-4 w-4 mr-2" />
                Voir tout
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentFactures.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune facture trouvée</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/factures/nouveau">
                  Créer votre première facture IA
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentFactures.map((facture) => (
                <div
                  key={facture.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      facture.statut === 'payee' ? 'bg-green-500' :
                      facture.statut === 'envoyee' ? 'bg-yellow-500' :
                      facture.statut === 'brouillon' ? 'bg-gray-500' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">{facture.numero_facture}</div>
                      <div className="text-sm text-gray-500">
                        {facture.clients?.nom || "Client inconnu"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(facture.total_ttc, facture.devise)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(new Date(facture.date_emission))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Accès rapide aux fonctions principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/dashboard/factures/nouveau" className="flex flex-col items-center space-y-2">
                <FileText className="h-8 w-8" />
                <span>Nouvelle Facture IA</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/dashboard/clients/nouveau" className="flex flex-col items-center space-y-2">
                <Users className="h-8 w-8" />
                <span>Ajouter Client</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/dashboard/produits/nouveau" className="flex flex-col items-center space-y-2">
                <Package className="h-8 w-8" />
                <span>Ajouter Produit</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}