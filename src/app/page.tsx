"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Github, Info, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/ff/theme-toggle";
import { PlayerSearch } from "@/components/ff/player-search";
import { PlayerProfile } from "@/components/ff/player-profile";
import { OutfitGrid } from "@/components/ff/outfit-grid";
import {
  WeaponSkinsCard,
  PetCard,
  SkillsCard,
  PrimePrivilegesCard,
} from "@/components/ff/info-cards";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ITEM_IMAGE_BASE } from "@/lib/item-decoder";
import type { FreeFirePlayerInfo } from "@/lib/ff-api";

export default function Home() {
  const [player, setPlayer] = useState<FreeFirePlayerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("mock");

  const handleSearch = useCallback(async (uid: string, region: string) => {
    setIsLoading(true);
    setError(null);
    setPlayer(null);

    try {
      const res = await fetch(`/api/player?uid=${uid}&region=${region}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to fetch player data");
      }
      const data = await res.json();
      setPlayer(data);
      setDataSource(data._source || "unknown");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Flame className="h-6 w-6 text-ff-orange" />
              <div className="absolute inset-0 blur-md bg-ff-orange/40 rounded-full" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none tracking-tight">
                <span className="fire-text">FF Tracker</span>
              </h1>
              <p className="text-[10px] text-muted-foreground/60 leading-none mt-0.5">
                Free Fire Player Info
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://developers.freefirecommunity.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-ff-orange transition-colors hidden sm:flex items-center gap-1"
            >
              API Docs <ExternalLink className="h-3 w-3" />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 space-y-8">
        {/* Hero + Search */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
              <span className="fire-text">Look Up Any Player</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Enter a Free Fire UID to see their full decoded profile — ranks,
              outfit visuals, weapon skins, pets, skills, and clan info.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <PlayerSearch onSearch={handleSearch} isLoading={isLoading} />
          </motion.div>

          {/* Quick try button */}
          {!player && !isLoading && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => handleSearch("2259942102", "IND")}
              className="text-xs text-muted-foreground/60 hover:text-ff-orange transition-colors cursor-pointer"
            >
              Try demo: UID 2259942102 (IND) →
            </motion.button>
          )}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center"
          >
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <Skeleton className="h-60 w-full rounded-2xl" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
          </motion.div>
        )}

        {/* Player Data */}
        <AnimatePresence mode="wait">
          {player && (
            <motion.div
              key={player.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Profile Card */}
              <PlayerProfile player={player} dataSource={dataSource} />

              {/* Decorative Items Row */}
              <Card className="border-border/30 bg-card/60">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    <DecorativeItem label="Badge" id={player.basicInfo.badgeId} />
                    <DecorativeItem label="Title" id={player.basicInfo.titleId} />
                    <DecorativeItem label="Head Frame" id={player.basicInfo.headPicId} />
                    <DecorativeItem label="Pin" id={player.basicInfo.pinId} />
                  </div>
                </CardContent>
              </Card>

              {/* Two-column layout for larger screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <OutfitGrid clothes={player.profileInfo.clothes} />
                  <PetCard petInfo={player.petInfo} />
                </div>
                {/* Right Column */}
                <div className="space-y-6">
                  <SkillsCard skills={player.profileInfo.equippedSkills} />
                  <WeaponSkinsCard weaponSkins={player.basicInfo.weaponSkinShows} />
                </div>
              </div>

              {/* Prime Privileges */}
              <PrimePrivilegesCard privileges={player.basicInfo.primePrivileges} />

              {/* Technical Info */}
              <Card className="border-border/20 bg-card/40">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 text-[11px] text-muted-foreground/50">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p>
                        Item images sourced from{" "}
                        <span className="text-ff-orange/70">ffitems.devhubx.org</span> (Garena
                        asset CDN mirror). Player data from{" "}
                        <span className="text-ff-orange/70">Free Fire Community API</span>.
                      </p>
                      <p>
                        All decoded resource IDs are mapped to their visual assets.
                        IDs prefixed with 203/204/205/211/214 = clothing, 907/912 =
                        weapon skins, 130 = pet, 102 = avatar, etc.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground/40">
          <p>
            FF Tracker — Built for the Free Fire community. Not affiliated with Garena.
          </p>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px] border-border/20 text-muted-foreground/40 h-5 px-1.5">
              Next.js 16
            </Badge>
            <Badge variant="outline" className="text-[10px] border-border/20 text-muted-foreground/40 h-5 px-1.5">
              Tailwind CSS
            </Badge>
            <Badge variant="outline" className="text-[10px] border-border/20 text-muted-foreground/40 h-5 px-1.5">
              shadcn/ui
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DecorativeItem({ label, id }: { label: string; id: string }) {
  if (!id) return null;
  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-secondary/30 border border-border/10 group-hover:border-ff-orange/20 transition-colors">
        <img
          src={`${ITEM_IMAGE_BASE}/${id}`}
          alt={label}
          className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <span className="text-[10px] text-muted-foreground/60 font-medium">{label}</span>
    </div>
  );
}