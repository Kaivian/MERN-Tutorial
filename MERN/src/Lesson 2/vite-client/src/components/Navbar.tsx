import { Button } from "@heroui/react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <h1 className="text-2xl font-bold text-blue-600">MERN Front</h1>
      <div className="flex items-center gap-3">
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
