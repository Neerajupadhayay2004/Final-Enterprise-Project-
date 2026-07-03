'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radar,
  Plus,
  Server,
  Link2,
  Globe,
  Hash,
  Mail,
  Download,
  Upload,
  Filter,
  Search,
  Activity,
  Users,
  Crosshair,
  Database,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { PageContainer, SectionTitle, SeverityBadge, EmptyState } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  useIOCs,
  useThreatFeeds,
  useThreatActors,
  useCampaigns,
  useMITRETechniques,
} from '@/hooks/use-data';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const iocTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  ip: Server,
  url: Link2,
  domain: Globe,
  hash: Hash,
  email: Mail,
};

const feedSources = [
  { name: 'VirusTotal', type: 'virustotal', color: 'bg-chart-1' },
  { name: 'AbuseIPDB', type: 'abuseipdb', color: 'bg-chart-4' },
  { name: 'AlienVault OTX', type: 'otx', color: 'bg-chart-2' },
  { name: 'Shodan', type: 'shodan', color: 'bg-chart-3' },
  { name: 'URLScan', type: 'urlscan', color: 'bg-chart-5' },
  { name: 'GreyNoise', type: 'greynoise', color: 'bg-primary' },
  { name: 'Malware Bazaar', type: 'malware_bazaar', color: 'bg-warning' },
];

