/*
# Seed Sample Threat Intelligence Data (retry with array casts)

Populates all tables with realistic sample data. Fixes empty array type inference.
*/

-- MITRE ATT&CK techniques
INSERT INTO mitre_techniques (technique_id, name, tactic, description, platform, severity) VALUES
('T1566', 'Phishing', 'Initial Access', 'Adversaries may send phishing messages to gain access to systems.', ARRAY['Windows','macOS','Linux','Office 365'], 'high'),
('T1059', 'Command and Scripting Interpreter', 'Execution', 'Adversaries may abuse command and script interpreters to execute commands.', ARRAY['Windows','Linux','macOS'], 'high'),
('T1071', 'Application Layer Protocol', 'Command and Control', 'Adversaries may communicate using application layer protocols to avoid detection.', ARRAY['Windows','Linux','macOS'], 'medium'),
('T1486', 'Data Encrypted for Impact', 'Impact', 'Adversaries may encrypt data on target systems to interrupt availability.', ARRAY['Windows','macOS','Linux'], 'critical'),
('T1053', 'Scheduled Task/Job', 'Execution', 'Adversaries may abuse task scheduling to execute malicious code.', ARRAY['Windows','Linux'], 'medium'),
('T1003', 'OS Credential Dumping', 'Credential Access', 'Adversaries may attempt to dump credentials from memory or disk.', ARRAY['Windows','Linux'], 'critical'),
('T1190', 'Exploit Public-Facing Application', 'Initial Access', 'Adversaries may attempt to exploit vulnerabilities in internet-facing apps.', ARRAY['Windows','Linux','Network'], 'high'),
('T1078', 'Valid Accounts', 'Defense Evasion', 'Adversaries may use credentials of existing accounts to gain access.', ARRAY['Windows','Linux','Cloud'], 'medium'),
('T1567', 'Exfiltration Over Web Service', 'Exfiltration', 'Adversaries may use web services to exfiltrate data.', ARRAY['Windows','Linux','macOS'], 'high'),
('T1059.001', 'PowerShell', 'Execution', 'Adversaries may abuse PowerShell commands and scripts for execution.', ARRAY['Windows'], 'high')
ON CONFLICT (technique_id) DO NOTHING;

-- Threat actors
INSERT INTO threat_actors (name, aliases, origin_country, sophistication, motivation, target_sectors, ttps, active, first_seen, description) VALUES
('APT29', ARRAY['Cozy Bear','The Dukes'], 'Russia', 'expert', 'Espionage', ARRAY['government','healthcare','think_tanks'], ARRAY['T1566','T1078','T1059.001','T1486'], true, '2020-01-15T00:00:00Z', 'State-sponsored group known for sophisticated spear-phishing and supply chain attacks.'),
('APT41', ARRAY['Winnti','Barium'], 'China', 'expert', 'Espionage & Financial', ARRAY['technology','gaming','healthcare','telecom'], ARRAY['T1190','T1059','T1003','T1567'], true, '2019-06-01T00:00:00Z', 'Concurrent state-sponsored and financially motivated group targeting multiple sectors.'),
('FIN7', ARRAY['Carbanak Group'], 'Unknown', 'advanced', 'Financial', ARRAY['hospitality','retail','finance'], ARRAY['T1566','T1059','T1003','T1486'], true, '2021-03-20T00:00:00Z', 'Financially motivated group known for targeting point-of-sale systems.'),
('Lazarus Group', ARRAY['Hidden Cobra','Guardians of Peace'], 'North Korea', 'expert', 'Financial & Espionage', ARRAY['finance','cryptocurrency','defense','media'], ARRAY['T1566','T1059','T1486','T1567'], true, '2018-11-10T00:00:00Z', 'State-sponsored group involved in destructive attacks and cryptocurrency theft.'),
('Scattered Spider', ARRAY['Octo Tempest','UNC3944'], 'Unknown', 'advanced', 'Financial', ARRAY['telecom','technology','finance'], ARRAY['T1566','T1078','T1059.001'], true, '2022-09-05T00:00:00Z', 'English-speaking group known for social engineering and SIM-swapping attacks.')
ON CONFLICT DO NOTHING;

