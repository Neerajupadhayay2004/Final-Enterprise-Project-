'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  IOC,
  Threat,
  ScamReport,
  OSINTInvestigation,
  ThreatActor,
  Campaign,
  ThreatFeed,
  ActivityLog,
  Notification,
  Report,
  MITRETechnique,
  AIAnalysis,
} from '@/lib/supabase';

type DashboardStats = {
  securityScore: number;
  threatLevel: string;
  todayIncidents: number;
  todayScamReports: number;
  totalThreats: number;
  totalIOCs: number;
  maliciousUrls: number;
  maliciousDomains: number;
  maliciousIPs: number;
  criticalThreats: number;
  openThreats: number;
  totalScams: number;
  scamDetected: number;
  totalInvestigations: number;
  activeFeeds: number;
  unreadNotifications: number;
  threats: Threat[];
  iocs: IOC[];
  scams: ScamReport[];
  osint: OSINTInvestigation[];
  feeds: ThreatFeed[];
  notifications: Notification[];
};

export function useDashboardStats(): UseQueryResult<DashboardStats> {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [threats, iocs, scams, osint, feeds, notifications] = await Promise.all([
        supabase.from('threats').select('*'),
        supabase.from('iocs').select('*'),
        supabase.from('scam_reports').select('*'),
        supabase.from('osint_investigations').select('*'),
        supabase.from('threat_feeds').select('*'),
        supabase.from('notifications').select('*'),
      ]);

      const threatsData: Threat[] = (threats.data as Threat[]) || [];
      const iocsData: IOC[] = (iocs.data as IOC[]) || [];
      const scamsData: ScamReport[] = (scams.data as ScamReport[]) || [];
      const osintData: OSINTInvestigation[] = (osint.data as OSINTInvestigation[]) || [];
      const feedsData: ThreatFeed[] = (feeds.data as ThreatFeed[]) || [];
      const notifData: Notification[] = (notifications.data as Notification[]) || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayThreats = threatsData.filter((t) => new Date(t.detected_at) >= today);
      const todayScams = scamsData.filter((s) => new Date(s.created_at) >= today);

      const maliciousUrls = iocsData.filter((i) => i.type === 'url' && i.status === 'active');
      const maliciousDomains = iocsData.filter((i) => i.type === 'domain' && i.status === 'active');
      const maliciousIPs = iocsData.filter((i) => i.type === 'ip' && i.status === 'active');

      const criticalThreats = threatsData.filter((t) => t.severity === 'critical');
      const highThreats = threatsData.filter((t) => t.severity === 'high');
      const openThreats = threatsData.filter((t) => t.status === 'open' || t.status === 'investigating');

      const securityScore = Math.max(
        20,
        100 - criticalThreats.length * 8 - highThreats.length * 4 - openThreats.length * 2 - maliciousIPs.length * 1
      );

      const threatLevel =
        securityScore >= 80 ? 'Low' : securityScore >= 60 ? 'Moderate' : securityScore >= 40 ? 'Elevated' : 'High';

      return {
        securityScore,
        threatLevel,
        todayIncidents: todayThreats.length,
        todayScamReports: todayScams.length,
        totalThreats: threatsData.length,
        totalIOCs: iocsData.length,
        maliciousUrls: maliciousUrls.length,
        maliciousDomains: maliciousDomains.length,
        maliciousIPs: maliciousIPs.length,
        criticalThreats: criticalThreats.length,
        openThreats: openThreats.length,
        totalScams: scamsData.length,
        scamDetected: scamsData.filter((s) => s.is_scam).length,
        totalInvestigations: osintData.length,
        activeFeeds: feedsData.length,
        unreadNotifications: notifData.filter((n) => !n.read).length,
        threats: threatsData,
        iocs: iocsData,
        scams: scamsData,
        osint: osintData,
        feeds: feedsData,
        notifications: notifData,
      };
    },
  });
}

export function useActivityLogs(limit = 20): UseQueryResult<ActivityLog[]> {
  return useQuery<ActivityLog[]>({
    queryKey: ['activity-logs', limit],
    queryFn: async (): Promise<ActivityLog[]> => {
      const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit);
      return (data as ActivityLog[]) || [];
    },
  });
}

