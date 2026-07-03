'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  Key,
  Bell,
  Moon,
  Sun,
  Activity,
  Eye,
  Settings,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { PageContainer, SectionTitle } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { useActivityLogs } from '@/hooks/use-data';
import { formatDistanceToNow } from 'date-fns';

const roles = [
  {
    name: 'Admin',
    icon: Shield,
    color: 'destructive',
    permissions: ['Full system access', 'User management', 'API key management', 'System configuration', 'Audit log access', 'Report approval'],
    users: 2,
  },
  {
    name: 'Manager',
    icon: ShieldCheck,
    color: 'primary',
    permissions: ['View all data', 'Approve reports', 'Manage team', 'Export reports', 'Configure alerts', 'View audit logs'],
    users: 4,
  },
  {
    name: 'Analyst',
    icon: ShieldAlert,
    color: 'warning',
    permissions: ['Investigate threats', 'Create reports', 'Manage IOCs', 'OSINT searches', 'Scam analysis', 'View dashboard'],
    users: 12,
  },
  {
    name: 'Guest',
    icon: Eye,
    color: 'muted',
    permissions: ['View dashboard', 'Read-only access', 'Limited search', 'No export', 'No modifications'],
    users: 8,
  },
];

const sampleUsers = [
  { name: 'Admin User', email: 'admin@sentinel.io', role: 'Admin', status: 'active', lastActive: '2 minutes ago', mfa: true },
  { name: 'Sarah Chen', email: 'sarah.chen@sentinel.io', role: 'Manager', status: 'active', lastActive: '1 hour ago', mfa: true },
  { name: 'Mike Rodriguez', email: 'mike.r@sentinel.io', role: 'Analyst', status: 'active', lastActive: '5 minutes ago', mfa: false },
  { name: 'Emily Watson', email: 'emily.w@sentinel.io', role: 'Analyst', status: 'active', lastActive: '3 hours ago', mfa: true },
  { name: 'James Park', email: 'james.park@sentinel.io', role: 'Manager', status: 'active', lastActive: '1 day ago', mfa: true },
  { name: 'Lisa Kumar', email: 'lisa.k@sentinel.io', role: 'Analyst', status: 'inactive', lastActive: '5 days ago', mfa: false },
  { name: 'David Brown', email: 'david.b@sentinel.io', role: 'Guest', status: 'active', lastActive: '2 days ago', mfa: false },
  { name: 'Anna Schmidt', email: 'anna.s@sentinel.io', role: 'Analyst', status: 'active', lastActive: '30 minutes ago', mfa: true },
];

const apiKeys = [
  { name: 'SIEM Integration', key: 'sk-sentinel-...4f2a', created: '2024-06-15', lastUsed: '2 minutes ago', permissions: 'Read/Write' },
  { name: 'Splunk Forwarder', key: 'sk-sentinel-...9b1c', created: '2024-05-20', lastUsed: '1 hour ago', permissions: 'Read' },
  { name: 'SOAR Platform', key: 'sk-sentinel-...e7d3', created: '2024-06-01', lastUsed: '5 minutes ago', permissions: 'Read/Write' },
];

export default function UsersPage() {
  const { theme, toggleTheme } = useTheme();
  const { data: logs } = useActivityLogs(10);

  return (
    <PageContainer>
      {/* Role overview */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {roles.map((role, i) => {
          const Icon = role.icon;
          return (
            <motion.div
              key={role.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border/60 p-5">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    role.color === 'destructive' ? 'bg-destructive/10 text-destructive' :
                    role.color === 'primary' ? 'bg-primary/10 text-primary' :
                    role.color === 'warning' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">{role.users} users</Badge>
                </div>
                <p className="mt-3 text-sm font-bold">{role.name}</p>
                <div className="mt-2 space-y-1">
                  {role.permissions.map((perm) => (
                    <div key={perm} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-success" />
                      {perm}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User list */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 p-5">
            <SectionTitle title="User Management" description={`${sampleUsers.length} registered users`} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">User</th>
                    <th className="pb-2 pr-4 font-medium">Role</th>
                    <th className="pb-2 pr-4 font-medium">MFA</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleUsers.map((user) => (
                    <tr key={user.email} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-5 text-xs font-bold text-primary-foreground">
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant="outline"
                          className={
                            user.role === 'Admin' ? 'border-destructive/30 text-destructive' :
                            user.role === 'Manager' ? 'border-primary/30 text-primary' :
                            user.role === 'Analyst' ? 'border-warning/30 text-warning' : ''
                          }
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        {user.mfa ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className={
                          user.status === 'active' ? 'border-success/30 text-success' : 'text-muted-foreground'
                        }>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{user.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Profile + settings */}
        <div className="space-y-6">
          <Card className="border-border/60 p-5">
            <SectionTitle title="Your Profile" />
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-5 text-lg font-bold text-primary-foreground">
                AD
              </div>
              <div>
                <p className="text-sm font-bold">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@sentinel.io</p>
                <Badge variant="outline" className="mt-1 border-destructive/30 text-destructive text-[10px]">Admin</Badge>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">API Keys</span>
                </div>
                <Badge variant="secondary" className="text-xs">{apiKeys.length}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email Alerts</span>
                </div>
                <Badge variant="outline" className="border-success/30 text-success text-[10px]">On</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm">Dark Mode</span>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-xs">
                  Toggle
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-border/60 p-5">
            <SectionTitle title="API Keys" />
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div key={key.name} className="rounded-lg border border-border/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{key.name}</span>
                    <Badge variant="outline" className="text-[10px]">{key.permissions}</Badge>
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{key.key}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Last used: {key.lastUsed}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Audit logs */}
      <Card className="mt-6 border-border/60 p-5">
        <SectionTitle title="Audit Logs" description="User activity and system events" />
        <div className="space-y-2">
          {(logs || []).map((log) => (
            <div key={log.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30">
              <div className={`h-2 w-2 shrink-0 rounded-full ${
                log.severity === 'critical' ? 'bg-destructive' :
                log.severity === 'warning' ? 'bg-warning' :
                log.severity === 'error' ? 'bg-destructive' : 'bg-primary'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
                <p className="text-xs text-muted-foreground">{log.module} · {log.user_email}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
