"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function HomePage() {
  const { isAuthenticated, activeRole } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    } else if (activeRole === "admin") {
      router.replace("/admin");
    } else if (activeRole === "staff") {
      router.replace("/staff");
    } else if (activeRole === "merchant") {
      router.replace("/merchant");
    } else {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, activeRole, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}
