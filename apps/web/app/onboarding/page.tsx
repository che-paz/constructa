import { onboardingAction } from "@/lib/auth/onboarding-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  searchParams: { error?: string };
}

export default function OnboardingPage({ searchParams }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">CONSTRUCTA</h1>
        <p className="text-sm text-muted-foreground">Configura tu empresa</p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Completa tu perfil</CardTitle>
          <CardDescription>
            Crea tu organización para empezar a registrar proyectos
          </CardDescription>
        </CardHeader>
        <form action={onboardingAction}>
          <CardContent className="space-y-4">
            {searchParams.error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {searchParams.error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="organizationName">Nombre de la constructora</Label>
              <Input id="organizationName" name="organizationName" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Continuar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
