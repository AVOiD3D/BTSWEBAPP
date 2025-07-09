export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nom: string
          prenom: string
          company_name: string | null
          company_logo_url: string | null
          company_address: string | null
          company_tva_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nom: string
          prenom: string
          company_name?: string | null
          company_logo_url?: string | null
          company_address?: string | null
          company_tva_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nom?: string
          prenom?: string
          company_name?: string | null
          company_logo_url?: string | null
          company_address?: string | null
          company_tva_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          nom: string
          email: string | null
          telephone: string | null
          adresse: string | null
          ville: string | null
          code_postal: string | null
          tva_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nom: string
          email?: string | null
          telephone?: string | null
          adresse?: string | null
          ville?: string | null
          code_postal?: string | null
          tva_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nom?: string
          email?: string | null
          telephone?: string | null
          adresse?: string | null
          ville?: string | null
          code_postal?: string | null
          tva_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      produits: {
        Row: {
          id: string
          user_id: string
          nom: string
          description: string | null
          prix_unitaire: number
          devise: string
          stock_quantite: number
          tva_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nom: string
          description?: string | null
          prix_unitaire: number
          devise?: string
          stock_quantite?: number
          tva_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nom?: string
          description?: string | null
          prix_unitaire?: number
          devise?: string
          stock_quantite?: number
          tva_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      factures: {
        Row: {
          id: string
          user_id: string
          client_id: string
          numero_facture: string
          date_emission: string
          date_echeance: string | null
          devise: string
          taux_change: number
          sous_total: number
          total_tva: number
          total_ttc: number
          statut: 'brouillon' | 'envoyee' | 'payee' | 'annulee'
          notes: string | null
          qr_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          numero_facture: string
          date_emission: string
          date_echeance?: string | null
          devise?: string
          taux_change?: number
          sous_total: number
          total_tva: number
          total_ttc: number
          statut?: 'brouillon' | 'envoyee' | 'payee' | 'annulee'
          notes?: string | null
          qr_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          numero_facture?: string
          date_emission?: string
          date_echeance?: string | null
          devise?: string
          taux_change?: number
          sous_total?: number
          total_tva?: number
          total_ttc?: number
          statut?: 'brouillon' | 'envoyee' | 'payee' | 'annulee'
          notes?: string | null
          qr_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ligne_factures: {
        Row: {
          id: string
          facture_id: string
          produit_id: string | null
          description: string
          quantite: number
          prix_unitaire: number
          tva_rate: number
          montant_ht: number
          montant_tva: number
          montant_ttc: number
          created_at: string
        }
        Insert: {
          id?: string
          facture_id: string
          produit_id?: string | null
          description: string
          quantite: number
          prix_unitaire: number
          tva_rate?: number
          montant_ht: number
          montant_tva: number
          montant_ttc: number
          created_at?: string
        }
        Update: {
          id?: string
          facture_id?: string
          produit_id?: string | null
          description?: string
          quantite?: number
          prix_unitaire?: number
          tva_rate?: number
          montant_ht?: number
          montant_tva?: number
          montant_ttc?: number
          created_at?: string
        }
      }
    }
  }
}