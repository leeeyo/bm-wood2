"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  User,
  ExternalLink,
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Newspaper,
  Users,
  Image as ImageIcon,
  Menu,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserRole } from "@/types/models.types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  {
    title: "Mon profil",
    href: "/cms/profile",
    icon: User,
  },
];

export function CMSHeader() {
  const { user, logout, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] ?? "";
    const last = lastName?.[0] ?? "";
    return (first + last).toUpperCase() || "U";
  };

  const getRoleBadgeText = (role?: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "manager":
        return "Manager";
      case "staff":
        return "Personnel";
      default:
        return "Utilisateur";
    }
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
        {/* Desktop: Sidebar trigger */}
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        
        {/* Mobile: Menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="-ml-1 md:hidden h-9 w-9"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="size-5" />
          <span className="sr-only">Menu</span>
        </Button>
        
        <Separator orientation="vertical" className="h-4 hidden md:block" />
        
        {/* Mobile: Logo */}
        <div className="md:hidden flex items-center gap-2">
          <img
            src="/logo-bm-wood.svg"
            alt="BM Wood"
            className="size-6 object-contain"
          />
          <span className="text-sm font-semibold text-muted-foreground italic">CMS</span>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild className="h-9 px-2 sm:px-3">
            <Link href="/" target="_blank" className="flex items-center gap-1.5">
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">Voir le site</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative size-9 rounded-full">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground pt-1">
                    {getRoleBadgeText(user?.role)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/cms/profile">
                    <User className="mr-2 size-4" />
                    <span>Mon profil</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                disabled={isLoading}
                variant="destructive"
              >
                <LogOut className="mr-2 size-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="border-b px-4 py-4">
            <div className="flex items-center gap-2">
              <img
                src="/logo-bm-wood.svg"
                alt="BM Wood"
                className="size-8 object-contain"
              />
              <SheetTitle className="text-base font-semibold text-muted-foreground italic">
                CMS
              </SheetTitle>
            </div>
            <SheetDescription className="sr-only">
              Navigation du CMS
            </SheetDescription>
          </SheetHeader>
          
          <nav className="flex flex-col gap-1 p-4">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                    "active:scale-[0.98] touch-manipulation",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="size-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 border-t p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {getRoleBadgeText(user?.role)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start h-11"
              onClick={() => {
                setMobileNavOpen(false);
                logout();
              }}
              disabled={isLoading}
            >
              <LogOut className="mr-2 size-4" />
              Déconnexion
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
