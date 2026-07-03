/*
# Enterprise Cyber Threat Intelligence & OSINT Platform - Core Schema

## Overview
Creates the complete database schema for a cyber threat intelligence platform.
Single-tenant demo (no auth screen) — all tables use anon+authenticated policies
so the anon-key frontend can read/write shared threat intelligence data.

## New Tables
1. `iocs` — Indicators of Compromise (IP, URL, domain, hash, email)
2. `threats` — Detected threats and incidents
3. `scam_reports` — Scam detection submissions and results
4. `osint_investigations` — OSINT investigation records
5. `threat_actors` — Threat actor profiles
6. `campaigns` — Threat campaign tracking
7. `threat_feeds` — Aggregated external threat feed entries
8. `activity_logs` — Audit/activity log entries
9. `reports` — Generated investigation/threat reports
10. `notifications` — Platform notifications
11. `ai_analyses` — AI analyst chat sessions and analyses
12. `mitre_techniques` — MITRE ATT&CK technique reference

## Security
- RLS enabled on all tables.
- anon+authenticated CRUD (intentionally shared demo data).
*/

-- IOCs (Indicators of Compromise)
CREATE TABLE IF NOT EXISTS iocs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('ip','url','domain','hash','email')),
  value text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  confidence integer NOT NULL DEFAULT 50 CHECK (confidence BETWEEN 0 AND 100),
  source text,
  tags text[] DEFAULT '{}',
  mitre_tactics text[] DEFAULT '{}',
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','retired','false_positive','pending')),
  description text,
  country text,
  asn text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_iocs_type ON iocs(type);
CREATE INDEX IF NOT EXISTS idx_iocs_value ON iocs(value);
CREATE INDEX IF NOT EXISTS idx_iocs_severity ON iocs(severity);
CREATE INDEX IF NOT EXISTS idx_iocs_status ON iocs(status);

-- Threats / Incidents
CREATE TABLE IF NOT EXISTS threats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('malware','phishing','scam','intrusion','ddos','botnet','ransomware','data_breach','supply_chain','other')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','contained','resolved','false_positive')),
  source text,
  affected_assets text[] DEFAULT '{}',
  mitre_techniques text[] DEFAULT '{}',
  ioc_ids uuid[] DEFAULT '{}',
  country text,
  risk_score integer NOT NULL DEFAULT 50 CHECK (risk_score BETWEEN 0 AND 100),
  detected_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_threats_severity ON threats(severity);
CREATE INDEX IF NOT EXISTS idx_threats_status ON threats(status);
CREATE INDEX IF NOT EXISTS idx_threats_category ON threats(category);
CREATE INDEX IF NOT EXISTS idx_threats_detected_at ON threats(detected_at);

-- Scam Reports
CREATE TABLE IF NOT EXISTS scam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_type text NOT NULL CHECK (input_type IN ('url','email','sms','phone','website','text')),
  input_value text NOT NULL,
  scam_type text CHECK (scam_type IN ('phishing','investment','crypto','job','upi','lottery','bank','brand_impersonation','other')),
  risk_score integer NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  confidence integer NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
  is_scam boolean NOT NULL DEFAULT false,
  threat_indicators text[] DEFAULT '{}',
  suspicious_keywords text[] DEFAULT '{}',
  ai_explanation text,
  domain_age_days integer,
  ssl_valid boolean,
  brand_impersonated text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scam_reports_input_type ON scam_reports(input_type);
CREATE INDEX IF NOT EXISTS idx_scam_reports_is_scam ON scam_reports(is_scam);
CREATE INDEX IF NOT EXISTS idx_scam_reports_created_at ON scam_reports(created_at);

-- OSINT Investigations
CREATE TABLE IF NOT EXISTS osint_investigations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_type text NOT NULL CHECK (investigation_type IN ('username','email','phone','ip','domain','image','social','breach','darkweb','github','reddit','telegram','twitter','linkedin','website','metadata','exif','geolocation','asn','whois','dns','subdomain','ssl','dork','screenshot','tech_detect')),
  target text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  risk_score integer NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  findings jsonb DEFAULT '{}',
  sources_checked text[] DEFAULT '{}',
  summary text,
  analyst_notes text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_osint_investigations_type ON osint_investigations(investigation_type);
