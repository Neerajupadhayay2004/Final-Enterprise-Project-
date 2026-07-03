'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  Globe,
  Mail,
  Server,
  Link2,
  Hash,
} from 'lucide-react';

const pages = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/osint', label: 'OSINT Investigation', icon: Search },
  { href: '/scam-detection', label: 'Scam Detection', icon: ShieldAlert },
  { href: '/threat-intelligence', label: 'Threat Intelligence', icon: Radar },
  { href: '/ai-analyst', label: 'AI Security Analyst', icon: Brain },
  { href: '/analytics', label: 'Analytics Dashboard', icon: BarChart3 },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/users', label: 'User Management', icon: Users },
  { href: '/admin', label: 'Admin Panel', icon: Settings },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

const quickSearches = [
  { label: 'Search IP Address', icon: Server, href: '/osint?type=ip' },
  { label: 'Search Domain', icon: Globe, href: '/osint?type=domain' },
  { label: 'Search Email', icon: Mail, href: '/osint?type=email' },
  { label: 'Search URL', icon: Link2, href: '/scam-detection' },
  { label: 'Search Hash', icon: Hash, href: '/threat-intelligence' },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();

  const navigate = (href: string) => {
    router.push(href);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, IOCs, threats, or run a quick investigation..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <CommandItem key={page.href} onSelect={() => navigate(page.href)}>
                <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {page.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="Quick Actions">
          {quickSearches.map((qs) => {
            const Icon = qs.icon;
            return (
              <CommandItem key={qs.label} onSelect={() => navigate(qs.href)}>
                <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {qs.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
