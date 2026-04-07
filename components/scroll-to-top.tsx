"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ScrollToTop({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash) {
      router.replace("/");
    }
  }, []);

  return <>{children}</>;
}
