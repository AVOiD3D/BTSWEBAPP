"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  PiggyBank,
  Settings,
  TrendingUp,
  Receipt,
  Building,
} from "lucide-react";

const navigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Vue d'ensemble de votre entreprise",
  },
  {
    name: "Factures",
    href: "/dashboard/factures",
    icon: FileText,
    description: "Gestion des factures et devis",
  },
  {
    name: "Clients",
    href: "/dashboard/clients",
    icon: Users,
    description: "Gestion de la clientèle",
  },
  {
    name: "Produits",
    href: "/dashboard/produits",
    icon: Package,
    description: "Catalogue et inventaire",
  },
  {
    name: "Paiements",
    href: "/dashboard/paiements",
    icon: PiggyBank,
    description: "Suivi des paiements",
  },
  {
    name: "Rapports",
    href: "/dashboard/rapports",
    icon: TrendingUp,
    description: "Analyses et statistiques",
  },
  {
    name: "Reçus",
    href: "/dashboard/reçus",
    icon: Receipt,
    description: "Gestion des reçus",
  },
  {
    name: "Mon Entreprise",
    href: "/dashboard/entreprise",
    icon: Building,
    description: "Informations de l'entreprise",
  },
  {
    name: "Paramètres",
    href: "/dashboard/parametres",
    icon: Settings,
    description: "Configuration générale",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            🇹🇳 Gestion Pro
          </div>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900 border-r-4 border-blue-500 text-blue-700 dark:text-blue-200"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive
                        ? "text-blue-500 dark:text-blue-400"
                        : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300",
                      "mr-3 flex-shrink-0 h-5 w-5"
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>🇹🇳 Conforme aux lois tunisiennes</p>
            <p>TVA 19% • Multi-devises • IA</p>
          </div>
        </div>
      </div>
    </div>
  );
}