export function useThreats(limit = 50): UseQueryResult<Threat[]> {
  return useQuery<Threat[]>({
    queryKey: ['threats', limit],
    queryFn: async (): Promise<Threat[]> => {
      const { data } = await supabase.from('threats').select('*').order('detected_at', { ascending: false }).limit(limit);
      return (data as Threat[]) || [];
    },
  });
}

export function useIOCs(limit = 100): UseQueryResult<IOC[]> {
  return useQuery<IOC[]>({
    queryKey: ['iocs', limit],
    queryFn: async (): Promise<IOC[]> => {
      const { data } = await supabase.from('iocs').select('*').order('created_at', { ascending: false }).limit(limit);
      return (data as IOC[]) || [];
    },
  });
}

export function useScamReports(limit = 50): UseQueryResult<ScamReport[]> {
  return useQuery<ScamReport[]>({
    queryKey: ['scam-reports', limit],
    queryFn: async (): Promise<ScamReport[]> => {
      const { data } = await supabase.from('scam_reports').select('*').order('created_at', { ascending: false }).limit(limit);
      return (data as ScamReport[]) || [];
    },
  });
}

export function useOSINTInvestigations(limit = 50): UseQueryResult<OSINTInvestigation[]> {
  return useQuery<OSINTInvestigation[]>({
    queryKey: ['osint-investigations', limit],
    queryFn: async (): Promise<OSINTInvestigation[]> => {
      const { data } = await supabase.from('osint_investigations').select('*').order('created_at', { ascending: false }).limit(limit);
      return (data as OSINTInvestigation[]) || [];
    },
  });
}

export function useThreatActors(): UseQueryResult<ThreatActor[]> {
  return useQuery<ThreatActor[]>({
    queryKey: ['threat-actors'],
    queryFn: async (): Promise<ThreatActor[]> => {
      const { data } = await supabase.from('threat_actors').select('*').order('created_at', { ascending: false });
      return (data as ThreatActor[]) || [];
    },
  });
}

export function useCampaigns(): UseQueryResult<Campaign[]> {
  return useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async (): Promise<Campaign[]> => {
      const { data } = await supabase.from('campaigns').select('*, threat_actors(name)').order('created_at', { ascending: false });
      return (data as Campaign[]) || [];
    },
  });
}

export function useThreatFeeds(limit = 50): UseQueryResult<ThreatFeed[]> {
  return useQuery<ThreatFeed[]>({
    queryKey: ['threat-feeds', limit],
    queryFn: async (): Promise<ThreatFeed[]> => {
      const { data } = await supabase.from('threat_feeds').select('*').order('fetched_at', { ascending: false }).limit(limit);
      return (data as ThreatFeed[]) || [];
    },
  });
}

export function useNotifications(): UseQueryResult<Notification[]> {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async (): Promise<Notification[]> => {
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      return (data as Notification[]) || [];
    },
  });
}

export function useReports(): UseQueryResult<Report[]> {
  return useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async (): Promise<Report[]> => {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      return (data as Report[]) || [];
    },
  });
}

export function useMITRETechniques(): UseQueryResult<MITRETechnique[]> {
  return useQuery<MITRETechnique[]>({
    queryKey: ['mitre-techniques'],
    queryFn: async (): Promise<MITRETechnique[]> => {
      const { data } = await supabase.from('mitre_techniques').select('*').order('technique_id');
      return (data as MITRETechnique[]) || [];
    },
  });
}

export function useAIAnalyses(sessionId?: string): UseQueryResult<AIAnalysis[]> {
  return useQuery<AIAnalysis[]>({
    queryKey: ['ai-analyses', sessionId],
    queryFn: async (): Promise<AIAnalysis[]> => {
      let query = supabase.from('ai_analyses').select('*').order('created_at', { ascending: true });
      if (sessionId) query = query.eq('session_id', sessionId);
      const { data } = await query.limit(200);
      return (data as AIAnalysis[]) || [];
    },
  });
}
