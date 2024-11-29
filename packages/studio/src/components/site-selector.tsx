"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSites from "@/hooks/use-sites";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SiteSelector() {
  const { data, isLoading, error } = useSites();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedValue, setSelectedValue] = useState<string>("ALL");

  // Set the initial selected value from the query parameter
  useEffect(() => {
    const siteParam = searchParams.get("site");
    if (siteParam) {
      setSelectedValue(siteParam);
    }
  }, [searchParams]);

  function onChange(val: string) {
    const currentParams = new URLSearchParams(searchParams.toString());

    if (val === "ALL") {
      currentParams.delete("site"); // Remove 'site' param for 'ALL'
    } else {
      currentParams.set("site", val); // Add or update 'site' param
    }

    router.push(`?${currentParams.toString()}`);
    setSelectedValue(val); // Update the selected value
  }

  return (
    <Select onValueChange={onChange} value={selectedValue}>
      <SelectTrigger className="w-[180px]" disabled={isLoading}>
        <SelectValue placeholder="Select Source" />
      </SelectTrigger>
      <SelectContent>
        {error && <p className="text-red-500 text-sm">{error.message}</p>}
        {data && (
          <>
            <SelectItem key={10} value={"ALL"}>
              All
            </SelectItem>
            {data.map((site, i) => (
              <SelectItem key={i} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
}
