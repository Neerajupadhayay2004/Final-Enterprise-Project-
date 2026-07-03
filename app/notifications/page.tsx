'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  Mail,
  MessageSquare,
  Slack,
  Send,
  Globe,
  Webhook,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Shield,
} from 'lucide-react';
import { PageContainer, SectionTitle, EmptyState } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/use-data';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const channelConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  browser: { icon: Globe, color: 'bg-primary/10 text-primary', label: 'Browser' },
  email: { icon: Mail, color: 'bg-chart-2/10 text-chart-2', label: 'Email' },
  slack: { icon: Slack, color: 'bg-chart-5/10 text-chart-5', label: 'Slack' },
  discord: { icon: MessageSquare, color: 'bg-chart-1/10 text-chart-1', label: 'Discord' },
  webhook: { icon: Webhook, color: 'bg-warning/10 text-warning', label: 'Webhook' },
  telegram: { icon: Send, color: 'bg-chart-1/10 text-chart-1', label: 'Telegram' },
};

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  info: { icon: Info, color: 'text-primary' },
  warning: { icon: AlertTriangle, color: 'text-warning' },
  error: { icon: XCircle, color: 'text-destructive' },
  success: { icon: CheckCircle2, color: 'text-success' },
  threat: { icon: Shield, color: 'text-destructive' },
};

export default function NotificationsPage() {
  const { data: notifications, refetch } = useNotifications();

  const handleMarkRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      refetch();
      toast.success('Notification marked as read');
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('read', false);
      refetch();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Notifications list */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <SectionTitle
                title="Notifications"
                description={`${unreadCount} unread of ${(notifications || []).length} total`}
              />
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleMarkAllRead}>
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {(notifications || []).length === 0 ? (
                <EmptyState icon={Bell} title="No notifications" />
              ) : (
                (notifications || []).map((notif, i) => {
                  const typeCfg = typeConfig[notif.type] || typeConfig.info;
                  const TypeIcon = typeCfg.icon;
                  const channelCfg = channelConfig[notif.channel] || channelConfig.browser;
                  const ChannelIcon = channelCfg.icon;

                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                        notif.read ? 'border-border/40 bg-transparent' : 'border-primary/20 bg-primary/5'
                      }`}
                    >
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${channelCfg.color}`}>
                        <TypeIcon className={`h-4 w-4 ${typeCfg.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{notif.title}</p>
                          {!notif.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{notif.message}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <Badge variant="outline" className={`gap-1 text-[10px] ${channelCfg.color}`}>
                            <ChannelIcon className="h-2.5 w-2.5" />
                            {channelCfg.label}
                          </Badge>
                          <Badge variant="outline" className={
                            notif.priority === 'urgent' ? 'border-destructive/30 text-destructive text-[10px]' :
                            notif.priority === 'high' ? 'border-warning/30 text-warning text-[10px]' : 'text-[10px]'
                          }>
                            {notif.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => handleMarkRead(notif.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Channel configuration */}
        <div>
          <Card className="border-border/60 p-5">
            <SectionTitle title="Notification Channels" description="Configure delivery" />
            <div className="space-y-2">
              {Object.entries(channelConfig).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div key={key} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{cfg.label}</span>
                    </div>
                    <Badge variant="outline" className="border-success/30 text-success text-[10px]">
                      Active
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="mt-4 border-border/60 p-5">
            <SectionTitle title="Alert Preferences" />
            <div className="space-y-2">
              {[
                { label: 'Critical threats', enabled: true },
                { label: 'New scam reports', enabled: true },
                { label: 'Feed sync complete', enabled: true },
                { label: 'Report ready', enabled: true },
                { label: 'API rate limit', enabled: true },
                { label: 'System health', enabled: false },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <span className="text-sm font-medium">{pref.label}</span>
                  <Badge variant="outline" className={
                    pref.enabled ? 'border-success/30 text-success text-[10px]' : 'text-[10px]'
                  }>
                    {pref.enabled ? 'On' : 'Off'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
