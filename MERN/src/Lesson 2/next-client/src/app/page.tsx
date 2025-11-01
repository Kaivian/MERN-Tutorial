import Navbar from "../components/Navbar";
import ButtonDemo from "../components/ButtonDemo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <section className="p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600">
          🚀 Next.js + Tailwind v4 + HeroUI Template
        </h1>
        <p className="text-gray-600 mt-4 mb-6">
          Template này sẵn sàng để kết nối với backend Express/Mongo.
        </p>
        <ButtonDemo />
      </section>
    </main>
  );
}
