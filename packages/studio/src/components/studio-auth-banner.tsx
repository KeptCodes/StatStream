"use client";

import { Button } from "@/components/ui/button";
import { useStudioAuthStore } from "@/stores/modal-store";
import { LockKeyholeIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function StudioAuthBanner() {
  const studioAuthModal = useStudioAuthStore();
  const [isKeySet, setIsKeySet] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("studioKey");
    if (storedKey) {
      setIsKeySet(true);
    }
  }, []);

  if (!isKeySet) return null;

  return (
    <div className="dark bg-muted px-4 py-3 text-foreground md:py-2">
      <div className="flex gap-2 md:items-center">
        <div className="flex grow gap-3 md:items-center">
          <LockKeyholeIcon
            className="shrink-0 opacity-60 max-md:mt-0.5"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          <div className="flex grow flex-col justify-between gap-3 md:flex-row md:items-center">
            <p className="text-sm">
              Your Studio Key is required to access secure features. Ensure your
              key is up-to-date for a seamless experience.
            </p>
            <div className="flex gap-2 max-md:flex-wrap">
              <Button
                onClick={() => studioAuthModal.onOpen()}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                Edit Studio Key
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
