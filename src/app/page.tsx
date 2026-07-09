"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, ExternalLink, Wifi, WifiOff, Database,
  Shield, Key, X, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Copy, Trash2
} from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ITEM_IMAGE_BASE } from "@/lib/item-decoder";
import { FFImage } from "@/components/ff/ff-image";
import { fetchPlayerInfoClient } from "@/lib/ff-api";
import type { FreeFirePlayerInfo } from "@/lib/ff-api";

type DataSource = "live" | "live-browser" | "cache" | "mock";

const SOURCE_CONFIG: Record<DataSource, { label: string; color: string; icon: React.ReactNode; desc: string }> = {
  live: { label: "LIVE", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: <Wifi className="h-3 w-3" />, desc: "Real-time data" },
  "live-browser": { label: "LIVE", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: <Wifi className="h-3 w-3" />, desc: "Real-time from browser" },
  cache: { label: "CACHED", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: <Database className="h-3 w-3" />, desc: "Cached (no API call)" },
  mock: { label: "DEMO", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: <Shield className="h-3 w-3" />, desc: "Sample data" },
};

export default function Home() {
  const [player, setPlayer] = useState<FreeFirePlayerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>("mock");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ff_api_key");
    if (saved) {
      setApiKey(saved);
      setApiKeySaved(true);
    }
  }, []);

  const saveApiKey = useCallback((key: string) => {
    if (key.trim()) {
      localStorage.setItem("ff_api_key", key.trim());
      setApiKey(key.trim());
      setApiKeySaved(true);
    } else {
      localStorage.removeItem("ff_api_key");
      setApiKey("");
      setApiKeySaved(false);
    }
  }, []);

  const handleSearch = useCallback(async (uid: string, region: string) => {
    setIsLoading(true);
    setError(null);
    setPlayer(null);
    setStatusMessage("Connecting...");

    try {
      setStatusMessage("Fetching from server...");
      const apiKeyParam = apiKey ? `&apiKey=${encodeURIComponent(apiKey)}` : "";
      const res = await fetch(`/api/player?uid=${uid}&region=${region}${apiKeyParam}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Server error");
      }
      const data = await res.json();
      const source = data._source as DataSource;
      const message = data._message as string | null;

      if (source === "live" || source === "cache") {
        setPlayer(data);
        setDataSource(source);
        setStatusMessage(message || "");
      } else if (source === "mock") {
        // Server failed — try client-side
        setStatusMessage("Server blocked. Trying browser...");
        const clientResult = await fetchPlayerInfoClient(uid, region);
        if (clientResult) {
          setPlayer(clientResult.data);
          setDataSource("live-browser");
          setStatusMessage(clientResult.message || "Live from browser");
        } else {
          setPlayer(data);
          setDataSource("mock");
          setStatusMessage(message || "API unreachable from all sources");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const sourceConfig = SOURCE_CONFIG[dataSource];
  const isLive = dataSource !== "mock";

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
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className={`p-1.5 rounded-lg transition-colors ${apiKeySaved ? "text-green-400 hover:text-green-300" : "text-muted-foreground hover:text-ff-orange"}`}
              title={apiKeySaved ? "API Key Active" : "Add API Key"}
            >
              <Key className="h-4 w-4" />
            </button>
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
        {/* API Key Panel */}
        <AnimatePresence>
          {showApiKeyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-ff-orange/20 bg-ff-orange/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-ff-orange" />
                    <span className="text-sm font-semibold">API Key (FREE — no payment needed)</span>
                    {apiKeySaved && <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Paste your API key here..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="h-10 bg-card/80 border-border/50 text-sm font-mono"
                    />
                    <Button
                      size="sm"
                      onClick={() => saveApiKey(apiKey)}
                      className="h-10 px-4 bg-ff-orange hover:bg-ff-orange/90 text-white"
                    >
                      Save
                    </Button>
                    {apiKey && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => saveApiKey("")}
                        className="h-10 px-2 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">
                    Get your free key from{" "}
                    <a
                      href="https://developers.freefirecommunity.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ff-orange hover:underline"
                    >
                      developers.freefirecommunity.com
                    </a>
                    {" "}(sign up = free, no card needed). With key: unlimited requests.
                  </p>
                  <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="flex items-center gap-1 text-[11px] text-ff-orange/80 hover:text-ff-orange transition-colors"
                  >
                    {showGuide ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {showGuide ? "Hide setup guide" : "How to get free API key"}
                  </button>
                  <AnimatePresence>
                    {showGuide && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-lg bg-card/60 border border-border/30 p-3 space-y-2 text-[11px] text-muted-foreground/80">
                          <p className="font-semibold text-foreground/80">Step-by-step:</p>
                          <ol className="list-decimal list-inside space-y-1.5">
                            <li>Open <a href="https://developers.freefirecommunity.com" target="_blank" rel="noopener noreferrer" className="text-ff-orange hover:underline">developers.freefirecommunity.com</a></li>
                            <li>Click <strong>Sign Up</strong> / <strong>Register</strong> (free, no credit card)</li>
                            <li>After login, go to <strong>Dashboard</strong> or <strong>API Keys</strong> section</li>
                            <li>Click <strong>&quot;Generate New Key&quot;</strong> or copy your existing key</li>
                            <li>Paste the key in the input above and click <strong>Save</strong></li>
                            <li>Done! Now search any player — unlimited requests</li>
                          </ol>
                          <div className="flex items-start gap-1.5 pt-1 text-amber-400/80">
                            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                            <p>Without API key: only 5 searches/day (shared). With key: much higher limit.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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

          {/* Status indicator */}
          <AnimatePresence>
            {statusMessage && player && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <Badge variant="outline" className={`gap-1.5 text-[11px] px-3 py-1 font-semibold ${sourceConfig.color}`}>
                  {sourceConfig.icon}
                  {sourceConfig.label}
                </Badge>
                <span className="text-[11px] text-muted-foreground/60">
                  {sourceConfig.desc}
                  {statusMessage && ` — ${statusMessage}`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-muted-foreground/60 flex items-center justify-center gap-2"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-ff-orange animate-pulse" />
              {statusMessage}
            </motion.p>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
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
              {/* Mock data warning */}
              {!isLive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 flex items-start gap-2.5"
                >
                  <WifiOff className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-amber-400/90 space-y-1">
                    <p className="font-semibold">Showing Demo Data</p>
                    <p className="text-amber-400/70">
                      {statusMessage || "API limit reached. Click the key icon in header to add a FREE API key for unlimited live data."}
                    </p>
                    <button
                      onClick={() => setShowApiKeyInput(true)}
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
                    >
                      <Key className="h-3 w-3" />
                      Add Free API Key
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Profile Card */}
              <PlayerProfile player={player} dataSource={dataSource} />

              {/* Decorative Items Row */}
              <Card className="border-border/30 bg-card/60">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    <DecorativeItem label="Badge" id={player.basicInfo.badgeId} category="badge" />
                    <DecorativeItem label="Title" id={player.basicInfo.titleId} category="title" />
                    <DecorativeItem label="Head Frame" id={player.basicInfo.headPicId} category="head_frame" />
                    <DecorativeItem label="Pin" id={player.basicInfo.pinId} category="pin" />
                  </div>
                </CardContent>
              </Card>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <OutfitGrid clothes={player.profileInfo.clothes} />
                  <PetCard petInfo={player.petInfo} />
                </div>
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
                  <div className="text-[11px] text-muted-foreground/50 space-y-1">
                    <p>
                      Images: <span className="text-ff-orange/70">ffitems.devhubx.org</span> | 
                      Data: <span className="text-ff-orange/70">Free Fire Community API</span> | 
                      ID prefixes: 203-214=clothing, 907/912=weapon skins, 130=pet, 102=avatar
                    </p>
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
          <p>FF Tracker — Built for the Free Fire community. Not affiliated with Garena.</p>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px] border-border/20 text-muted-foreground/40 h-5 px-1.5">Next.js 16</Badge>
            <Badge variant="outline" className="text-[10px] border-border/20 text-muted-foreground/40 h-5 px-1.5">Tailwind CSS</Badge>
            <Badge variant="outline" className="text-[10px] border-border/20 text-muted-foreground/40 h-5 px-1.5">shadcn/ui</Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DecorativeItem({ label, id, category }: { label: string; id: string; category?: string }) {
  if (!id) return null;
  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-secondary/30 border border-border/10 group-hover:border-ff-orange/20 transition-colors">
        <FFImage
          src={`${ITEM_IMAGE_BASE}/${id}`}
          alt={label}
          category={category || label.toLowerCase().replace(/ /g, "_")}
          label={label}
          className="drop-shadow-md group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <span className="text-[10px] text-muted-foreground/60 font-medium">{label}</span>
    </div>
  );
}