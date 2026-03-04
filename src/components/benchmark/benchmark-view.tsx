"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

import { DIMENSIONS } from "@/data/dimensions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BenchmarkPercentiles } from "@/lib/queries/state-of-ia";

const MIN_SEGMENT_THRESHOLD = 5;

const SECTOR_LABELS: Record<string, string> = {
  esn: "ESN / Consulting",
  editor: "Éditeur logiciel",
  dsi: "DSI / Entreprise",
  startup: "Startup / Scale-up",
  other: "Autre",
};

const SIZE_LABELS: Record<string, string> = {
  "1-10": "1-10 personnes",
  "11-50": "11-50 personnes",
  "51-200": "51-200 personnes",
  "201-1000": "201-1000 personnes",
  "1000+": "1000+ personnes",
};

export function BenchmarkView({
  orgId,
  orgHash,
  year,
  publishedYears,
  percentiles,
  segmentCounts,
}: {
  orgId: string;
  orgHash: string;
  year: number;
  publishedYears: number[];
  percentiles: BenchmarkPercentiles | null;
  segmentCounts: {
    bySector: { sector: string | null; count: number }[];
    bySize: { size: string | null; count: number }[];
  };
}) {
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const router = useRouter();

  if (!percentiles) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Votre organisation n&apos;apparaît pas dans les données du State of IA {year}.
            Cela peut signifier qu&apos;aucune campagne fermée avec des diagnostics complétés
            n&apos;existait lors de l&apos;extraction.
          </p>
        </CardContent>
      </Card>
    );
  }

  function isSectorAvailable(sector: string): boolean {
    const count = segmentCounts.bySector.find((s) => s.sector === sector)?.count ?? 0;
    return count >= MIN_SEGMENT_THRESHOLD;
  }

  function isSizeAvailable(size: string): boolean {
    const count = segmentCounts.bySize.find((s) => s.size === size)?.count ?? 0;
    return count >= MIN_SEGMENT_THRESHOLD;
  }

  function handleYearChange(newYear: string) {
    router.push(`/orgs/${orgId}/benchmark?year=${newYear}`);
  }

  function handleFilterChange(sector: string, size: string) {
    const params = new URLSearchParams();
    params.set("year", year.toString());
    if (sector !== "all") params.set("sector", sector);
    if (size !== "all") params.set("size", size);
    router.push(`/orgs/${orgId}/benchmark?${params.toString()}`);
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Year selector + Filters */}
        <div className="flex flex-wrap items-end gap-4">
          {publishedYears.length > 1 && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Année</label>
              <Select value={year.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {publishedYears.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Secteur</label>
            <Select
              value={selectedSector}
              onValueChange={(v) => {
                setSelectedSector(v);
                handleFilterChange(v, selectedSize);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les secteurs</SelectItem>
                {Object.entries(SECTOR_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} disabled={!isSectorAvailable(key)}>
                    {label}
                    {!isSectorAvailable(key) && " (< 5 orgs)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Taille</label>
            <Select
              value={selectedSize}
              onValueChange={(v) => {
                setSelectedSize(v);
                handleFilterChange(selectedSector, v);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les tailles</SelectItem>
                {Object.entries(SIZE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} disabled={!isSizeAvailable(key)}>
                    {label}
                    {!isSizeAvailable(key) && " (< 5 orgs)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Global percentile */}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-muted-foreground">Score global</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{percentiles.globalPercentile}</span>
              <span className="text-2xl text-muted-foreground">e percentile</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Score : {percentiles.globalScore.toFixed(2)} / 4 — sur{" "}
              {percentiles.totalOrganizations} organisations
            </p>
            <div className="w-full max-w-md">
              <Progress value={percentiles.globalPercentile} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Percentiles by dimension */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Positionnement par dimension
              <Tooltip>
                <TooltipTrigger>
                  <Info className="size-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Le percentile indique votre position relative parmi les organisations
                  participantes. Un percentile de 72 signifie que vous êtes devant 72% des
                  organisations.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {DIMENSIONS.map((dim) => {
              const percentile = percentiles.dimensionPercentiles[dim.id];
              const score = percentiles.dimensionScores[dim.id];
              if (percentile == null) return null;

              return (
                <div key={dim.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dim.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {score?.toFixed(2)} / 4
                      </span>
                      <Badge variant="secondary">{percentile}e %ile</Badge>
                    </div>
                  </div>
                  <Progress value={percentile} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
