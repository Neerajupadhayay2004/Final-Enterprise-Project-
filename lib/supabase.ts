import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not configured.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export type IOC = {
  id: string;
  type: 'ip' | 'url' | 'domain' | 'hash' | 'email';
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  source: string | null;
  tags: string[];
  mitre_tactics: string[];
  first_seen: string;
  last_seen: string;
  status: 'active' | 'retired' | 'false_positive' | 'pending';
  description: string | null;
  country: string | null;
  asn: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Threat = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'false_positive';
  source: string | null;
  affected_assets: string[];
  mitre_techniques: string[];
  country: string | null;
  risk_score: number;
  detected_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ScamReport = {
  id: string;
  input_type: 'url' | 'email' | 'sms' | 'phone' | 'website' | 'text';
  input_value: string;
  scam_type: string | null;
  risk_score: number;
  confidence: number;
  is_scam: boolean;
  threat_indicators: string[];
  suspicious_keywords: string[];
  ai_explanation: string | null;
  domain_age_days: number | null;
  ssl_valid: boolean | null;
  brand_impersonated: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type OSINTInvestigation = {
  id: string;
  investigation_type: string;
  target: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  risk_score: number;
  findings: Record<string, unknown>;
  sources_checked: string[];
  summary: string | null;
  analyst_notes: string | null;
  created_at: string;
  completed_at: string | null;
};

export type ThreatActor = {
  id: string;
  name: string;
  aliases: string[];
  origin_country: string | null;
  sophistication: string;
  motivation: string | null;
  target_sectors: string[];
  ttps: string[];
  active: boolean;
  first_seen: string | null;
  last_seen: string;
  description: string | null;
  created_at: string;
};

export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  threat_actor_id: string | null;
  status: 'active' | 'dormant' | 'finished';
  severity: 'low' | 'medium' | 'high' | 'critical';
  target_countries: string[];
  target_sectors: string[];
  ioc_count: number;
  first_seen: string;
  last_seen: string;
  created_at: string;
};

export type ThreatFeed = {
  id: string;
  source_name: string;
  source_type: string | null;
  ioc_type: string | null;
  ioc_value: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  raw_data: Record<string, unknown>;
  fetched_at: string;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  action: string;
  module: string | null;
  entity_type: string | null;
  entity_id: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  user_email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export type Report = {
  id: string;
  title: string;
  report_type: string;
  format: 'pdf' | 'word' | 'csv' | 'json';
  status: 'draft' | 'generated' | 'failed';
  risk_score: number | null;
  summary: string | null;
  recommendations: string[];
  mitre_mapping: Record<string, unknown>;
  timeline: Record<string, unknown>;
  evidence: Record<string, unknown>;
  analyst_notes: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
  generated_at: string | null;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'threat';
  channel: 'browser' | 'email' | 'slack' | 'discord' | 'webhook' | 'telegram';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  action_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AIAnalysis = {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  analysis_type: string | null;
  attachments: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type MITRETechnique = {
  id: string;
  technique_id: string;
  name: string;
  tactic: string;
  description: string | null;
  platform: string[];
  data_sources: string[];
  mitigation: string | null;
  detection: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
};
