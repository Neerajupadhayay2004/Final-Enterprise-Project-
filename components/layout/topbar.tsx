'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Command,
  Activity,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/theme-provider';
import { CommandPalette } from '@/components/layout/command-palette';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Real-time threat intelligence overview' },
  '/osint': { title: 'OSINT Module', subtitle: 'Open-source intelligence investigation' },
  '/scam-detection': { title: 'Scam Detection', subtitle: 'AI-powered fraud and phishing analysis' },
  '/threat-intelligence': { title: 'Threat Intelligence', subtitle: 'IOC management and threat feeds' },
  '/ai-analyst': { title: 'AI Security Analyst', subtitle: 'Intelligent threat analysis assistant' },
  '/analytics': { title: 'Analytics', subtitle: 'Threat trends and risk distribution' },
  '/reports': { title: 'Reports', subtitle: 'Generate and manage security reports' },
  '/users': { title: 'User Management', subtitle: 'Roles, permissions, and access control' },
  '/admin': { title: 'Admin Panel', subtitle: 'Platform configuration and monitoring' },
  '/notifications': { title: 'Notifications', subtitle: 'Alert delivery and notification channels' },
  '/search': { title: 'Global Search', subtitle: 'Search across all threat intelligence data' },
  '/settings': { title: 'Settings', subtitle: 'Platform preferences and configuration' },
};

export function Topbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const page = pageTitles[pathname] || { title: 'SentinelX', subtitle: '' };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const { data: unreadCount } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);
      return count || 0;
    },
  });

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-3 md:hidden">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="hidden flex-col md:flex">
          <h1 className="text-lg font-bold leading-tight tracking-tight">{page.title}</h1>
          <p className="text-xs text-muted-foreground">{page.subtitle}</p>
        </div>

        <div className="relative ml-auto hidden max-w-md flex-1 lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search IOCs, threats, scams..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setCommandOpen(true)}
            className="h-9 border-border/60 bg-muted/50 pl-9 pr-16 text-sm"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:flex">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-3">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="relative h-9 w-9" asChild>
            <a href="/notifications" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unreadCount ? (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </a>
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
            <AnimatePresence mode="wait">
              {theme === 'dark' ? (
                <motion.div key="sun" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                  <Sun className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
                  <Moon className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
              <Badge variant="outline" className="gap-1 border-success/30 text-[10px] font-semibold uppercase tracking-wide">
                <Activity className="h-2.5 w-2.5" />
                Live
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
