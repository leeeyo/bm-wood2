"use client";

import Link from "next/link";
import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Action button configuration */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Additional CSS classes */
  className?: string;
  /** Children elements for custom content */
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/**
 * Preset empty states for common scenarios
 */
export const EmptyStatePresets = {
  noProducts: {
    title: "Aucun produit trouvé",
    description: "Commencez par créer votre premier produit.",
    action: {
      label: "Créer un produit",
      href: "/cms/products/new",
    },
  },
  noCategories: {
    title: "Aucune catégorie trouvée",
    description: "Commencez par créer votre première catégorie.",
    action: {
      label: "Créer une catégorie",
      href: "/cms/categories/new",
    },
  },
  noDevis: {
    title: "Aucun devis trouvé",
    description: "Les demandes de devis apparaîtront ici.",
  },
  noUsers: {
    title: "Aucun utilisateur trouvé",
    description: "Commencez par créer un utilisateur.",
    action: {
      label: "Créer un utilisateur",
      href: "/cms/users/new",
    },
  },
  noMedia: {
    title: "Aucun média trouvé",
    description: "Commencez par télécharger vos premiers fichiers.",
    action: {
      label: "Télécharger",
    },
  },
  noSearchResults: {
    title: "Aucun résultat",
    description: "Aucun élément ne correspond à votre recherche. Essayez avec d'autres termes.",
  },
  noActivity: {
    title: "Aucune activité récente",
    description: "Les dernières actions apparaîtront ici.",
  },
} as const;
