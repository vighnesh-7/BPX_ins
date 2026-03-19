import ClaimsList from "@/components/ClaimsList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <h1 className="text-xl font-bold text-gray-900">
          BPX Claims Processing Dashboard
        </h1>
      </header>
      <main className="px-8 py-8">
        <ClaimsList />
      </main>
    </div>
  );
}
