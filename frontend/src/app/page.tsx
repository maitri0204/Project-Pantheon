export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900">
      <section className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold">Project Pantheon</h1>
        <p className="mt-3 text-slate-600">Unified assessment platform</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href="/login" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">
            Login
          </a>
          <a href="/signup" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800">
            Signup
          </a>
        </div>
      </section>
    </main>
  );
}
