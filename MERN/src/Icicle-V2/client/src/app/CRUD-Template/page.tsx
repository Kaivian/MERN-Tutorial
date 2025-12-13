import ThemeSwitchButton from "@/components/theme-switch/ThemeSwitchButton";
import ThemeSwitchDropDown from "@/components/theme-switch/ThemeSwitchDropDown";

export default function HomePage() {
  return (
    <main className="min-h-screen text-gray-800 bg-background">
      <section className="p-8 text-center">
        <h1 className="text-4xl font-bold">CRUD Template</h1>
        <p className="text-gray-600">A simple CRUD template for Next.js</p>

        <div className="flex justify-center mt-8">
          <ThemeSwitchButton />
        </div>
        <div className="flex justify-center mt-8">
          <ThemeSwitchDropDown />
        </div>
      </section>
    </main>
  );
}