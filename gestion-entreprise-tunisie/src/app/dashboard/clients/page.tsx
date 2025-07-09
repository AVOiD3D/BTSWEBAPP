"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import {
  Plus,
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  FileText,
  Building,
  Eye,
} from "lucide-react";

interface Client {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  code_postal: string;
  tva_number: string;
  created_at: string;
  _count?: {
    factures: number;
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Charger le nombre de factures pour chaque client
      const clientsWithCount = await Promise.all(
        (data || []).map(async (client) => {
          const { count } = await supabase
            .from("factures")
            .select("*", { count: "exact", head: true })
            .eq("client_id", client.id);

          return {
            ...client,
            _count: { factures: count || 0 }
          };
        })
      );

      setClients(clientsWithCount);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId);

      if (error) throw error;

      setClients(prev => prev.filter(client => client.id !== clientId));
      alert("Client supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du client");
    }
  };

  const filteredClients = clients.filter((client) =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone.includes(searchTerm)
  );

  const stats = {
    total: clients.length,
    withEmail: clients.filter(c => c.email).length,
    withPhone: clients.filter(c => c.telephone).length,
    withTVA: clients.filter(c => c.tva_number).length,
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
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestion de votre clientèle
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/nouveau">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Client
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Avec Email</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.withEmail}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Avec Téléphone</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.withPhone}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Avec TVA</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.withTVA}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>
            {filteredClients.length} client(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun client trouvé
              </h3>
              <p className="text-gray-500 mb-6">
                {clients.length === 0 
                  ? "Commencez par ajouter votre premier client"
                  : "Aucun client ne correspond à votre recherche"
                }
              </p>
              <Button asChild>
                <Link href="/dashboard/clients/nouveau">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un client
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/clients/${client.id}/modifier`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteClient(client.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{client.nom}</h3>
                      <div className="text-sm text-gray-500">
                        {client._count?.factures || 0} facture(s)
                      </div>
                    </div>

                    {client.email && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-2" />
                        {client.email}
                      </div>
                    )}

                    {client.telephone && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2" />
                        {client.telephone}
                      </div>
                    )}

                    {(client.ville || client.adresse) && (
                      <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        <div>
                          {client.adresse && <div>{client.adresse}</div>}
                          {client.ville && (
                            <div>
                              {client.code_postal && `${client.code_postal} `}
                              {client.ville}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {client.tva_number && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Building className="h-4 w-4 mr-2" />
                        TVA: {client.tva_number}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href={`/dashboard/factures/nouveau?client=${client.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Nouvelle Facture
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Details Modal */}
      {showDetails && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Détails du client</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDetails(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nom</label>
                <div className="font-medium">{selectedClient.nom}</div>
              </div>

              {selectedClient.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div>{selectedClient.email}</div>
                </div>
              )}

              {selectedClient.telephone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Téléphone</label>
                  <div>{selectedClient.telephone}</div>
                </div>
              )}

              {selectedClient.adresse && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Adresse</label>
                  <div>
                    {selectedClient.adresse}<br />
                    {selectedClient.code_postal && `${selectedClient.code_postal} `}
                    {selectedClient.ville}
                  </div>
                </div>
              )}

              {selectedClient.tva_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Numéro TVA</label>
                  <div>{selectedClient.tva_number}</div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Créé le</label>
                <div>{new Date(selectedClient.created_at).toLocaleDateString('fr-FR')}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Factures</label>
                <div>{selectedClient._count?.factures || 0} facture(s)</div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <Button asChild className="flex-1">
                <Link href={`/dashboard/clients/${selectedClient.id}/modifier`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href={`/dashboard/factures/nouveau?client=${selectedClient.id}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Facturer
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}