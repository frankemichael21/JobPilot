import {
  LayoutDashboard,
  Briefcase,
  FileText,
  FolderOpen,
  UserRound,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/bewerbungen", label: "Bewerbungen", icon: FileText },
  { href: "/dokumente", label: "Dokumente", icon: FolderOpen },
  { href: "/profil", label: "Profil", icon: UserRound },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
];
