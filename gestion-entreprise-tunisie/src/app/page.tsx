import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion Entreprise Tunisie
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Application de facturation intelligente pour entreprises tunisiennes
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Connectez-vous à votre compte pour accéder au tableau de bord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm />
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>🇹🇳 Application conforme aux réglementations tunisiennes</p>
          <p>TVA 19% • Multi-devises (TND, EUR, USD) • IA intégrée</p>
        </div>
      </div>
    </div>
  );
}
