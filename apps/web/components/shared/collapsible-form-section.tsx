"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CollapsibleFormSectionProps {
  title: string;
  description?: string;
  actionLabel: string;
  children: ReactNode;
  /** Contenido visible cuando el formulario está colapsado (ej. resumen) */
  collapsedHint?: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleFormSection({
  title,
  description,
  actionLabel,
  children,
  collapsedHint,
  defaultOpen = false,
}: CollapsibleFormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
            {!open && collapsedHint && (
              <div className="mt-2">{collapsedHint}</div>
            )}
          </div>
          <Button
            type="button"
            variant={open ? "ghost" : "outline"}
            size="sm"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => setOpen((value) => !value)}
          >
            {!open && <Plus className="mr-2 h-4 w-4" />}
            {open ? "Cancelar" : actionLabel}
          </Button>
        </div>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}
