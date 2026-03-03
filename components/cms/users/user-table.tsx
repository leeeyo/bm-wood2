"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { IUserPublic, UserRole } from "@/types/models.types";
import { deleteUser, toggleUserStatus } from "@/lib/api/users";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileDataCard, ScrollableTableWrapper } from "@/components/cms/responsive-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/contexts/auth-context";

interface UserTableProps {
  users: IUserPublic[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

// Role badge configuration (includes legacy staff/manager for DB users not yet migrated)
type RoleConfig = { label: string; variant: "default" | "secondary" | "outline"; icon: React.ElementType };
const roleConfig: Record<string, RoleConfig> = {
  [UserRole.ADMIN]: {
    label: "Admin",
    variant: "default",
    icon: Shield,
  },
  [UserRole.USER]: {
    label: "Utilisateur",
    variant: "outline",
    icon: User,
  },
  // Legacy roles (fallback for users not yet migrated)
  staff: { label: "Utilisateur", variant: "outline", icon: User },
  manager: { label: "Utilisateur", variant: "outline", icon: User },
};

function getRoleConfig(role: string): RoleConfig {
  return roleConfig[role] ?? roleConfig[UserRole.USER];
}

export function UserTable({ users, isLoading, onRefresh }: UserTableProps) {
  const { user: currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUserPublic | null>(null);
  const [userToToggle, setUserToToggle] = useState<IUserPublic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleDeleteClick = (user: IUserPublic) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatusClick = (user: IUserPublic) => {
    setUserToToggle(user);
    setStatusDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteUser(userToDelete._id);
      if (result.success) {
        toast.success("Utilisateur supprimé", {
          description: `L'utilisateur "${userToDelete.firstName} ${userToDelete.lastName}" a été supprimé.`,
        });
        onRefresh?.();
      } else {
        toast.error("Erreur", {
          description: result.error ?? "Une erreur est survenue lors de la suppression.",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleToggleStatusConfirm = async () => {
    if (!userToToggle) return;

    setIsToggling(true);
    try {
      const newStatus = !userToToggle.isActive;
      const result = await toggleUserStatus(userToToggle._id, newStatus);
      if (result.success) {
        toast.success(newStatus ? "Utilisateur activé" : "Utilisateur désactivé", {
          description: `L'utilisateur "${userToToggle.firstName} ${userToToggle.lastName}" a été ${newStatus ? "activé" : "désactivé"}.`,
        });
        onRefresh?.();
      } else {
        toast.error("Erreur", {
          description: result.error ?? "Une erreur est survenue.",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue.",
      });
    } finally {
      setIsToggling(false);
      setStatusDialogOpen(false);
      setUserToToggle(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  if (isLoading) {
    return <UserTableSkeleton isMobile={isMobile} />;
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <User className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Aucun utilisateur trouvé</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Aucun utilisateur ne correspond à vos critères de recherche.
        </p>
        <Button asChild className="mt-4 h-11">
          <Link href="/cms/users/new">Créer un utilisateur</Link>
        </Button>
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <>
        <div className="space-y-3">
          {users.map((user) => {
            const role = getRoleConfig(user.role);
            const RoleIcon = role.icon;
            const isCurrentUser = currentUser?._id === user._id;

            return (
              <MobileDataCard
                key={user._id}
                title={
                  <span className="flex items-center gap-2">
                    {user.firstName} {user.lastName}
                    {isCurrentUser && (
                      <span className="text-xs text-muted-foreground font-normal">(Vous)</span>
                    )}
                  </span>
                }
                subtitle={user.email}
                status={
                  user.isActive ? (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs">
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Inactif</Badge>
                  )
                }
                data={[
                  {
                    label: "Rôle",
                    value: (
                      <Badge variant={role.variant} className="gap-1 text-xs">
                        <RoleIcon className="size-3" />
                        {role.label}
                      </Badge>
                    ),
                  },
                  {
                    label: "Créé le",
                    value: formatDate(user.createdAt),
                  },
                ]}
                actions={
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="h-9 px-3">
                      <Link href={`/cms/users/${user._id}`}>
                        <Pencil className="size-4 mr-1.5" />
                        Modifier
                      </Link>
                    </Button>
                    {!isCurrentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleStatusClick(user)}>
                            {user.isActive ? (
                              <>
                                <UserX className="size-4 mr-2" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <UserCheck className="size-4 mr-2" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      </>
    );
  }

  // Desktop table view
  return (
    <>
      <ScrollableTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="text-center">Rôle</TableHead>
              <TableHead className="text-center">Statut</TableHead>
              <TableHead className="hidden md:table-cell">Créé le</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const role = getRoleConfig(user.role);
              const RoleIcon = role.icon;
              const isCurrentUser = currentUser?._id === user._id;

              return (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs text-muted-foreground">(Vous)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={role.variant} className="gap-1">
                      <RoleIcon className="size-3" />
                      {role.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.isActive ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="h-9 w-9">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/cms/users/${user._id}`}>
                            <Pencil className="size-4 mr-2" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        {!isCurrentUser && (
                          <>
                            <DropdownMenuItem onClick={() => handleToggleStatusClick(user)}>
                              {user.isActive ? (
                                <>
                                  <UserX className="size-4 mr-2" />
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <UserCheck className="size-4 mr-2" />
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteClick(user)}
                            >
                              <Trash2 className="size-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollableTableWrapper>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Supprimer l&apos;utilisateur</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Êtes-vous sûr de vouloir supprimer l&apos;utilisateur &quot;{userToDelete?.firstName} {userToDelete?.lastName}&quot; ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto h-11 sm:h-10">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="w-full sm:w-auto h-11 sm:h-10 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">
              {userToToggle?.isActive ? "Désactiver" : "Activer"} l&apos;utilisateur
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {userToToggle?.isActive
                ? `L'utilisateur "${userToToggle?.firstName} ${userToToggle?.lastName}" ne pourra plus se connecter.`
                : `L'utilisateur "${userToToggle?.firstName} ${userToToggle?.lastName}" pourra à nouveau se connecter.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isToggling} className="w-full sm:w-auto h-11 sm:h-10">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatusConfirm}
              disabled={isToggling}
              className="w-full sm:w-auto h-11 sm:h-10"
            >
              {isToggling
                ? "Mise à jour..."
                : userToToggle?.isActive
                ? "Désactiver"
                : "Activer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function UserTableSkeleton({ isMobile }: { isMobile?: boolean }) {
  if (isMobile) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-5 w-14" />
              </div>
              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead className="hidden sm:table-cell">Email</TableHead>
          <TableHead className="text-center">Rôle</TableHead>
          <TableHead className="text-center">Statut</TableHead>
          <TableHead className="hidden md:table-cell">Créé le</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32" />
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Skeleton className="h-4 w-40" />
            </TableCell>
            <TableCell className="text-center">
              <Skeleton className="h-5 w-20 mx-auto" />
            </TableCell>
            <TableCell className="text-center">
              <Skeleton className="h-5 w-16 mx-auto" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="size-8" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
