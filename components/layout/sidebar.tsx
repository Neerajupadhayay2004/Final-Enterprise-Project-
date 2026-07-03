'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  ShieldAlert,
  Brain,
  BarChart3,
  FileText,
  Users,
  Settings,
  Bell,
  Radar,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { href: '/osint', label: 'OSINT', icon: Search, group: 'Investigation' },
  { href: '/scam-detection', label: 'Scam Detection', icon: ShieldAlert, group: 'Investigation' },
  { href: '/threat-intelligence', label: 'Threat Intel', icon: Radar, group: 'Investigation' },
  { href: '/ai-analyst', label: 'AI Analyst', icon: Brain, group: 'Analysis' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, group: 'Analysis' },
  { href: '/reports', label: 'Reports', icon: FileText, group: 'Analysis' },
  { href: '/users', label: 'User Management', icon: Users, group: 'Administration' },
  { href: '/admin', label: 'Admin Panel', icon: Settings, group: 'Administration' },
  { href: '/notifications', label: 'Notifications', icon: Bell, group: 'Administration' },
];

export function Sidebar() {
  const pathname = usePathname();

  const groups = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {});

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/50 backdrop-blur-xl md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-5 shadow-lg shadow-primary/20">
          <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight">SentinelX</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Threat Intelligence
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group}
            </p>
            <div className="space-y-1">
              {items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                        />
                      )}
                      <Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} />
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-chart-2 to-primary text-xs font-bold text-primary-foreground">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-semibold">Admin User</p>
            <p className="truncate text-[10px] text-muted-foreground">admin@sentinel.io</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
        </div>
      </div>
    </aside>
  );
}
