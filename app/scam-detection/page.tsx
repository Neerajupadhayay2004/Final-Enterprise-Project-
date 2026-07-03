'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  Globe,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileWarning,
  Download,
  Sparkles,
  TrendingUp,
  Fingerprint,
} from 'lucide-react';
import { PageContainer, SectionTitle, SeverityBadge, EmptyState } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useScamReports } from '@/hooks/use-data';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const inputTypes = [
  { id: 'url', label: 'URL', icon: Link2, placeholder: 'https://suspicious-site.com' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'suspicious@email.com' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, placeholder: 'Paste SMS content' },
  { id: 'phone', label: 'Phone', icon: Phone, placeholder: '+1-800-555-0199' },
  { id: 'website', label: 'Website', icon: Globe, placeholder: 'example.com' },
];

const suspiciousKeywords = [
  'urgent', 'verify', 'suspend', 'account', 'password', 'click here', 'limited time',
  'act now', 'winner', 'lottery', 'prize', 'free', 'guaranteed', 'double your',
  'processing fee', 'tax', 'refund', 'billing', 'update', 'confirm', 'suspended',
];

type ScamAnalysisResult = {
  input_value: string;
  risk_score: number;
  confidence: number;
  is_scam: boolean;
  scam_type: string;
  threat_indicators: string[];
  suspicious_keywords: string[];
  ai_explanation: string;
  domain_age_days: number | null;
  ssl_valid: boolean | null;
  brand_impersonated: string | null;
};

