"use client";

import { useState } from "react";
import { Search, Loader2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGION_MAP } from "@/lib/item-decoder";

interface PlayerSearchProps {
  onSearch: (uid: string, region: string) => void;
  isLoading: boolean;
}

export function PlayerSearch({ onSearch, isLoading }: PlayerSearchProps) {
  const [uid, setUid] = useState("");
  const [region, setRegion] = useState("IND");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uid.trim() && /^\d+$/.test(uid.trim())) {
      onSearch(uid.trim(), region);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter Free Fire UID..."
            value={uid}
            onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
            className="pl-10 h-12 text-base bg-card border-border/50 focus:border-ff-orange/50 focus:ring-ff-orange/20 placeholder:text-muted-foreground/60"
            disabled={isLoading}
          />
        </div>
        <Select value={region} onValueChange={setRegion} disabled={isLoading}>
          <SelectTrigger className="h-12 w-full sm:w-36 bg-card border-border/50 focus:border-ff-orange/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REGION_MAP).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="submit"
          disabled={!uid.trim() || isLoading}
          className="h-12 px-6 bg-gradient-to-r from-ff-orange to-ff-red hover:from-ff-orange/90 hover:to-ff-red/90 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-ff-orange/20 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Flame className="h-4 w-4 mr-2" />
              Lookup
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground/60 mt-2 text-center">
        Enter your in-game UID (numbers only) to view your full player profile
      </p>
    </form>
  );
}