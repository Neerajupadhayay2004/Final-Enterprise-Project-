'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Send,
  Sparkles,
  Paperclip,
  FileText,
  AlertTriangle,
  Shield,
  Bug,
  Activity,
  Target,
  Zap,
  Loader2,
  User,
  Bot,
  Download,
  Trash2,
} from 'lucide-react';
import { PageContainer, SectionTitle } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  analysis_type?: string;
  created_at: string;
};

const quickActions = [
  { label: 'Analyze Email', icon: FileText, prompt: 'Analyze this suspicious email for phishing indicators:\n\n"Your account has been suspended. Click here to verify your identity: https://secure-bank-login.com/verify?id=12345"' },
  { label: 'Explain CVE', icon: Bug, prompt: 'Explain CVE-2024-3094 and its impact. What systems are affected and how to mitigate?' },
  { label: 'Incident Summary', icon: Activity, prompt: 'Generate an incident summary for: LockBit 3.0 ransomware detected on fileserver-01 with mass file encryption. EDR flagged process injection and lateral movement attempts.' },
  { label: 'IOC Extraction', icon: Target, prompt: 'Extract IOCs from this threat report:\n\n"Malicious IP 185.220.101.45 communicating with C2 server at https://malware-c2.com/beacon. Associated hash: 44d88612fea8a8f36de82e1278abb02f. Domain: evil-domain.net"' },
  { label: 'Malware Analysis', icon: Bug, prompt: 'Explain the behavior and impact of RedLine Stealer malware. What data does it steal and how does it exfiltrate?' },
  { label: 'Threat Hunting', icon: Zap, prompt: 'Suggest threat hunting queries for detecting Cobalt Strike beacon activity in a Windows environment.' },
];

function generateAIResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('phishing') || lower.includes('email')) {
    return `## Email Analysis Report

### Threat Assessment: PHISHING — CRITICAL

**Confidence:** 97%

### Key Indicators
1. **Urgency Tactics**: "account has been suspended" creates false urgency, a classic social engineering technique
2. **Suspicious URL**: \`secure-bank-login.com\` is a typosquatted domain not affiliated with any legitimate bank
3. **Action Request**: "Click here to verify" is a credential harvesting prompt
4. **Domain Age**: Likely registered recently (days, not years)

### MITRE ATT&CK Mapping
- **T1566 — Phishing** (Initial Access)
- **T1566.001 — Spearphishing Attachment** (if attachment present)

### Recommendations
1. **Do NOT click the link** or enter credentials
2. Block the domain \`secure-bank-login.com\` at the email gateway
3. Add the URL to the IOC database with critical severity
4. Alert all users about this phishing campaign
5. Report the domain to its registrar for abuse
6. Implement DMARC/SPF policies if not already in place

### Risk Score: 95/100 (Critical)

This is a high-confidence phishing attempt using social engineering and brand impersonation. The combination of urgency, suspicious domain, and credential harvest form creates a textbook phishing pattern.`;
  }

  if (lower.includes('cve') || lower.includes('vulnerability')) {
    return `## CVE Analysis: CVE-2024-3094

### Overview
CVE-2024-3094 is a critical backdoor vulnerability discovered in xz-utils (liblzma) that affected SSH daemons on affected Linux distributions.

### Affected Systems
- Debian and Ubuntu development branches
- Fedora 41/42 (rawhide)
- Any system running xz-utils 5.6.0 or 5.6.1

### Impact
- **CVSS Score:** 10.0 (Critical)
- **Attack Vector:** Supply chain compromise
- **Impact:** Remote code execution via SSH authentication bypass

### MITRE ATT&CK Mapping
- **T1195.002 — Compromise Software Supply Chain**
- **T1053.003 — Cron** (for persistence)

### Recommendations
1. **Immediately downgrade** xz-utils to version 5.4.x
2. Audit SSH configurations and logs for unauthorized access
3. Rotate SSH keys and credentials on affected systems
4. Implement supply chain verification (SBOM, signed packages)
5. Monitor for lateral movement from affected hosts

### Detection
- Check for the malicious build process artifacts
- Monitor SSH authentication logs for anomalies
- Look for unexpected outbound connections on port 22`;
  }

  if (lower.includes('incident') || lower.includes('summary')) {
    return `## Incident Summary Report

### Incident: LockBit 3.0 Ransomware Detection

**Status:** Investigating
**Severity:** Critical
**Detected:** 2 hours ago

### Timeline
1. **T+0h**: EDR detects mass file encryption on fileserver-01
2. **T+0.5h**: Process injection flagged — malicious DLL loaded into svchost.exe
3. **T+1h**: Lateral movement attempts to fileserver-02 detected and blocked
4. **T+2h**: Incident escalated, containment initiated

### MITRE ATT&CK Mapping
- **T1486 — Data Encrypted for Impact**
- **T1055 — Process Injection**
- **T1021 — Remote Services** (lateral movement)
- **T1003 — OS Credential Dumping**

### Risk Analysis
- **Risk Score:** 95/100 (Critical)
- **Affected Assets:** 2 file servers
- **Data Impact:** Potential encryption of shared drives
- **Business Impact:** High — file services disrupted

### Recommendations
1. Isolate affected servers immediately (network quarantine)
2. Preserve evidence: memory dumps, disk images, logs
3. Identify patient zero and initial access vector
4. Check backup integrity and initiate recovery
5. Engage incident response team and legal counsel
6. Notify stakeholders per incident response plan`;
  }

  if (lower.includes('ioc') || lower.includes('extract')) {
    return `## IOC Extraction Results

### Extracted Indicators of Compromise

| Type | Value | Confidence |
|------|-------|------------|
| IP | 185.220.101.45 | 95% |
| URL | https://malware-c2.com/beacon | 98% |
| Hash | 44d88612fea8a8f36de82e1278abb02f | 99% |
| Domain | evil-domain.net | 92% |

### Recommended Actions
1. **Block all IOCs** at perimeter firewall and proxy
2. **Add to threat intelligence platform** with critical severity
3. **Search SIEM** for historical matches (last 90 days)
4. **Submit to VirusTotal** for community enrichment
5. **Create detection rules** in EDR for these indicators

### STIX Format
\`\`\`json
{
  "type": "bundle",
  "objects": [
    {"type": "indicator", "pattern": "[ipv4-addr:value = '185.220.101.45']"},
    {"type": "indicator", "pattern": "[url:value = 'https://malware-c2.com/beacon']"}
  ]
}
\`\`\``;
  }

  if (lower.includes('malware') || lower.includes('redline') || lower.includes('stealer')) {
    return `## Malware Analysis: RedLine Stealer

### Overview
RedLine Stealer is a commodity infostealer malware sold on dark web forums, primarily targeting browser credentials and cryptocurrency wallets.

### Behavior
1. **Initial Execution**: Distributed via phishing emails, cracked software, and malvertising
2. **Credential Theft**: Extracts saved passwords from Chrome, Firefox, Edge
3. **Cookie Theft**: Steals session cookies for account takeover
4. **Crypto Wallet Theft**: Targets MetaMask, Exodus, Electrum wallets
5. **System Info**: Collects hardware specs, installed software, OS version
6. **Exfiltration**: Sends data to C2 via HTTP POST (often Telegram API)

### MITRE ATT&CK Mapping
- **T1003 — OS Credential Dumping**
- **T1567 — Exfiltration Over Web Service**
- **T1083 — File and Directory Discovery**

### Detection
- Monitor for suspicious browser process memory access
- Alert on unexpected outbound HTTPS to unknown endpoints
- Check for credential store access anomalies
- Monitor for cryptocurrency wallet file access

### Recommendations
1. Force password resets for all affected accounts
2. Revoke all active session tokens/cookies
3. Move cryptocurrency to new wallets
4. Enable MFA on all accounts
5. Deploy EDR detection rules for RedLine behaviors`;
  }

  if (lower.includes('hunt') || lower.includes('cobalt') || lower.includes('beacon')) {
    return `## Threat Hunting: Cobalt Strike Beacon Detection

### Hunting Queries

**1. Process Injection (Sysmon Event ID 8)**
\`\`\`
EventID: 8 AND SourceImage: (*\\rundll32.exe OR *\\dllhost.exe) AND TargetImage: *\\svchost.exe
\`\`\`

**2. Named Pipe Creation**
\`\`\`
EventID: 17 AND PipeName: (\\\\pipe\\\\msagent_* OR \\\\pipe\\\\status_* OR \\\\pipe\\\\postex_*)
\`\`\`

**3. Suspicious Network Connections**
\`\`\`
DestinationPort: (443 OR 80 OR 8443) AND Process: (*\\rundll32.exe OR *\\powershell.exe)
AND Frequency: >5 connections/minute
\`\`\`

**4. Beaconing Pattern Detection**
\`\`\`
GroupBy: SourceIP, DestinationIP
TimeInterval: 60s
Having: Count(Distinct(Timestamp)) > 5 AND StdDev(Interval) < 2
\`\`\`

**5. Malleable C2 Profiles**
\`\`\`
HTTP User-Agent: "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1)"
AND HTTP Method: POST AND Content-Type: "application/octet-stream"
\`\`\`

### MITRE ATT&CK Mapping
- **T1059 — Command and Scripting Interpreter**
- **T1071 — Application Layer Protocol**
- **T1055 — Process Injection**

### Recommendations
1. Deploy Sysmon with SwiftOnConfig for comprehensive logging
2. Enable network flow logging on perimeter devices
3. Create SIEM correlation rules for beaconing patterns
4. Implement DNS logging and analysis for C2 domains`;
  }

  return `## Analysis Complete

I've processed your request. Here's my assessment:

### Key Findings
- The input has been analyzed using multiple threat intelligence sources
- Pattern matching against known threat signatures completed
- Risk assessment generated based on indicator correlation

### Recommendations
1. Cross-reference findings with your existing threat intelligence
2. Implement detection rules based on identified patterns
3. Monitor for related activity in your environment
4. Document findings for future reference

### Next Steps
- Ask me to generate a detailed report
- Request IOC extraction from the analysis
- Get MITRE ATT&CK mapping for the findings
- Ask for threat hunting queries

*Note: This is a demonstration AI analyst. In production, this would connect to OpenAI GPT-4, Gemini, or a local Ollama model via LangChain for real-time threat analysis.*`;
}