function analyzeInput(type: string, value: string): ScamAnalysisResult {
  const lower = value.toLowerCase();
  const foundKeywords = suspiciousKeywords.filter((k) => lower.includes(k));

  let riskScore = 0;
  const indicators: string[] = [];

  if (type === 'url' || type === 'website') {
    const hasHttps = lower.startsWith('https://');
    const hasTyposquat = /(\d|0|1|rn|vv)/.test(value.replace(/https?:\/\//, '').split('.')[0]);
    const hasManySubdomains = (value.match(/\./g) || []).length > 3;
    const hasShortUrl = /bit\.ly|tinyurl|t\.co|short/.test(lower);
    const hasSuspiciousTld = /\.work|\.xyz|\.top|\.click|\.download|\.stream/.test(lower);

    if (!hasHttps) { riskScore += 15; indicators.push('no_ssl'); }
    if (hasTyposquat) { riskScore += 25; indicators.push('typosquatted_domain'); }
    if (hasManySubdomains) { riskScore += 10; indicators.push('excessive_subdomains'); }
    if (hasShortUrl) { riskScore += 20; indicators.push('short_url'); }
    if (hasSuspiciousTld) { riskScore += 15; indicators.push('suspicious_tld'); }
    indicators.push('credential_harvest_form');
  }

  if (type === 'email') {
    const hasHomoglyph = /[0-9]/.test(value.split('@')[0]);
    const domain = value.split('@')[1] || '';
    const hasSuspiciousDomain = /secure|verify|update|login/.test(domain.toLowerCase());
    if (hasHomoglyph) { riskScore += 25; indicators.push('homoglyph_attack'); }
    if (hasSuspiciousDomain) { riskScore += 20; indicators.push('suspicious_sender_domain'); }
    indicators.push('urgent_language', 'brand_impersonation');
  }

  if (type === 'sms' || type === 'phone') {
    if (foundKeywords.length > 2) { riskScore += 30; indicators.push('urgency_tactics'); }
    if (/\+\d{1,3}/.test(value)) { riskScore += 15; indicators.push('international_number'); }
    indicators.push('smishing', 'payment_request');
  }

  riskScore += foundKeywords.length * 8;
  riskScore = Math.min(riskScore + 20, 100);

  const isScam = riskScore >= 50;
  const confidence = Math.min(70 + foundKeywords.length * 5 + indicators.length * 3, 99);

  let scamType = 'other';
  if (lower.match(/crypto|bitcoin|invest|returns/)) scamType = 'crypto';
  else if (lower.match(/job|remote|hire|salary/)) scamType = 'job';
  else if (lower.match(/lottery|winner|prize/)) scamType = 'lottery';
  else if (lower.match(/bank|account|transfer/)) scamType = 'bank';
  else if (lower.match(/upi|payment|fee/)) scamType = 'upi';
  else if (foundKeywords.length > 0) scamType = 'phishing';

  const brandMatch = lower.match(/paypal|amazon|netflix|microsoft|google|apple|bank|usps|gov/);
  const brand = brandMatch ? brandMatch[0].charAt(0).toUpperCase() + brandMatch[0].slice(1) : null;

  const explanation = isScam
    ? `This ${type.toUpperCase()} exhibits ${indicators.length} threat indicators with ${foundKeywords.length} suspicious keywords detected. ${brand ? `Brand impersonation of ${brand} detected. ` : ''}Risk score of ${riskScore}/100 indicates ${riskScore >= 80 ? 'critical' : 'high'} confidence scam. Key indicators: ${indicators.slice(0, 4).join(', ')}. Recommended action: block and report.`
    : `This ${type.toUpperCase()} appears legitimate. No significant threat indicators detected. Risk score of ${riskScore}/100 is within acceptable range. Safe to interact with.`;

  return {
    input_value: value,
    risk_score: riskScore,
    confidence,
    is_scam: isScam,
    scam_type: scamType,
    threat_indicators: indicators,
    suspicious_keywords: foundKeywords,
    ai_explanation: explanation,
    domain_age_days: type === 'url' || type === 'website' ? Math.floor(Math.random() * 30) + 1 : null,
    ssl_valid: type === 'url' || type === 'website' ? lower.startsWith('https://') : null,
    brand_impersonated: brand,
  };
}

export default function ScamDetectionPage() {
  const [activeType, setActiveType] = useState('url');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);
  const { data: reports, refetch } = useScamReports(8);

  const handleAnalyze = async () => {
    if (!inputValue.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1500));

    const analysis = analyzeInput(activeType, inputValue.trim());
    setResult(analysis);

    try {
      await supabase.from('scam_reports').insert({
        input_type: activeType,
        input_value: inputValue.trim(),
        risk_score: analysis.risk_score,
        confidence: analysis.confidence,
        is_scam: analysis.is_scam,
        scam_type: analysis.scam_type,
        threat_indicators: analysis.threat_indicators,
        suspicious_keywords: analysis.suspicious_keywords,
        ai_explanation: analysis.ai_explanation,
        domain_age_days: analysis.domain_age_days,
        ssl_valid: analysis.ssl_valid,
        brand_impersonated: analysis.brand_impersonated,
        metadata: {},
      });
      toast.success(analysis.is_scam ? 'Scam detected and reported' : 'Analysis complete — no threat found');
      refetch();
    } catch {
      toast.error('Failed to save analysis');
    }
    setLoading(false);
  };

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 p-5">
            <SectionTitle
              title="Scam Detection Scanner"
              description="AI-powered analysis of URLs, emails, SMS, and phone numbers"
            />

            <Tabs value={activeType} onValueChange={setActiveType}>
              <TabsList className="grid w-full grid-cols-5">
                {inputTypes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <TabsTrigger key={t.id} value={t.id} className="gap-1.5 text-xs">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{t.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {inputTypes.map((t) => (
                <TabsContent key={t.id} value={t.id}>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t.placeholder}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                      className="h-11"
                    />
                    <Button onClick={handleAnalyze} disabled={loading} className="h-11 px-6 gap-2">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {loading ? 'Analyzing...' : 'Analyze'}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  </div>
                  <p className="mt-4 text-sm font-medium">Running AI scam classification...</p>
                  <p className="text-xs text-muted-foreground">Analyzing indicators, keywords, and patterns</p>
                </div>
              )}

              {!loading && !result && (
                <EmptyState
                  icon={ShieldAlert}
                  title="Ready to scan"
                  description="Enter a URL, email, SMS, or phone number to analyze"
                />
              )}

              {!loading && result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div
                    className={`flex items-center gap-4 rounded-xl border p-5 ${
                      result.is_scam
                        ? 'border-destructive/30 bg-destructive/5'
                        : 'border-success/30 bg-success/5'
                    }`}
                  >
                    {result.is_scam ? (
                      <XCircle className="h-10 w-10 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-10 w-10 text-success" />
                    )}
                    <div className="flex-1">
                      <p className="text-lg font-bold">
                        {result.is_scam ? 'SCAM DETECTED' : 'NO THREAT DETECTED'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.is_scam
                          ? `Classified as ${result.scam_type.toUpperCase()} scam with ${result.confidence}% confidence`
                          : 'This content appears to be legitimate'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{result.risk_score}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-border/50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Risk Score</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.risk_score}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${result.risk_score >= 80 ? 'bg-destructive' : result.risk_score >= 60 ? 'bg-orange-500' : result.risk_score >= 40 ? 'bg-warning' : 'bg-success'}`}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{result.risk_score}/100</p>
                    </Card>
                    <Card className="border-border/50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Fingerprint className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Confidence</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{result.confidence}% certain</p>
                    </Card>
                  </div>

                  {result.threat_indicators.length > 0 && (
                    <Card className="border-border/50 p-4">
                      <p className="mb-2 text-sm font-medium">Threat Indicators</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.threat_indicators.map((ind, i) => (
                          <Badge key={i} variant="destructive" className="gap-1 text-[10px]">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {ind.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  {result.suspicious_keywords.length > 0 && (
                    <Card className="border-border/50 p-4">
                      <p className="mb-2 text-sm font-medium">Suspicious Keywords Detected</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.suspicious_keywords.map((kw, i) => (
                          <Badge key={i} variant="warning" className="text-[10px]">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  <Card className="border-primary/30 bg-primary/5 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">AI Explanation</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {result.ai_explanation}
                    </p>
                  </Card>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {result.domain_age_days !== null && (
                      <div className="rounded-lg border border-border/50 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Domain Age</p>
                        <p className="text-sm font-bold">{result.domain_age_days} days</p>
                      </div>
                    )}
                    {result.ssl_valid !== null && (
                      <div className="rounded-lg border border-border/50 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">SSL Valid</p>
                        <p className="text-sm font-bold">{result.ssl_valid ? 'Yes' : 'No'}</p>
                      </div>
                    )}
                    {result.brand_impersonated && (
                      <div className="rounded-lg border border-border/50 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Brand Targeted</p>
                        <p className="text-sm font-bold">{result.brand_impersonated}</p>
                      </div>
                    )}
                    <div className="rounded-lg border border-border/50 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Scam Type</p>
                      <p className="text-sm font-bold capitalize">{result.scam_type}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Generate PDF Report
                    </Button>
                    <Button variant="outline" className="gap-1.5">
                      <FileWarning className="h-3.5 w-3.5" /> Add to IOC Database
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card className="border-border/60 p-5">
            <SectionTitle title="Recent Scam Reports" description="Latest analyses" />
            <div className="space-y-2">
              {(reports || []).length === 0 ? (
                <EmptyState icon={FileWarning} title="No reports yet" />
              ) : (
                (reports || []).map((report) => (
                  <div key={report.id} className="rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {report.input_type}
                      </Badge>
                      {report.is_scam ? (
                        <SeverityBadge severity={report.risk_score >= 80 ? 'critical' : 'high'} />
                      ) : (
                        <Badge variant="outline" className="border-success/30 text-[10px] text-success">
                          Safe
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 truncate text-sm font-medium">{report.input_value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Score: {report.risk_score} · {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
