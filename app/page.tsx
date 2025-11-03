export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-8">
      <section className="max-w-2xl space-y-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Welcome to the Moving Sale dashboard
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          This Next.js app is ready for Supabase integration so you can list
          furniture, accept reservations, and manage everything from an admin
          view.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Start building by wiring up Supabase, adding routes for shoppers and
          admins, and connecting Resend for notifications.
        </p>
      </section>
    </main>
  );
}
