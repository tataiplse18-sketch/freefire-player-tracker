"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crosshair, PawPrint, Zap, Star } from "lucide-react";
import { ITEM_IMAGE_BASE } from "@/lib/item-decoder";

interface WeaponSkinsProps {
  weaponSkins: Array<{ id: string; image: string; label: string }>;
}

export function WeaponSkinsCard({ weaponSkins }: WeaponSkinsProps) {
  if (weaponSkins.length === 0) return null;

  return (
    <Card className="border-border/30 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Crosshair className="h-4 w-4 text-ff-red" />
          Weapon Skins
          <span className="text-xs font-normal text-muted-foreground ml-auto">
            {weaponSkins.length} equipped
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {weaponSkins.map((skin) => (
            <div
              key={skin.id}
              className="group relative rounded-xl bg-secondary/40 border border-border/20 p-3 flex flex-col items-center gap-2 card-lift hover:border-ff-red/30 transition-all duration-200"
            >
              <div className="w-full aspect-square flex items-center justify-center">
                <img
                  src={`${ITEM_IMAGE_BASE}/${skin.id}`}
                  alt={`Weapon skin ${skin.id}`}
                  className="max-w-full max-h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <p className="text-[10px] font-mono text-muted-foreground/60">
                #{skin.id}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface PetInfoProps {
  petInfo: {
    id: string;
    image: string;
    skinId: string;
    skinImage: string;
    skillId: string;
    skillImage: string;
  } | null;
}

export function PetCard({ petInfo }: PetInfoProps) {
  if (!petInfo) return null;

  return (
    <Card className="border-border/30 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <PawPrint className="h-4 w-4 text-ff-amber" />
          Pet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Pet */}
          <div className="flex-1 rounded-xl bg-secondary/40 border border-border/20 p-4 flex flex-col items-center gap-2 card-lift">
            <div className="w-24 h-24 flex items-center justify-center">
              <img
                src={`${ITEM_IMAGE_BASE}/${petInfo.id}`}
                alt="Pet"
                className="max-w-full max-h-full object-contain drop-shadow-lg"
                loading="lazy"
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">#{petInfo.id}</span>
          </div>
          {/* Pet Skin */}
          <div className="flex-1 rounded-xl bg-secondary/40 border border-border/20 p-4 flex flex-col items-center gap-2 card-lift">
            <div className="w-24 h-24 flex items-center justify-center">
              <img
                src={`${ITEM_IMAGE_BASE}/${petInfo.skinId}`}
                alt="Pet Skin"
                className="max-w-full max-h-full object-contain drop-shadow-lg"
                loading="lazy"
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">Skin #{petInfo.skinId}</span>
          </div>
          {/* Pet Skill */}
          <div className="flex-1 rounded-xl bg-secondary/40 border border-border/20 p-4 flex flex-col items-center gap-2 card-lift">
            <div className="w-24 h-24 flex items-center justify-center">
              <img
                src={`${ITEM_IMAGE_BASE}/${petInfo.skillId}`}
                alt="Pet Skill"
                className="max-w-full max-h-full object-contain drop-shadow-lg"
                loading="lazy"
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">Skill #{petInfo.skillId}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SkillsProps {
  skills: Array<{ id: string; label: string; image: string }>;
}

export function SkillsCard({ skills }: SkillsProps) {
  if (skills.length === 0) return null;

  return (
    <Card className="border-border/30 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Zap className="h-4 w-4 text-ff-gold" />
          Equipped Character Skills
          <span className="text-xs font-normal text-muted-foreground ml-auto">
            {skills.length} / 4 slots
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {skills.map((skill, idx) => (
            <div
              key={skill.id}
              className="relative rounded-xl bg-secondary/40 border border-border/20 p-3 flex flex-col items-center gap-2 card-lift hover:border-ff-gold/30 transition-all duration-200"
            >
              {/* Slot indicator */}
              <span className="absolute top-1.5 left-2 text-[9px] font-bold text-muted-foreground/30">
                SLOT {idx + 1}
              </span>
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <img
                  src={`${ITEM_IMAGE_BASE}/${skill.id}`}
                  alt={skill.label}
                  className="max-w-full max-h-full object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <p className="text-xs font-semibold text-foreground/90 text-center leading-tight">
                {skill.label}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface PrimePrivilegesProps {
  privileges: Array<{ id: number; label: string }>;
}

export function PrimePrivilegesCard({ privileges }: PrimePrivilegesProps) {
  if (privileges.length === 0) return null;

  return (
    <Card className="border-border/30 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Star className="h-4 w-4 text-ff-gold" />
          Prime Membership
          <span className="text-xs font-normal text-muted-foreground ml-auto">
            {privileges.length} active perks
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {privileges.map((priv) => (
            <div
              key={priv.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-ff-gold/10 to-ff-amber/10 border border-ff-gold/20 text-xs font-medium text-ff-gold"
            >
              <Star className="h-3 w-3" />
              {priv.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}