-- Campaigns
INSERT INTO campaigns (name, description, threat_actor_id, status, severity, target_countries, target_sectors, ioc_count, first_seen, last_seen)
SELECT 'SolarWinds Supply Chain', 'Supply chain attack compromising software updates', ta.id, 'active', 'critical', ARRAY['United States','United Kingdom','Germany'], ARRAY['government','technology','defense'], 142, '2020-12-01T00:00:00Z', now() FROM threat_actors ta WHERE ta.name = 'APT29'
ON CONFLICT DO NOTHING;
INSERT INTO campaigns (name, description, threat_actor_id, status, severity, target_countries, target_sectors, ioc_count, first_seen, last_seen)
SELECT 'Operation Dream Job', 'Targeted attacks on defense and aerospace sectors', ta.id, 'active', 'high', ARRAY['United States','Israel','South Korea'], ARRAY['defense','aerospace','technology'], 87, '2020-08-01T00:00:00Z', now() FROM threat_actors ta WHERE ta.name = 'Lazarus Group'
ON CONFLICT DO NOTHING;
INSERT INTO campaigns (name, description, threat_actor_id, status, severity, target_countries, target_sectors, ioc_count, first_seen, last_seen)
SELECT 'SIM Swap Campaign', 'Social engineering and SIM-swapping for financial gain', ta.id, 'active', 'high', ARRAY['United States','Canada','United Kingdom'], ARRAY['telecom','finance','technology'], 53, '2022-09-05T00:00:00Z', now() FROM threat_actors ta WHERE ta.name = 'Scattered Spider'
ON CONFLICT DO NOTHING;