export default function ThreatIntelligencePage() {
  const [activeTab, setActiveTab] = useState('iocs');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddIOC, setShowAddIOC] = useState(false);
  const [newIOC, setNewIOC] = useState({ type: 'ip', value: '', severity: 'medium', description: '' });

  const { data: iocs, refetch: refetchIOCs } = useIOCs(100);
  const { data: feeds } = useThreatFeeds(50);
  const { data: actors } = useThreatActors();
  const { data: campaigns } = useCampaigns();
  const { data: techniques } = useMITRETechniques();

  const filteredIOCs = (iocs || []).filter((ioc) => {
    if (filterType !== 'all' && ioc.type !== filterType) return false;
    if (search && !ioc.value.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAddIOC = async () => {
    if (!newIOC.value.trim()) {
      toast.error('Please enter an IOC value');
      return;
    }
    try {
      await supabase.from('iocs').insert({
        type: newIOC.type,
        value: newIOC.value.trim(),
        severity: newIOC.severity,
        description: newIOC.description || null,
        confidence: 75,
        source: 'Manual',
        tags: [],
        mitre_tactics: [],
        status: 'active',
      });
      toast.success('IOC added successfully');
      setNewIOC({ type: 'ip', value: '', severity: 'medium', description: '' });
      setShowAddIOC(false);
      refetchIOCs();
    } catch {
      toast.error('Failed to add IOC');
    }
  };

  const handleExportSTIX = () => {
    const stixData = {
      type: 'bundle',
      id: 'bundle--' + Date.now(),
      objects: (iocs || []).map((ioc) => ({
        type: 'indicator',
        id: `indicator--${ioc.id}`,
        name: ioc.value,
        pattern: `[${ioc.type}:value = '${ioc.value}']`,
        labels: [ioc.severity],
        created: ioc.created_at,
        modified: ioc.updated_at,
      })),
    };
    const blob = new Blob([JSON.stringify(stixData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iocs-stix.json';
    a.click();
    toast.success('STIX bundle exported');
  };

  return (
    <PageContainer>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="iocs" className="gap-1.5"><Database className="h-3.5 w-3.5" /> IOCs</TabsTrigger>
          <TabsTrigger value="feeds" className="gap-1.5"><Radar className="h-3.5 w-3.5" /> Feeds</TabsTrigger>
          <TabsTrigger value="mitre" className="gap-1.5"><Crosshair className="h-3.5 w-3.5" /> MITRE</TabsTrigger>
          <TabsTrigger value="actors" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Actors</TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Campaigns</TabsTrigger>
        </TabsList>

        {/* IOCs */}
        <TabsContent value="iocs">
          <Card className="border-border/60 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <SectionTitle title="IOC Management" description={`${filteredIOCs.length} indicators of compromise`} />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportSTIX}>
                  <Download className="h-3.5 w-3.5" /> Export STIX
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Import
                </Button>
                <Button size="sm" className="gap-1.5" onClick={() => setShowAddIOC(!showAddIOC)}>
                  <Plus className="h-3.5 w-3.5" /> Add IOC
                </Button>
              </div>
            </div>

            {showAddIOC && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <select
                    value={newIOC.type}
                    onChange={(e) => setNewIOC({ ...newIOC, type: e.target.value })}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="ip">IP</option>
                    <option value="url">URL</option>
                    <option value="domain">Domain</option>
                    <option value="hash">Hash</option>
                    <option value="email">Email</option>
                  </select>
                  <Input
                    placeholder="IOC value..."
                    value={newIOC.value}
                    onChange={(e) => setNewIOC({ ...newIOC, value: e.target.value })}
                  />
                  <select
                    value={newIOC.severity}
                    onChange={(e) => setNewIOC({ ...newIOC, severity: e.target.value })}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <Button onClick={handleAddIOC}>Add</Button>
                </div>
              </motion.div>
            )}

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search IOCs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-9"
                />
              </div>
              <div className="flex gap-1">
                {['all', 'ip', 'url', 'domain', 'hash', 'email'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className="h-9 capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Type</th>
                    <th className="pb-2 pr-4 font-medium">Value</th>
                    <th className="pb-2 pr-4 font-medium">Severity</th>
                    <th className="pb-2 pr-4 font-medium">Confidence</th>
                    <th className="pb-2 pr-4 font-medium">Source</th>
                    <th className="pb-2 pr-4 font-medium">Country</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIOCs.map((ioc) => {
                    const Icon = iocTypeIcons[ioc.type] || Hash;
                    return (
                      <tr key={ioc.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium uppercase">{ioc.type}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="font-mono text-xs">{ioc.value}</span>
                        </td>
                        <td className="py-2.5 pr-4"><SeverityBadge severity={ioc.severity} /></td>
                        <td className="py-2.5 pr-4">
                          <span className="text-xs font-medium">{ioc.confidence}%</span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="text-xs text-muted-foreground">{ioc.source}</span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="text-xs text-muted-foreground">{ioc.country || '—'}</span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge
                            variant="outline"
                            className={
                              ioc.status === 'active'
                                ? 'border-destructive/30 text-[10px] text-destructive'
                                : 'text-[10px]'
                            }
                          >
                            {ioc.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(ioc.last_seen), { addSuffix: true })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Feeds */}
        <TabsContent value="feeds">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="border-border/60 p-5 lg:col-span-2">
              <SectionTitle title="Threat Feed Aggregation" description="External intelligence sources" />
              <div className="space-y-2">
                {(feeds || []).map((feed) => (
                  <div key={feed.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
                    <div className={`h-8 w-8 shrink-0 rounded-lg ${feedSources.find((f) => f.name === feed.source_name)?.color || 'bg-primary'} flex items-center justify-center`}>
                      <Radar className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{feed.source_name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {feed.ioc_type}: {feed.ioc_value}
                      </p>
                    </div>
                    <SeverityBadge severity={feed.severity} />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(feed.fetched_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border/60 p-5">
              <SectionTitle title="Connected Sources" description="7 intelligence feeds" />
              <div className="space-y-2">
                {feedSources.map((source) => (
                  <div key={source.name} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${source.color}`} />
                      <span className="text-sm font-medium">{source.name}</span>
                    </div>
                    <Badge variant="outline" className="border-success/30 text-[10px] text-success">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* MITRE */}
        <TabsContent value="mitre">
          <Card className="border-border/60 p-5">
            <SectionTitle title="MITRE ATT&CK Mapping" description="Technique reference and threat mapping" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {(techniques || []).map((tech) => (
                <motion.div
                  key={tech.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-border/50 p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {tech.technique_id}
                    </Badge>
                    <SeverityBadge severity={tech.severity} />
                  </div>
                  <p className="mt-2 text-sm font-semibold">{tech.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{tech.tactic}</p>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{tech.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tech.platform.slice(0, 3).map((p) => (
                      <Badge key={p} variant="secondary" className="text-[9px]">{p}</Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Actors */}
        <TabsContent value="actors">
          <Card className="border-border/60 p-5">
            <SectionTitle title="Threat Actor Profiles" description={`${(actors || []).length} tracked threat actors`} />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(actors || []).map((actor) => (
                <motion.div
                  key={actor.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-border/50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold">{actor.name}</p>
                      <p className="text-xs text-muted-foreground">{actor.origin_country || 'Unknown origin'}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        actor.sophistication === 'expert' ? 'border-destructive/30 text-destructive' :
                        actor.sophistication === 'advanced' ? 'border-warning/30 text-warning' : ''
                      }
                    >
                      {actor.sophistication}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{actor.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {actor.aliases.slice(0, 3).map((alias) => (
                      <Badge key={alias} variant="secondary" className="text-[9px]">{alias}</Badge>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Motivation: {actor.motivation}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {actor.ttps.slice(0, 4).map((ttp) => (
                      <Badge key={ttp} variant="outline" className="font-mono text-[9px]">{ttp}</Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Campaigns */}
        <TabsContent value="campaigns">
          <Card className="border-border/60 p-5">
            <SectionTitle title="Campaign Tracking" description={`${(campaigns || []).length} active threat campaigns`} />
            <div className="space-y-3">
              {(campaigns || []).map((campaign) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-border/50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold">{campaign.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{campaign.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={campaign.severity} />
                      <Badge variant="outline" className="text-[10px] capitalize">{campaign.status}</Badge>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground">IOCs</p>
                      <p className="font-bold">{campaign.ioc_count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">First Seen</p>
                      <p className="font-bold">{formatDistanceToNow(new Date(campaign.first_seen), { addSuffix: true })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Countries</p>
                      <p className="font-bold">{campaign.target_countries.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sectors</p>
                      <p className="font-bold">{campaign.target_sectors.length}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {campaign.target_countries.map((c) => (
                      <Badge key={c} variant="secondary" className="text-[9px]">{c}</Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
