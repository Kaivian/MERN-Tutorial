// client/src/components/errors/AccessDenied.tsx
"use client";

import React from "react";
import { Button } from "@heroui/react"; // <-- Lưu ý: Tôi đã xóa "Image" khỏi import này vì không dùng nữa
import Link from "next/link";
import { siteConfig } from "@/config/site.config";

// --- QUAN TRỌNG: Hãy đảm bảo đường dẫn import này trỏ đúng đến file IconSwitch của bạn ---
import IconSwitch from "@/components/icons/IconSwitch"; 
// ----------------------------------------------------------------------------------------

export default function AccessDenied() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8 text-center animate-appearance-in">
            <IconSwitch 
                name="AccessDenied"
                className="dark:opacity-50"
            />

            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                    Truy cập bị từ chối
                </h2>
                <p className="text-default-500 max-w-md mx-auto">
                    Bạn không có đủ quyền hạn để xem trang này. <br />
                    Vui lòng liên hệ quản trị viên nếu bạn cần truy cập.
                </p>
            </div>

            <Button
                as={Link}
                href={siteConfig.links.dashboard.path}
                color="primary"
                variant="flat"
                className="font-medium"
            >
                Quay về Dashboard
            </Button>
        </div>
    );
}