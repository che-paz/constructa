"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Settings, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MobileNavDrawer } from "@/components/shared/mobile-nav-drawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  userEmail: string;
  organizationName: string;
}

export function Navbar({ userEmail, organizationName }: NavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-card/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-card/90 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 md:hidden">
            <p className="truncate text-sm font-semibold">CONSTRUCTA</p>
            <p className="truncate text-xs text-muted-foreground">
              {organizationName}
            </p>
          </div>
        </div>
        <div className="hidden md:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="shrink-0 gap-2 px-2">
              <User className="h-4 w-4" />
              <span className="hidden max-w-[180px] truncate sm:inline">
                {userEmail}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{organizationName}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {userEmail}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <MobileNavDrawer
        open={menuOpen}
        onClose={closeMenu}
        organizationName={organizationName}
      />
    </>
  );
}
