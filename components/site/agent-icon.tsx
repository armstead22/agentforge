'use client';

import {
  Headphones,
  Megaphone,
  Target,
  Receipt,
  Users,
  Star,
  Bot,
  Zap,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Headphones,
  Megaphone,
  Target,
  Receipt,
  Users,
  Star,
  Bot,
  Zap,
  Sparkles,
};

export function AgentIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name] || Bot;
  return <Icon className={className} />;
}
