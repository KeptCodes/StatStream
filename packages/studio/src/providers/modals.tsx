"use client";

import StudioAuthModal from "@/components/modals/studio-auth-modal";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
export default function Modals() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <>
      <StudioAuthModal />
      <Toaster />
    </>
  );
}