CREATE INDEX IF NOT EXISTS idx_osint_investigations_status ON osint_investigations(status);

-- Threat Actors
CREATE TABLE IF NOT EXISTS threat_actors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  aliases text[] DEFAULT '{}',
  origin_country text,
  sophistication text NOT NULL DEFAULT 'intermediate' CHECK (sophistication IN ('novice','intermediate','advanced','expert')),
  motivation text,
  target_sectors text[] DEFAULT '{}',
  ttps text[] DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  first_seen timestamptz,
  last_seen timestamptz DEFAULT now(),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  threat_actor_id uuid REFERENCES threat_actors(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','dormant','finished')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  target_countries text[] DEFAULT '{}',
  target_sectors text[] DEFAULT '{}',
  ioc_count integer NOT NULL DEFAULT 0,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Threat Feeds (aggregated external)
CREATE TABLE IF NOT EXISTS threat_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  source_type text CHECK (source_type IN ('virustotal','abuseipdb','otx','shodan','urlscan','greynoise','malware_bazaar','custom')),
  ioc_type text,
  ioc_value text,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  tags text[] DEFAULT '{}',
  raw_data jsonb DEFAULT '{}',
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_threat_feeds_source ON threat_feeds(source_name);
CREATE INDEX IF NOT EXISTS idx_threat_feeds_fetched_at ON threat_feeds(fetched_at);

-- Activity Logs (audit)
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  module text,
  entity_type text,
  entity_id text,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','error','critical')),
  user_email text,
  ip_address text,
  user_agent text,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('incident','investigation','threat_summary','executive','soc','ioc','custom')),
  format text NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf','word','csv','json')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','generated','failed')),
  risk_score integer CHECK (risk_score BETWEEN 0 AND 100),
  summary text,
  recommendations text[] DEFAULT '{}',
  mitre_mapping jsonb DEFAULT '{}',
  timeline jsonb DEFAULT '{}',
  evidence jsonb DEFAULT '{}',
  analyst_notes text,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz DEFAULT now(),
  generated_at timestamptz
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info','warning','error','success','threat')),
  channel text NOT NULL DEFAULT 'browser' CHECK (channel IN ('browser','email','slack','discord','webhook','telegram')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  read boolean NOT NULL DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- AI Analyses (chat sessions)
CREATE TABLE IF NOT EXISTS ai_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  analysis_type text CHECK (analysis_type IN ('chat','incident_summary','risk_analysis','ioc_extraction','malware_explain','cve_explain','email_analysis','website_analysis','threat_hunt','executive_report','soc_report')),
  attachments jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_session ON ai_analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at);

-- MITRE ATT&CK techniques reference
CREATE TABLE IF NOT EXISTS mitre_techniques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technique_id text UNIQUE NOT NULL,
  name text NOT NULL,
  tactic text NOT NULL,
  description text,
  platform text[] DEFAULT '{}',
  data_sources text[] DEFAULT '{}',
  mitigation text,
  detection text,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mitre_techniques_tactic ON mitre_techniques(tactic);

-- Enable RLS on all tables
ALTER TABLE iocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE osint_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mitre_techniques ENABLE ROW LEVEL SECURITY;

-- Helper to apply anon+authenticated CRUD to a table
-- (single-tenant demo: data is intentionally shared)
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['iocs','threats','scam_reports','osint_investigations','threat_actors','campaigns','threat_feeds','activity_logs','reports','notifications','ai_analyses','mitre_techniques'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "anon_select_%s" ON %I;', t, t);
    EXECUTE format('CREATE POLICY "anon_select_%s" ON %I FOR SELECT TO anon, authenticated USING (true);', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_insert_%s" ON %I;', t, t);
    EXECUTE format('CREATE POLICY "anon_insert_%s" ON %I FOR INSERT TO anon, authenticated WITH CHECK (true);', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_update_%s" ON %I;', t, t);
    EXECUTE format('CREATE POLICY "anon_update_%s" ON %I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_delete_%s" ON %I;', t, t);
    EXECUTE format('CREATE POLICY "anon_delete_%s" ON %I FOR DELETE TO anon, authenticated USING (true);', t, t);
  END LOOP;
END $$;
