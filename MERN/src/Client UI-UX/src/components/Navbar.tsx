"use client";
import { Button } from "@heroui/react";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow">
      <h1 className="text-xl font-semibold text-blue-600">MERN Frontend</h1>
      <div className="flex gap-3">
        <Button color="primary" variant="solid">
          Đăng nhập
        </Button>
        <Button color="secondary" variant="bordered">
          Đăng ký
        </Button>
      </div>
    </nav>
  );
}