-- IOCs
INSERT INTO iocs (type, value, severity, confidence, source, tags, mitre_tactics, status, description, country, asn) VALUES
('ip', '185.220.101.45', 'critical', 95, 'AbuseIPDB', ARRAY['tor','malicious','scanner'], ARRAY['Command and Control'], 'active', 'Known Tor exit node used for C2 communications.', 'Russia', 'AS200651'),
('ip', '45.155.205.233', 'high', 88, 'AlienVault OTX', ARRAY['botnet','c2'], ARRAY['Command and Control'], 'active', 'Active Cobalt Strike C2 server.', 'Netherlands', 'AS49505'),
('ip', '194.165.16.78', 'high', 82, 'GreyNoise', ARRAY['scanner','exploit'], ARRAY['Reconnaissance'], 'active', 'Mass scanner targeting exposed services.', 'Romania', 'AS39743'),
('url', 'https://secure-bank-login.com/verify', 'critical', 97, 'URLScan', ARRAY['phishing','credential_theft'], ARRAY['Initial Access'], 'active', 'Phishing site impersonating a major bank.', 'United States', null),
('url', 'https://crypto-invest-returns.io/wallet', 'critical', 94, 'VirusTotal', ARRAY['crypto_scam','phishing'], ARRAY['Initial Access'], 'active', 'Cryptocurrency investment scam landing page.', 'Seychelles', null),
('domain', 'microsoft365-secure-login.com', 'high', 91, 'Internal', ARRAY['phishing','brand_impersonation'], ARRAY['Initial Access'], 'active', 'Typosquatted domain targeting Microsoft 365 users.', 'United States', null),
('domain', 'amaz0n-account-update.net', 'high', 89, 'Internal', ARRAY['phishing','brand_impersonation'], ARRAY['Initial Access'], 'active', 'Brand impersonation domain targeting Amazon users.', 'Panama', null),
('hash', '44d88612fea8a8f36de82e1278abb02f', 'critical', 99, 'Malware Bazaar', ARRAY['ransomware','lockbit'], ARRAY['Impact'], 'active', 'LockBit 3.0 ransomware sample hash.', 'Unknown', null),
('hash', 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', 'high', 85, 'VirusTotal', ARRAY['trojan','infostealer'], ARRAY['Credential Access'], 'active', 'RedLine Stealer malware hash.', 'Unknown', null),
('email', 'support@paypa1-secure.com', 'high', 92, 'Internal', ARRAY['phishing','brand_impersonation'], ARRAY['Initial Access'], 'active', 'Phishing email impersonating PayPal support.', 'Unknown', null),
('ip', '104.244.74.211', 'medium', 70, 'Shodan', ARRAY['suspicious'], ARRAY['Reconnaissance'], 'pending', 'Suspicious host with open RDP and SMB services.', 'United States', 'AS40805'),
('domain', 'gov-uk-tax-refund.com', 'critical', 96, 'URLScan', ARRAY['phishing','government'], ARRAY['Initial Access'], 'active', 'Phishing domain impersonating UK government tax service.', 'United Kingdom', null),
('url', 'https://job-offer-remote-data-entry.work/login', 'high', 86, 'Internal', ARRAY['job_scam','phishing'], ARRAY['Initial Access'], 'active', 'Fake job offer landing page harvesting credentials.', 'Russia', null),
('ip', '23.129.236.10', 'high', 84, 'AbuseIPDB', ARRAY['tor','proxy'], ARRAY['Command and Control'], 'active', 'Tor relay frequently associated with malicious traffic.', 'United States', 'AS397704'),
('hash', 'f1e2d3c4b5a697887766554433221100', 'critical', 98, 'Malware Bazaar', ARRAY['ransomware','blackcat'], ARRAY['Impact'], 'active', 'BlackCat/ALPHV ransomware sample.', 'Unknown', null)
ON CONFLICT DO NOTHING;

-- Threats / Incidents
INSERT INTO threats (title, description, category, severity, status, source, affected_assets, mitre_techniques, country, risk_score, detected_at) VALUES
('LockBit 3.0 Ransomware Detected on File Server', 'Ransomware executable identified on primary file server with mass file encryption activity.', 'ransomware', 'critical', 'investigating', 'EDR', ARRAY['fileserver-01','fileserver-02'], ARRAY['T1486','T1059.001','T1003'], 'United States', 95, now() - interval '2 hours'),
('Phishing Campaign Targeting Finance Department', 'Spear-phishing emails impersonating CFO requesting urgent wire transfers.', 'phishing', 'high', 'open', 'Email Gateway', ARRAY['finance-workstation-01','finance-workstation-02'], ARRAY['T1566','T1078'], 'United States', 78, now() - interval '5 hours'),
('Cryptocurrency Investment Scam Landing Page', 'Fraudulent website promising unrealistic crypto returns detected and reported.', 'scam', 'high', 'contained', 'URL Scanner', ARRAY['external-web'], ARRAY['T1566'], 'Seychelles', 72, now() - interval '8 hours'),
('Brute Force Attack on VPN Gateway', 'Multiple failed authentication attempts from distributed IPs targeting VPN.', 'intrusion', 'medium', 'investigating', 'SIEM', ARRAY['vpn-gateway-01'], ARRAY['T1078','T1190'], 'Russia', 65, now() - interval '12 hours'),
('Data Exfiltration via DNS Tunneling', 'Anomalous DNS query patterns indicate potential data exfiltration through DNS.', 'data_breach', 'critical', 'investigating', 'Network Monitor', ARRAY['dns-server-01'], ARRAY['T1567','T1071'], 'China', 90, now() - interval '1 day'),
('Botnet C2 Communication Detected', 'Internal host communicating with known C2 infrastructure via encrypted channels.', 'botnet', 'high', 'contained', 'EDR', ARRAY['workstation-42'], ARRAY['T1071','T1059'], 'Netherlands', 82, now() - interval '1 day'),
('Supply Chain Compromise Alert', 'Third-party vendor software update contained backdoor code.', 'supply_chain', 'critical', 'open', 'Threat Intel', ARRAY['vendor-app-01'], ARRAY['T1190','T1059'], 'Russia', 93, now() - interval '2 days'),
('DDoS Attack Against Customer Portal', 'Sustained volumetric DDoS attack targeting customer-facing web portal.', 'ddos', 'high', 'resolved', 'Network Monitor', ARRAY['web-portal-01','web-portal-02'], ARRAY['T1498'], 'Unknown', 70, now() - interval '3 days'),
('RedLine Stealer Infection on Marketing Laptop', 'Infostealer malware exfiltrating browser credentials and session tokens.', 'malware', 'high', 'contained', 'EDR', ARRAY['marketing-laptop-07'], ARRAY['T1003','T1567'], 'Unknown', 80, now() - interval '4 days'),
('Fake Job Offer Phishing Campaign', 'Targeted phishing using fake remote job offers to harvest credentials.', 'phishing', 'medium', 'resolved', 'Email Gateway', ARRAY['hr-workstation-01'], ARRAY['T1566'], 'Russia', 60, now() - interval '5 days')
ON CONFLICT DO NOTHING;

-- Scam reports
INSERT INTO scam_reports (input_type, input_value, scam_type, risk_score, confidence, is_scam, threat_indicators, suspicious_keywords, ai_explanation, domain_age_days, ssl_valid, brand_impersonated) VALUES
('url', 'https://secure-bank-login.com/verify?id=12345', 'phishing', 95, 97, true, ARRAY['typosquatted_domain','credential_harvest_form','no_2fa','recent_registration'], ARRAY['verify','urgent','account suspended','click here'], 'This URL exhibits multiple high-confidence phishing indicators: the domain is a typosquat of a legitimate bank, registered 3 days ago, uses a credential harvest form, and creates false urgency. SSL is valid but issued by a free CA. Strong brand impersonation detected.', 3, true, 'Bank of America'),
('url', 'https://crypto-invest-returns.io/wallet', 'crypto', 92, 94, true, ARRAY['unrealistic_returns','no_regulation','anonymous_owners','pressure_tactics'], ARRAY['guaranteed returns','double your money','limited time','act now'], 'Cryptocurrency investment scam. Promises guaranteed returns (a hallmark of fraud), domain registered anonymously, no regulatory registration found. Uses pressure tactics and emotional manipulation. High risk of financial loss.', 12, true, null),
('email', 'support@paypa1-secure.com', 'phishing', 89, 91, true, ARRAY['typosquatted_email','urgent_language','suspicious_link','brand_impersonation'], ARRAY['account limited','verify your identity','click here','suspend'], 'Phishing email impersonating PayPal. The sender domain uses a homoglyph attack (paypa1 with the number 1 instead of letter l). Creates false urgency about account suspension. Contains link to credential harvest page.', null, null, 'PayPal'),
('sms', '+1-800-555-0199: Your package is held, pay $2.50 redelivery fee at usps-reschedule.net', 'phishing', 88, 90, true, ARRAY['smishing','short_url','payment_request','brand_impersonation'], ARRAY['package','held','fee','redelivery'], 'SMS phishing (smishing) impersonating USPS. Requests small payment to seem legitimate, then harvests payment card details. Domain not affiliated with USPS. Short URL hides destination.', null, null, 'USPS'),
('url', 'https://amaz0n-account-update.net/login', 'phishing', 86, 88, true, ARRAY['typosquatted_domain','credential_form','brand_impersonation'], ARRAY['account','update','verify','suspended'], 'Brand impersonation of Amazon using typosquatted domain (amaz0n with zero). Credential harvest form present. Domain recently registered. No legitimate business purpose.', 8, true, 'Amazon'),
('url', 'https://github.com/microsoft/vscode', 'other', 5, 95, false, ARRAY[]::text[], ARRAY[]::text[], 'This is the legitimate GitHub repository for Visual Studio Code, owned by Microsoft. Domain is correctly registered, SSL is valid, no suspicious indicators detected. Safe to access.', null, true, null),
('url', 'https://job-offer-remote-data-entry.work/login', 'job', 84, 87, true, ARRAY['too_good_to_be_true','credential_harvest','no_company_info','anonymous_domain'], ARRAY['remote','data entry','high pay','apply now'], 'Job scam targeting job seekers. Offers unrealistic pay for simple remote work. No verifiable company information. Login form harvests credentials. Domain uses .work TLD commonly abused for scams.', 21, true, null),
('phone', '+234 80 1234 5678', 'upi', 78, 82, true, ARRAY['international_number','known_fraud_pattern','upi_request_pattern'], ARRAY['lottery winner','processing fee','tax payment'], 'Phone number associated with UPI/lottery fraud. International number requesting processing fees for fake lottery winnings. Known fraud pattern in regional scam databases.', null, null, null),
('url', 'https://gov-uk-tax-refund.com/claim', 'phishing', 93, 96, true, ARRAY['government_impersonation','typosquatted_domain','credential_harvest','recent_registration'], ARRAY['tax refund','claim now','government','verify'], 'Government impersonation phishing. Domain mimics UK government tax service but is not the official gov.uk domain. Credential harvest form present. Recently registered. High confidence scam.', 5, true, 'HMRC'),
('url', 'https://netflix-billing-update.com/secure', 'phishing', 85, 89, true, ARRAY['brand_impersonation','credential_harvest','suspicious_domain'], ARRAY['billing','update','suspend','payment'], 'Phishing site impersonating Netflix billing. Requests payment card and personal information. Domain not affiliated with Netflix. Uses urgency tactics about account suspension.', 14, true, 'Netflix')
ON CONFLICT DO NOTHING;

-- OSINT investigations
INSERT INTO osint_investigations (investigation_type, target, status, risk_score, findings, sources_checked, summary, completed_at) VALUES
('ip', '185.220.101.45', 'completed', 90, '{"country":"Russia","asn":"AS200651","isp":"Hosting Provider","is_tor":true,"open_ports":[443,80,22],"reputation":"malicious","abuse_reports":1247,"first_seen":"2023-01-15"}'::jsonb, ARRAY['AbuseIPDB','Shodan','GreyNoise','VirusTotal'], 'IP is a known Tor exit node with 1247 abuse reports. Associated with C2 infrastructure and scanning activity. High risk.', now() - interval '1 hour'),
('domain', 'microsoft365-secure-login.com', 'completed', 88, '{"registrar":"NameSilo","registered":"2024-01-10","registrant":"REDACTED FOR PRIVACY","dns_records":{"A":"192.0.2.1","MX":"none","TXT":"none"},"ssl_issuer":"Lets Encrypt","ssl_valid":true,"subdomains":[],"technologies":["nginx"]}'::jsonb, ARRAY['WHOIS','DNS','SSL','Wappalyzer'], 'Typosquatted domain targeting Microsoft 365. Registered recently with privacy protection. No legitimate MX records. Valid SSL but from free CA.', now() - interval '2 hours'),
('email', 'john.doe@example.com', 'completed', 35, '{"breaches":["Adobe","LinkedIn","Dropbox"],"social_profiles":["LinkedIn","Twitter"],"data_broker_listings":2,"risk_level":"low"}'::jsonb, ARRAY['HaveIBeenPwned','Google','LinkedIn','Hunter.io'], 'Email found in 3 known data breaches. Active social profiles on LinkedIn and Twitter. Low overall risk score.', now() - interval '3 hours'),
('username', 'darknet_user_42', 'completed', 72, '{"platforms":["Reddit","Twitter","GitHub","Telegram"],"posts":145,"first_seen":"2021-06-15","associated_forums":["darknet_marketplace","cybersecurity"],"suspicious_activity":true}'::jsonb, ARRAY['Reddit','Twitter','GitHub','Telegram','Google'], 'Username found across multiple platforms with cybersecurity forum activity. Some posts reference darknet marketplaces. Moderate risk.', now() - interval '5 hours'),
('domain', 'gov-uk-tax-refund.com', 'completed', 95, '{"registrar":"NameCheap","registered":"2024-06-28","registrant":"REDACTED","ssl_issuer":"Lets Encrypt","dns_records":{"A":"203.0.113.5"},"technologies":["WordPress","PHP"]}'::jsonb, ARRAY['WHOIS','DNS','SSL','BuiltWith'], 'Government impersonation domain. Registered 5 days ago with privacy protection. Uses WordPress/PHP. Not affiliated with UK government.', now() - interval '6 hours')
ON CONFLICT DO NOTHING;

-- Threat feeds
INSERT INTO threat_feeds (source_name, source_type, ioc_type, ioc_value, severity, tags, fetched_at) VALUES
('AbuseIPDB', 'abuseipdb', 'ip', '185.220.101.45', 'critical', ARRAY['tor','malicious'], now() - interval '1 hour'),
('AlienVault OTX', 'otx', 'ip', '45.155.205.233', 'high', ARRAY['c2','botnet'], now() - interval '2 hours'),
('VirusTotal', 'virustotal', 'url', 'https://secure-bank-login.com/verify', 'critical', ARRAY['phishing'], now() - interval '1 hour'),
('Shodan', 'shodan', 'ip', '194.165.16.78', 'high', ARRAY['scanner'], now() - interval '3 hours'),
('GreyNoise', 'greynoise', 'ip', '104.244.74.211', 'medium', ARRAY['suspicious'], now() - interval '4 hours'),
('URLScan', 'urlscan', 'domain', 'gov-uk-tax-refund.com', 'critical', ARRAY['phishing','government'], now() - interval '1 hour'),
('Malware Bazaar', 'malware_bazaar', 'hash', '44d88612fea8a8f36de82e1278abb02f', 'critical', ARRAY['ransomware'], now() - interval '2 hours'),
('AbuseIPDB', 'abuseipdb', 'ip', '23.129.236.10', 'high', ARRAY['tor','proxy'], now() - interval '5 hours'),
('AlienVault OTX', 'otx', 'domain', 'microsoft365-secure-login.com', 'high', ARRAY['phishing'], now() - interval '6 hours'),
('VirusTotal', 'virustotal', 'hash', 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', 'high', ARRAY['trojan'], now() - interval '7 hours')
ON CONFLICT DO NOTHING;

-- Activity logs
INSERT INTO activity_logs (action, module, entity_type, severity, user_email, details, created_at) VALUES
('ioc_imported', 'Threat Intelligence', 'ioc', 'info', 'analyst@sentinel.io', '{"count":15,"source":"manual"}'::jsonb, now() - interval '10 minutes'),
('threat_detected', 'Dashboard', 'threat', 'critical', 'system@sentinel.io', '{"threat_id":"auto","category":"ransomware"}'::jsonb, now() - interval '2 hours'),
('scam_report_generated', 'Scam Detection', 'scam_report', 'info', 'analyst@sentinel.io', '{"risk_score":95}'::jsonb, now() - interval '1 hour'),
('osint_investigation_started', 'OSINT', 'investigation', 'info', 'analyst@sentinel.io', '{"target":"185.220.101.45"}'::jsonb, now() - interval '3 hours'),
('user_login', 'Auth', 'user', 'info', 'admin@sentinel.io', '{"method":"password","mfa":true}'::jsonb, now() - interval '4 hours'),
('report_generated', 'Reporting', 'report', 'info', 'manager@sentinel.io', '{"format":"pdf","type":"incident"}'::jsonb, now() - interval '5 hours'),
('ioc_retired', 'Threat Intelligence', 'ioc', 'warning', 'analyst@sentinel.io', '{"reason":"false_positive"}'::jsonb, now() - interval '6 hours'),
('api_key_created', 'Admin', 'api_key', 'warning', 'admin@sentinel.io', '{"name":"SIEM Integration"}'::jsonb, now() - interval '8 hours'),
('threat_escalated', 'Dashboard', 'threat', 'critical', 'system@sentinel.io', '{"from":"high","to":"critical"}'::jsonb, now() - interval '12 hours'),
('mitre_mapping_updated', 'Threat Intelligence', 'threat', 'info', 'analyst@sentinel.io', '{"technique":"T1486"}'::jsonb, now() - interval '1 day'),
('feed_sync_completed', 'Threat Intelligence', 'feed', 'info', 'system@sentinel.io', '{"source":"AbuseIPDB","new_iocs":42}'::jsonb, now() - interval '1 day'),
('failed_login_attempt', 'Auth', 'user', 'warning', 'unknown', '{"attempts":5,"ip":"194.165.16.78"}'::jsonb, now() - interval '1 day')
ON CONFLICT DO NOTHING;

-- Notifications
INSERT INTO notifications (title, message, type, channel, priority, read, action_url) VALUES
('Critical Threat Detected', 'LockBit 3.0 ransomware detected on fileserver-01. Immediate response required.', 'threat', 'browser', 'urgent', false, '/threats'),
('Phishing Campaign Active', 'Spear-phishing campaign targeting Finance department detected. 12 emails blocked.', 'warning', 'browser', 'high', false, '/threats'),
('Threat Feed Sync Complete', 'AbuseIPDB sync completed. 42 new IOCs imported.', 'success', 'browser', 'normal', true, '/threat-intelligence'),
('New Scam Report', 'High-risk phishing URL reported: gov-uk-tax-refund.com', 'warning', 'email', 'high', false, '/scam-detection'),
('OSINT Investigation Completed', 'Investigation of 185.220.101.45 completed with 90 risk score.', 'info', 'browser', 'normal', true, '/osint'),
('Report Ready for Review', 'Incident report "LockBit 3.0 Ransomware" is ready for manager review.', 'info', 'browser', 'normal', false, '/reports'),
('API Rate Limit Warning', 'VirusTotal API approaching daily rate limit (85% used).', 'warning', 'browser', 'normal', true, '/admin'),
('System Health: All Systems Operational', 'All platform services are running normally. Uptime: 99.98%', 'success', 'browser', 'low', true, '/admin')
ON CONFLICT DO NOTHING;

-- AI analyses (sample chat session)
INSERT INTO ai_analyses (session_id, role, content, analysis_type, created_at) VALUES
('session-001', 'user', 'Analyze this suspicious email: "Your account has been suspended. Click here to verify: https://secure-bank-login.com/verify"', 'email_analysis', now() - interval '30 minutes'),
('session-001', 'assistant', '## Email Analysis Report

### Threat Assessment: PHISHING - CRITICAL

**Confidence:** 97%

### Key Indicators
1. **Urgency Tactics**: "account has been suspended" creates false urgency
2. **Suspicious URL**: `secure-bank-login.com` is a typosquatted domain not affiliated with any legitimate bank
3. **Action Request**: "Click here to verify" is a classic credential harvesting prompt
4. **Domain Age**: Registered 3 days ago (2024-06-28)

### MITRE ATT&CK Mapping
- **T1566 - Phishing** (Initial Access)

### Recommendations
1. **Do NOT click the link** or enter credentials
2. Block the domain `secure-bank-login.com` at the email gateway
3. Add the URL to IOC database with critical severity
4. Alert all users about this phishing campaign
5. Report the domain to its registrar for abuse

### Risk Score: 95/100 (Critical)

This is a high-confidence phishing attempt using social engineering and brand impersonation.', 'email_analysis', now() - interval '29 minutes')
ON CONFLICT DO NOTHING;
