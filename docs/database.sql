-- ==========================================
-- 1. Custom Enums
-- ==========================================
CREATE TYPE member_status AS ENUM ('Active', 'Closed', 'Defaulted');
CREATE TYPE installment_type AS ENUM ('Daily', 'Weekly', 'Monthly');
CREATE TYPE installment_status AS ENUM ('Pending', 'Paid', 'Partial', 'Overdue');

-- ==========================================
-- 2. Tables
-- ==========================================

-- Table 1: profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table 2: members
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    mobile_no TEXT NOT NULL,
    status member_status DEFAULT 'Active'::member_status NOT NULL,
    family_photo_url TEXT,
    residence_address TEXT,
    permanent_address TEXT,
    company_name TEXT,
    company_address TEXT,
    vehicle_details TEXT,
    total_family_members INTEGER DEFAULT 0,
    
    -- Financial Details
    loan_amount DECIMAL(12, 2) NOT NULL,
    loan_date DATE NOT NULL,
    file_charge DECIMAL(12, 2) DEFAULT 0,
    benefit_amount DECIMAL(12, 2) DEFAULT 0,
    installment_amount DECIMAL(12, 2) NOT NULL,
    installment_type installment_type NOT NULL,
    total_installments INTEGER NOT NULL,
    installment_start_date DATE NOT NULL,
    installment_end_date DATE,
    
    -- Signatures & Guarantor
    member_signature_url TEXT,
    guarantor_name TEXT,
    guarantor_mobile TEXT,
    guarantor_signature_url TEXT,
    
    -- Document Availability Flags
    aadhar_available BOOLEAN DEFAULT false,
    pan_available BOOLEAN DEFAULT false,
    family_id_available BOOLEAN DEFAULT false,
    original_signed_cheques INTEGER DEFAULT 0,
    whatsapp_mobile TEXT,
    loan_agreement_available BOOLEAN DEFAULT false,
    promissory_note_available BOOLEAN DEFAULT false,
    email TEXT,
    email_password TEXT,
    loan_transaction_proof BOOLEAN DEFAULT false,
    rc_or_gold_photos BOOLEAN DEFAULT false,
    
    remarks TEXT,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table 3: member_family
CREATE TABLE member_family (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relation TEXT NOT NULL,
    profession TEXT,
    income DECIMAL(12, 2) DEFAULT 0,
    mobile_no TEXT,
    is_deleted BOOLEAN DEFAULT false NOT NULL
);

-- Table 4: member_installments
CREATE TABLE member_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    installment_no INTEGER NOT NULL,
    due_date DATE NOT NULL,
    received_date DATE,
    status installment_status DEFAULT 'Pending'::installment_status NOT NULL,
    installment_amount DECIMAL(12, 2) NOT NULL,
    amount_paid DECIMAL(12, 2) DEFAULT 0,
    penalty_amount DECIMAL(12, 2) DEFAULT 0,
    cheque_received BOOLEAN DEFAULT false,
    remarks TEXT,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- 3. Indexes for Performance
-- ==========================================
CREATE INDEX idx_members_profile_id ON members(profile_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_is_deleted ON members(is_deleted);
CREATE INDEX idx_member_family_member_id ON member_family(member_id);
CREATE INDEX idx_member_installments_member_id ON member_installments(member_id);
CREATE INDEX idx_member_installments_status ON member_installments(status);


-- ==========================================
-- 4. Triggers (Update `updated_at` column)
-- ==========================================

-- Function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_members_modtime
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();


-- ==========================================
-- 5. Row Level Security (RLS) Policies
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_family ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_installments ENABLE ROW LEVEL SECURITY;

-- Profile Policies
CREATE POLICY "Users can view their own profile."
    ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile."
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- Members Policies
CREATE POLICY "Users can view their own members."
    ON members FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own members."
    ON members FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own members."
    ON members FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own members."
    ON members FOR DELETE USING (auth.uid() = profile_id);

-- Member Family Policies (Accessed through Member's profile_id)
CREATE POLICY "Users can view family of their members."
    ON member_family FOR SELECT 
    USING (EXISTS (SELECT 1 FROM members WHERE members.id = member_family.member_id AND members.profile_id = auth.uid()));

CREATE POLICY "Users can insert family to their members."
    ON member_family FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM members WHERE members.id = member_family.member_id AND members.profile_id = auth.uid()));

CREATE POLICY "Users can update family of their members."
    ON member_family FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM members WHERE members.id = member_family.member_id AND members.profile_id = auth.uid()));

CREATE POLICY "Users can delete family of their members."
    ON member_family FOR DELETE 
    USING (EXISTS (SELECT 1 FROM members WHERE members.id = member_family.member_id AND members.profile_id = auth.uid()));

-- Member Installments Policies (Accessed through Member's profile_id)
CREATE POLICY "Users can view installments of their members."
    ON member_installments FOR SELECT 
    USING (EXISTS (SELECT 1 FROM members WHERE members.id = member_installments.member_id AND members.profile_id = auth.uid()));

CREATE POLICY "Users can insert installments to their members."
    ON member_installments FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM members WHERE members.id = member_installments.member_id AND members.profile_id = auth.uid()));

CREATE POLICY "Users can update installments of their members."
    ON member_installments FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM members WHERE members.id = member_installments.member_id AND members.profile_id = auth.uid()));

CREATE POLICY "Users can delete installments of their members."
    ON member_installments FOR DELETE 
    USING (EXISTS (SELECT 1 FROM members WHERE members.id = member_installments.member_id AND members.profile_id = auth.uid()));


-- ==========================================
-- 6. Storage Buckets (Optional Setup via SQL)
-- ==========================================
-- Insert the bucket record (if using Supabase storage via SQL)
INSERT INTO storage.buckets (id, name, public) VALUES ('finance_documents', 'finance_documents', false) ON CONFLICT DO NOTHING;

-- Storage Policy: Users can only upload and view their own files (Assuming user auth)
CREATE POLICY "Authenticated users can upload files" 
    ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'finance_documents');

CREATE POLICY "Authenticated users can read files" 
    ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'finance_documents');
