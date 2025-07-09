-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE statut_facture AS ENUM ('brouillon', 'envoyee', 'payee', 'annulee');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    company_name TEXT,
    company_logo_url TEXT,
    company_address TEXT,
    company_tva_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    nom TEXT NOT NULL,
    email TEXT,
    telephone TEXT,
    adresse TEXT,
    ville TEXT,
    code_postal TEXT,
    tva_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produits table
CREATE TABLE produits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    nom TEXT NOT NULL,
    description TEXT,
    prix_unitaire DECIMAL(10,3) NOT NULL DEFAULT 0,
    devise TEXT NOT NULL DEFAULT 'TND',
    stock_quantite INTEGER NOT NULL DEFAULT 0,
    tva_rate DECIMAL(5,2) NOT NULL DEFAULT 19.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Factures table
CREATE TABLE factures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    numero_facture TEXT NOT NULL,
    date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE,
    devise TEXT NOT NULL DEFAULT 'TND',
    taux_change DECIMAL(10,6) NOT NULL DEFAULT 1.0,
    sous_total DECIMAL(12,3) NOT NULL DEFAULT 0,
    total_tva DECIMAL(12,3) NOT NULL DEFAULT 0,
    total_ttc DECIMAL(12,3) NOT NULL DEFAULT 0,
    statut statut_facture NOT NULL DEFAULT 'brouillon',
    notes TEXT,
    qr_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, numero_facture)
);

-- Ligne factures table
CREATE TABLE ligne_factures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facture_id UUID REFERENCES factures(id) ON DELETE CASCADE NOT NULL,
    produit_id UUID REFERENCES produits(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantite DECIMAL(10,3) NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(10,3) NOT NULL DEFAULT 0,
    tva_rate DECIMAL(5,2) NOT NULL DEFAULT 19.00,
    montant_ht DECIMAL(12,3) NOT NULL DEFAULT 0,
    montant_tva DECIMAL(12,3) NOT NULL DEFAULT 0,
    montant_ttc DECIMAL(12,3) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paiements table
CREATE TABLE paiements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facture_id UUID REFERENCES factures(id) ON DELETE CASCADE NOT NULL,
    montant DECIMAL(12,3) NOT NULL,
    devise TEXT NOT NULL DEFAULT 'TND',
    date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
    methode_paiement TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produits_updated_at BEFORE UPDATE ON produits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_factures_updated_at BEFORE UPDATE ON factures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE ligne_factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Clients policies
CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);

-- Produits policies
CREATE POLICY "Users can view own products" ON produits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON produits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON produits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON produits
    FOR DELETE USING (auth.uid() = user_id);

-- Factures policies
CREATE POLICY "Users can view own invoices" ON factures
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON factures
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON factures
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON factures
    FOR DELETE USING (auth.uid() = user_id);

-- Ligne factures policies
CREATE POLICY "Users can view own invoice lines" ON ligne_factures
    FOR SELECT USING (
        auth.uid() = (SELECT user_id FROM factures WHERE id = facture_id)
    );

CREATE POLICY "Users can insert own invoice lines" ON ligne_factures
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT user_id FROM factures WHERE id = facture_id)
    );

CREATE POLICY "Users can update own invoice lines" ON ligne_factures
    FOR UPDATE USING (
        auth.uid() = (SELECT user_id FROM factures WHERE id = facture_id)
    );

CREATE POLICY "Users can delete own invoice lines" ON ligne_factures
    FOR DELETE USING (
        auth.uid() = (SELECT user_id FROM factures WHERE id = facture_id)
    );

-- Paiements policies
CREATE POLICY "Users can view own payments" ON paiements
    FOR SELECT USING (
        auth.uid() = (SELECT user_id FROM factures WHERE id = facture_id)
    );

CREATE POLICY "Users can insert own payments" ON paiements
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT user_id FROM factures WHERE id = facture_id)
    );

CREATE POLICY "Users can update own payments" ON paiements
    FOR UPDATE USING (
        auth.uid() = (SELECT user_id FROM factures WHERE id = facture_id)
    );

CREATE POLICY "Users can delete own payments" ON paiements
    FOR DELETE USING (
        auth.uid() = (SELECT user_id FROM factures WHERE id = facture_id)
    );

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_number INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(
        CAST(
            SPLIT_PART(numero_facture, '-', 3) AS INTEGER
        )
    ), 0) + 1
    INTO next_number
    FROM factures 
    WHERE user_id = user_id_param 
    AND numero_facture LIKE 'FAC-' || current_year || '-%';
    
    RETURN 'FAC-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(product_id UUID, quantity_sold DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE produits 
    SET stock_quantite = GREATEST(0, stock_quantite - quantity_sold)
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get exchange rates (placeholder for future implementation)
CREATE OR REPLACE FUNCTION get_exchange_rate(from_currency TEXT, to_currency TEXT)
RETURNS DECIMAL AS $$
BEGIN
    -- Pour l'instant, retourne des taux fixes
    -- À remplacer par une intégration d'API de taux de change
    CASE 
        WHEN from_currency = to_currency THEN RETURN 1.0;
        WHEN from_currency = 'TND' AND to_currency = 'EUR' THEN RETURN 0.30;
        WHEN from_currency = 'EUR' AND to_currency = 'TND' THEN RETURN 3.33;
        WHEN from_currency = 'TND' AND to_currency = 'USD' THEN RETURN 0.33;
        WHEN from_currency = 'USD' AND to_currency = 'TND' THEN RETURN 3.03;
        WHEN from_currency = 'EUR' AND to_currency = 'USD' THEN RETURN 1.10;
        WHEN from_currency = 'USD' AND to_currency = 'EUR' THEN RETURN 0.91;
        ELSE RETURN 1.0;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_factures_user_id ON factures(user_id);
CREATE INDEX IF NOT EXISTS idx_factures_numero ON factures(numero_facture);
CREATE INDEX IF NOT EXISTS idx_factures_date_emission ON factures(date_emission);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_produits_user_id ON produits(user_id);
CREATE INDEX IF NOT EXISTS idx_ligne_factures_facture_id ON ligne_factures(facture_id);
CREATE INDEX IF NOT EXISTS idx_paiements_facture_id ON paiements(facture_id);