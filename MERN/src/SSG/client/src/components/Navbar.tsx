"use client";
import { Button } from "@heroui/react";
import { useTranslation } from "@/i18n";

export default function Navbar() {
  const { t } = useTranslation();
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow">
      <h1 className="text-xl font-semibold text-blue-600">{t('navbar.brand')}</h1>
      <div className="flex gap-3">
        <Button color="primary" variant="solid">
          {t('navbar.login')}
        </Button>
        <Button color="secondary" variant="bordered">
          {t('navbar.register')}
        </Button>
      </div>
    </nav>
  );
}
