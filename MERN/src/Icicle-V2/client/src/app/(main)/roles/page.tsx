"use client"

import SearchInput from "@/components/generals/SearchInput";

export default function RolesPage() {
    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="flex flex-col flex-1 min-h-0 gap-2 xl:gap-3 2xl:gap-4">
                <header className="shrink-0">
                    <SearchInput
                        placeholder="Tìm theo tên vai trò..."
                        onSearch={(value) => console.log("Call API với:", value)}
                        onSearching={(isTyping) => console.log("Loading state:", isTyping)}
                        className="max-w-105"
                    />
                </header>
                <section className="flex-1 min-h-0 rounded-medium border-small border-divider flex w-full flex-col overflow-y-auto overflow-hidden bg-background p-4 relative">
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <SearchInput
                                placeholder={"Tìm theo tên vai trò..." + i}
                                onSearch={(value) => console.log("Call API với:", value)}
                                onSearching={(isTyping) => console.log("Loading state:", isTyping)}
                                className="max-w-105"
                            />
                        ))}
                    </div>

                </section>
            </div>
        </div>
    );
}