"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function YearNav({
  currentYear,
  publishedYears,
}: {
  currentYear: number;
  publishedYears: number[];
}) {
  const router = useRouter();

  if (publishedYears.length <= 1) {
    return <div className="text-sm text-muted-foreground">Édition {currentYear}</div>;
  }

  return (
    <Select
      value={currentYear.toString()}
      onValueChange={(v) => router.push(`/state-of-ia/${v}`)}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {publishedYears.map((y) => (
          <SelectItem key={y} value={y.toString()}>
            Édition {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
