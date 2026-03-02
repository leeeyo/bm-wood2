"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Newspaper,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { UserRole } from "@/types/models.types";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Produits",
    href: "/cms/products",
    icon: Package,
  },
  {
    title: "Catégories",
    href: "/cms/categories",
    icon: FolderTree,
  },
  {
    title: "Devis",
    href: "/cms/devis",
    icon: FileText,
  },
  {
    title: "Blog",
    href: "/cms/blogs",
    icon: Newspaper,
  },
  {
    title: "Utilisateurs",
    href: "/cms/users",
    icon: Users,
    roles: [UserRole.ADMIN],
  },
  {
    title: "Médias",
    href: "/cms/media",
    icon: ImageIcon,
  },
];

export function CMSSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <img
            src="/logo-bm-wood.svg"
            alt="BM Wood"
            className="size-8 object-contain"
          />
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="text-xm text-muted-foreground font-extrabold italic pl-2">CMS</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
