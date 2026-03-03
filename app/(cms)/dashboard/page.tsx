"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  FolderTree,
  FileText,
  Users,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/lib/contexts/auth-context";
import { createAuthHeaders } from "@/lib/api/auth";
import { UserRole } from "@/types/models.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard, StatsCardGrid, EmptyState } from "@/components/cms";

// Activity types
type ActivityType = "devis" | "product" | "category";

interface ActivityItem {
  type: ActivityType;
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
}

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  pendingDevis: number;
  activeUsers: number;
}

export default function CMSDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    pendingDevis: 0,
    activeUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        // Fetch all stats in parallel
        const authHeaders = createAuthHeaders();
        const [productsRes, categoriesRes, devisRes, usersRes] = await Promise.all([
          fetch("/api/products?limit=1").then((res) => res.json()),
          fetch("/api/categories?limit=1").then((res) => res.json()),
          fetch("/api/devis?status=pending&limit=1", { headers: authHeaders }).then((res) => res.json()),
          isAdmin
            ? fetch("/api/users?isActive=true&limit=1", { headers: authHeaders }).then((res) => res.json())
            : Promise.resolve({ pagination: { total: 0 } }),
        ]);

        setStats({
          totalProducts: productsRes.pagination?.total ?? 0,
          totalCategories: categoriesRes.pagination?.total ?? 0,
          pendingDevis: devisRes.pagination?.total ?? 0,
          activeUsers: usersRes.pagination?.total ?? 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [isAdmin]);

  // Fetch recent activity
  useEffect(() => {
    async function fetchActivity() {
      if (!isAuthenticated) return;
      
      setIsLoadingActivity(true);
      try {
        const res = await fetch("/api/dashboard/activity", {
          headers: createAuthHeaders(),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setActivities(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setIsLoadingActivity(false);
      }
    }

    fetchActivity();
  }, [isAuthenticated]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {getGreeting()}, {user?.firstName ?? "Utilisateur"}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Voici un aperçu de votre activité aujourd&apos;hui.
        </p>
      </div>

      {/* Stats Grid */}
      <StatsCardGrid>
        <StatsCard
          title="Produits"
          value={stats.totalProducts}
          description="Total des produits"
          icon={Package}
          isLoading={isLoading}
        />
        <StatsCard
          title="Catégories"
          value={stats.totalCategories}
          description="Catégories actives"
          icon={FolderTree}
          isLoading={isLoading}
        />
        <StatsCard
          title="Devis en attente"
          value={stats.pendingDevis}
          description="Demandes à traiter"
          icon={FileText}
          isLoading={isLoading}
        />
        {isAdmin && (
          <StatsCard
            title="Utilisateurs actifs"
            value={stats.activeUsers}
            description="Membres de l'équipe"
            icon={Users}
            isLoading={isLoading}
          />
        )}
      </StatsCardGrid>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Actions rapides
            </CardTitle>
            <CardDescription>
              Accédez rapidement aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <QuickActionButton
                href="/cms/products"
                icon={Package}
                title="Gérer les produits"
                description="Ajouter, modifier ou supprimer des produits"
              />
              <QuickActionButton
                href="/cms/devis"
                icon={FileText}
                title="Voir les devis"
                description="Consulter et traiter les demandes de devis"
              />
              <QuickActionButton
                href="/cms/categories"
                icon={FolderTree}
                title="Organiser les catégories"
                description="Gérer la structure des catégories"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Activité récente
            </CardTitle>
            <CardDescription>
              Les dernières actions sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Aucune activité récente"
                description="Les dernières actions apparaîtront ici"
                className="py-8"
              />
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <ActivityRow key={`${activity.type}-${activity.id}`} activity={activity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

function QuickActionButton({
  href,
  icon: Icon,
  title,
  description,
}: QuickActionButtonProps) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg border p-3 sm:p-4 transition-colors hover:bg-accent hover:text-accent-foreground active:scale-[0.98] touch-manipulation"
    >
      <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 sm:size-6 text-primary" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground truncate">{description}</span>
      </div>
    </a>
  );
}

// ============ Activity Row Component ============

interface ActivityRowProps {
  activity: ActivityItem;
}

const activityConfig: Record<ActivityType, { 
  icon: React.ElementType; 
  label: string; 
  href: (id: string) => string;
}> = {
  devis: {
    icon: FileText,
    label: "Devis",
    href: (id) => `/cms/devis/${id}`,
  },
  product: {
    icon: Package,
    label: "Produit",
    href: (id) => `/cms/products/${id}`,
  },
  category: {
    icon: FolderTree,
    label: "Catégorie",
    href: (id) => `/cms/categories/${id}`,
  },
};

function ActivityRow({ activity }: ActivityRowProps) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;
  const href = config.href(activity.id);
  
  // Determine if it was created or updated
  const isNew = activity.createdAt === activity.updatedAt;
  const actionLabel = isNew ? "Nouveau" : "Modifié";
  
  // Format relative time
  const relativeTime = formatDistanceToNow(new Date(activity.updatedAt), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-accent"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium truncate">
          {config.label} {activity.title}
        </span>
        <span className="text-xs text-muted-foreground">
          {actionLabel} {relativeTime}
        </span>
      </div>
    </Link>
  );
}
