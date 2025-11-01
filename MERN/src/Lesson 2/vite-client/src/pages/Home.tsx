import ButtonDemo from "../components/ButtonDemo";

export default function Home() {
  return (
    <section className="text-center mt-12">
      <h2 className="text-3xl font-semibold mb-4">Chào mừng đến với MERN Template</h2>
      <p className="text-gray-600 mb-8">
        Giao diện này dùng Tailwind CSS v4 + HeroUI. Bắt đầu code thôi 🚀
      </p>
      <ButtonDemo />
    </section>
  );
}
