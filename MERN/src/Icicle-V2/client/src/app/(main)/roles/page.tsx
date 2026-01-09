"use client"

import SearchInput from "@/components/generals/SearchInput";
import RefreshButton from "@/components/generals/RefreshButton";
import { Button, Tooltip } from "@heroui/react";
import { Plus } from "lucide-react";

export default function RolesPage() {
    const handleRefresh = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="flex flex-col flex-1 min-h-0 gap-2 xl:gap-3 2xl:gap-4">
                <header className="shrink-0 flex items-center justify-between gap-2">
                    <SearchInput
                        placeholder="Tìm theo tên vai trò..."
                        onSearch={(value) => console.log("Call API với:", value)}
                        onSearching={(isTyping) => console.log("Loading state:", isTyping)}
                        className="max-w-105"
                    />
                    
                    <div className="flex gap-2">
                        <RefreshButton onRefresh={handleRefresh} />
                        <Button
                            color="primary"
                            startContent={<Plus size={20} />}
                            className="hidden md:flex font-medium shadow-sm"
                        >
                            Tạo vai trò
                        </Button>
                        <Tooltip content="Tạo vai trò mới">
                            <Button
                                isIconOnly
                                color="primary"
                                className="flex md:hidden shadow-sm"
                            >
                                <Plus size={20} />
                            </Button>
                        </Tooltip>
                    </div>
                </header>

                <section className="flex-1 min-h-0 rounded-medium border-small border-divider flex w-full flex-col overflow-y-auto overflow-hidden bg-background p-4 relative">
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <SearchInput
                                key={i}
                                placeholder={"Tìm theo tên vai trò..." + i}
                                onSearch={(value) => console.log("Call API với:", value)}
                                className="max-w-105"
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}