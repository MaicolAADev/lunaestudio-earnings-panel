import Link from "next/link";
import Image from "next/image";

import { ModelEarningsEntryPanel } from "./ui";

export default function ModelEarningsEntryPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded"
              priority
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold leading-6">
                Cargar ganancias (model_earnings)
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Inserta registros por modelo, plataforma, fecha y tokens
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/5"
            >
              Panel
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <ModelEarningsEntryPanel />
      </main>
    </div>
  );
}
