"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Send,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface Facture {
  id: string;
  numero_facture: string;
  date_emission: string;
  date_echeance: string;
  devise: string;
  sous_total: number;
  total_tva: number;
  total_ttc: number;
  statut: 'brouillon' | 'envoyee' | 'payee' | 'annulee';
  clients: { nom: string } | null;
  created_at: string;
}

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadFactures();
  }, []);

  const loadFactures = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("factures")
        .select(`
          *,
          clients:client_id (nom)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFactures(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des factures:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFactures = factures.filter((facture) => {
    const matchesSearch = 
      facture.numero_facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (facture.clients?.nom || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || facture.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (statut: string) => {
    const styles = {
      brouillon: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      envoyee: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      payee: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      annulee: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    const labels = {
      brouillon: "Brouillon",
      envoyee: "Envoyée",
      payee: "Payée",
      annulee: "Annulée",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[statut as keyof typeof styles]}`}>
        {labels[statut as keyof typeof labels]}
      </span>
    );
  };

  const stats = {
    total: factures.length,
    brouillons: factures.filter(f => f.statut === 'brouillon').length,
    envoyees: factures.filter(f => f.statut === 'envoyee').length,
    payees: factures.filter(f => f.statut === 'payee').length,
    totalCA: factures.reduce((sum, f) => sum + (f.total_ttc || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Factures</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestion de vos factures avec IA intégrée
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/factures/nouveau">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Facture IA
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Brouillons</span>
            </div>
            <div className="text-2xl font-bold text-gray-600">{stats.brouillons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Envoyées</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.envoyees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Payées</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.payees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">CA Total</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(stats.totalCA)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par numéro ou client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="brouillon">Brouillons</option>
                <option value="envoyee">Envoyées</option>
                <option value="payee">Payées</option>
                <option value="annulee">Annulées</option>
              </select>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Factures List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
          <CardDescription>
            {filteredFactures.length} facture(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFactures.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune facture trouvée
              </h3>
              <p className="text-gray-500 mb-6">
                {factures.length === 0 
                  ? "Commencez par créer votre première facture avec l'IA"
                  : "Aucune facture ne correspond à vos critères de recherche"
                }
              </p>
              <Button asChild>
                <Link href="/dashboard/factures/nouveau">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une facture IA
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFactures.map((facture) => (
                <div
                  key={facture.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">
                        {facture.numero_facture}
                      </div>
                      <div className="text-sm text-gray-500">
                        {facture.clients?.nom || "Client non spécifié"}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(new Date(facture.date_emission))}
                        </div>
                        {facture.date_echeance && (
                          <div className="flex items-center text-xs text-gray-500">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Échéance: {formatDate(new Date(facture.date_echeance))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {formatCurrency(facture.total_ttc, facture.devise)}
                      </div>
                      <div className="text-sm text-gray-500">
                        TVA: {formatCurrency(facture.total_tva, facture.devise)}
                      </div>
                    </div>

                    <div>
                      {getStatusBadge(facture.statut)}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}