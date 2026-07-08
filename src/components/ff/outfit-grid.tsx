"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, Crosshair, Sparkles } from "lucide-react";
import { ITEM_IMAGE_BASE, CLOTHING_SLOT_NAMES } from "@/lib/item-decoder";

interface OutfitGridProps {
  clothes: Array<{
    id: string;
    label: string;
    image: string;
    category: string;
  }>;
}

const SLOT_ICONS = [Shirt, Shirt, Sparkles, Sparkles, Shirt, Shirt];

export function OutfitGrid({ clothes }: OutfitGridProps) {
  return (
    <Card className="border-border/30 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Shirt className="h-4 w-4 text-ff-orange" />
          Equipped Outfit
          <span className="text-xs font-normal text-muted-foreground ml-auto">
            {clothes.length} items
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {clothes.map((item, index) => {
            const IconComponent = SLOT_ICONS[index] || Shirt;
            return (
              <div
                key={item.id}
                className="group relative rounded-xl bg-secondary/40 border border-border/20 p-2 sm:p-3 flex flex-col items-center gap-2 card-lift hover:border-ff-orange/30 transition-all duration-200"
              >
                {/* Item Image */}
                <div className="relative w-full aspect-square flex items-center justify-center">
                  <img
                    src={`${ITEM_IMAGE_BASE}/${item.id}`}
                    alt={CLOTHING_SLOT_NAMES[index] || item.label}
                    className="max-w-full max-h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Slot number */}
                  <span className="absolute top-0.5 left-0.5 text-[9px] font-bold text-muted-foreground/40">
                    #{index + 1}
                  </span>
                </div>
                {/* Label */}
                <div className="text-center w-full">
                  <p className="text-[10px] sm:text-xs font-medium text-foreground/90 truncate">
                    {CLOTHING_SLOT_NAMES[index]}
                  </p>
                  <p className="text-[9px] text-muted-foreground/50 font-mono">
                    {item.id}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}