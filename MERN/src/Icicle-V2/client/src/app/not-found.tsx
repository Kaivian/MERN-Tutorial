// client/src/app/not-found.tsx
"use client";

import Link from "next/link";
import { Button, Card, CardBody } from "@heroui/react";
import { useLogout } from "@/hooks/auth/useLogout";

export default function NotFound() {
  const { logout, isLoading } = useLogout({ redirectTo: "/login" });

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground">
      <Card className="w-full max-w-md shadow-lg">
        <CardBody className="py-10 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center bg-content1 text-3xl font-extrabold">
            404
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Không tìm thấy trang
          </h1>
          <p className="mt-2 text-subtitle">
            Đường dẫn sai hoặc nội dung đã bị di chuyển.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link prefetch href="/">
              <Button color="primary">Về trang chủ</Button>
            </Link>

            <Button variant="flat" onPress={() => window.history.back()}>
              Quay lại
            </Button>

            <Button
              color="danger"
              isDisabled={isLoading}
              isLoading={isLoading}
              onPress={logout}
            >
              Đăng xuất
            </Button>
          </div>

          <div className="mt-6 text-xs text-subtitle">Mã lỗi: 404</div>
        </CardBody>
      </Card>
    </div>
  );
}