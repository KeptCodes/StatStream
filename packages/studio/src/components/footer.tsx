"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Footer() {
  const router = useRouter();

  const clearSession = () => {
    Cookies.remove("studio_key");
    Cookies.remove("server_url");
    router.refresh();
  };

  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 mx-auto">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 KeptCodes Organization. All rights reserved.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
          <Link
            href="https://keptcodes.github.io/StatStream/docs/intro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-white"
          >
            Documentation
          </Link>
          <Link
            href="https://github.com/keptCodes"
            className="text-sm text-muted-foreground hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            KeptCodes
          </Link>
          <Link
            href="https://keptcodes.github.io/StatStream/"
            className="text-sm text-muted-foreground hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            StatStream
          </Link>
        </div>

        {/* Clear session button */}
        <Button variant="outline" onClick={clearSession}>
          Clear Session
        </Button>
      </div>
    </footer>
  );
}
