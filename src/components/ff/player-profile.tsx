"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Shield, Users, Gamepad2, MapPin, Heart, TrendingUp, User } from "lucide-react";
import { FFImage } from "@/components/ff/ff-image";
import type { FreeFirePlayerInfo } from "@/lib/ff-api";
import { ITEM_IMAGE_BASE } from "@/lib/item-decoder";

interface PlayerProfileProps {
  player: FreeFirePlayerInfo;
  dataSource: string;
}

export function PlayerProfile({ player, dataSource }: PlayerProfileProps) {
  return (
    <Card className="overflow-hidden border-border/30 bg-gradient-to-br from-card via-card to-ff-dark/50">
      {/* Banner Background */}
      <div className="relative h-36 sm:h-44 bg-gradient-to-r from-ff-darker via-ff-dark to-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.7_0.19_50/15%),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.55_0.22_25/10%),transparent_60%)]" />

        {/* Head Frame Image as watermark */}
        <div className="absolute top-1 right-2 sm:top-2 sm:right-4 h-32 w-32 sm:h-40 sm:w-40 flex items-center justify-center">
          <FFImage
            src={`${ITEM_IMAGE_BASE}/${player.basicInfo.headPicId}`}
            alt="Head Frame"
            category="head_frame"
            label="Head Frame"
            className="max-h-full max-w-full opacity-20"
          />
        </div>

        {/* Data source badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            variant={dataSource === "live" ? "default" : "secondary"}
            className={`text-[10px] font-medium ${
              dataSource === "live"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : dataSource === "live-browser" || dataSource === "live-proxy"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}
          >
            {dataSource === "live" ? "LIVE" : dataSource === "live-browser" ? "LIVE (BROWSER)" : dataSource === "live-proxy" ? "LIVE (PROXY)" : "DEMO"}
          </Badge>
        </div>
      </div>

      {/* Avatar & Name */}
      <div className="px-4 sm:px-6 -mt-14 sm:-mt-16 relative z-10 flex items-end gap-4">
        <div className="relative pulse-ring rounded-full shrink-0">
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-card shadow-xl">
            <AvatarImage
              src={`${ITEM_IMAGE_BASE}/${player.profileInfo.avatarId}`}
              alt={player.userName}
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <AvatarFallback className="bg-ff-dark text-ff-orange text-2xl font-bold">
              {player.userName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="pb-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground truncate leading-tight">
            {player.userName}
          </h1>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <Badge variant="outline" className="text-[10px] border-ff-orange/30 text-ff-orange">
              UID: {player.uid}
            </Badge>
            <Badge variant="outline" className="text-[10px] border-border/30 text-muted-foreground">
              {player.regionName}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <Gamepad2 className="h-3 w-3" />
              {player.socialInfo.mode === "CS" ? "Clash Squad" : "Battle Royale"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              S{player.basicInfo.seasonId}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              v{player.basicInfo.releaseVersion}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="px-4 sm:px-6 pt-4 pb-5 space-y-3">
        {/* Stats row: Level + Likes + Account + Gender */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Level"
            value={player.level > 0 ? String(player.level) : "—"}
          />
          <InfoCard
            icon={<Heart className="h-4 w-4 text-pink-400" />}
            label="Likes"
            value={player.likesCount > 0 ? player.likesCount.toLocaleString() : "—"}
          />
          <InfoCard
            icon={<User className="h-4 w-4" />}
            label="Account"
            value={player.accountType}
          />
          <InfoCard
            icon={<Crown className="h-4 w-4" />}
            label="Gender"
            value={player.socialInfo.gender}
          />
        </div>

        {/* Ranks + Clan row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <RankCard
            icon={<Shield className="h-4 w-4" />}
            label="BR Rank"
            value={player.basicInfo.rankLabel}
            points={player.basicInfo.rankPoints}
            emoji={player.basicInfo.rankEmoji}
            colorClass={player.basicInfo.rankColor}
          />
          <RankCard
            icon={<Shield className="h-4 w-4" />}
            label="CS Rank"
            value={player.basicInfo.csRankLabel}
            points={player.basicInfo.csRankPoints}
            emoji={player.basicInfo.csRankEmoji}
            colorClass={player.basicInfo.csRankColor}
          />
          <InfoCard
            icon={<Users className="h-4 w-4" />}
            label="Clan"
            value={player.clanBasicInfo?.name || "No Clan"}
            sub={
              player.clanBasicInfo
                ? `Lv.${player.clanBasicInfo.level} · ${player.clanBasicInfo.memberCount}/${player.clanBasicInfo.maxMembers}`
                : undefined
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function RankCard({
  icon,
  label,
  value,
  points,
  emoji,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  points?: number;
  emoji: string;
  colorClass: string;
}) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3 card-lift">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-lg">{emoji}</span>
        <span className={`font-bold text-sm ${colorClass}`}>{value}</span>
      </div>
      {points !== undefined && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">{points.toLocaleString()} pts</p>
      )}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3 card-lift">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-bold text-sm text-foreground truncate">{value}</p>
      {sub && <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{sub}</p>}
    </div>
  );
}