export default function AIAnalystPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => 'session-' + Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      await supabase.from('ai_analyses').insert({
        session_id: sessionId,
        role: 'user',
        content,
        analysis_type: 'chat',
      });
    } catch { /* ignore */ }

    await new Promise((r) => setTimeout(r, 1500));
    const response = generateAIResponse(content);
    const assistantMsg: Message = {
      id: 'msg-' + Date.now() + 1,
      role: 'assistant',
      content: response,
      analysis_type: 'chat',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);

    try {
      await supabase.from('ai_analyses').insert({
        session_id: sessionId,
        role: 'assistant',
        content: response,
        analysis_type: 'chat',
      });
    } catch { /* ignore */ }
  };

  const handleClear = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar with quick actions */}
        <div className="lg:col-span-1">
          <Card className="border-border/60 p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-5">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold">AI Security Analyst</p>
                <p className="text-[10px] text-muted-foreground">Powered by GPT-4 / Gemini</p>
              </div>
            </div>

            <div className="mb-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</p>
              <div className="space-y-1.5">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => handleSend(action.prompt)}
                      className="flex w-full items-center gap-2 rounded-lg border border-border/50 p-2.5 text-left text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/5"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="flex-1">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Capabilities</p>
              <div className="flex flex-wrap gap-1">
                {['Incident Summary', 'Risk Analysis', 'IOC Extraction', 'MITRE Mapping', 'Malware Analysis', 'CVE Explanation', 'Threat Hunting', 'Executive Report'].map((cap) => (
                  <Badge key={cap} variant="secondary" className="text-[9px]">{cap}</Badge>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Accepts</p>
              <div className="flex flex-wrap gap-1">
                {['Logs', 'URLs', 'Emails', 'PDF', 'CSV', 'Screenshots', 'PCAP'].map((type) => (
                  <Badge key={type} variant="outline" className="text-[9px]">{type}</Badge>
                ))}
              </div>
            </div>

            {messages.length > 0 && (
              <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={handleClear}>
                <Trash2 className="h-3.5 w-3.5" /> Clear Chat
              </Button>
            )}
          </Card>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3">
          <Card className="flex h-[calc(100vh-12rem)] flex-col border-border/60">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                <span className="text-sm font-medium">AI Analyst Online</span>
                <Badge variant="outline" className="text-[10px]">GPT-4 Turbo</Badge>
              </div>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="relative mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-5">
                      <Sparkles className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" />
                  </div>
                  <h3 className="text-lg font-bold">AI Security Analyst</h3>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    Your intelligent threat analysis assistant. Ask me to analyze emails, explain CVEs, generate incident reports, extract IOCs, or suggest threat hunting queries.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {quickActions.slice(0, 6).map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={() => handleSend(action.prompt)}
                          className="flex items-center gap-2 rounded-lg border border-border/50 p-3 text-left text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/5"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-primary" />
                          <span className="flex-1">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-5">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 border border-border/50'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans">{msg.content}</pre>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-5">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-muted/50 p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Analyzing...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex items-end gap-2">
                <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about threats, paste logs, request analysis..."
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <Button onClick={() => handleSend()} disabled={loading || !input.trim()} className="h-11 w-11 shrink-0 p-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
