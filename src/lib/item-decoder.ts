/**
 * Free Fire Item Decoder
 * Decodes Garena resource IDs into human-readable categories and image URLs
 * Based on the Free Fire API decode specification
 */

export const ITEM_IMAGE_BASE = "https://ffitems.devhubx.org/items";

export type ItemCategory =
  | "badge"
  | "title"
  | "head_frame"
  | "weapon_skin"
  | "pin"
  | "avatar"
  | "character_skill"
  | "pet"
  | "pet_skin"
  | "pet_skill"
  | "banner"
  | "clothing"
  | "unknown";

export interface DecodedItem {
  id: string | number;
  category: ItemCategory;
  subCategory?: string;
  imageUrl: string;
  label: string;
  familyPrefix?: string;
}

// Rank tier mapping for Free Fire BR
export const BR_RANK_TIERS: Record<number, string> = {
  0: "Unranked",
  201: "Bronze",
  202: "Silver",
  203: "Gold",
  204: "Platinum",
  205: "Diamond",
  206: "Heroic",
  207: "Grandmaster",
  321: "Bronze",
  322: "Silver",
  323: "Gold",
  324: "Platinum",
  325: "Diamond",
  326: "Heroic",
  327: "Grandmaster",
};

// Extended rank mapping with more accuracy
export function getRankInfo(rankId: number): { tier: string; emoji: string; color: string } {
  const rankMap: Record<number, { tier: string; emoji: string; color: string }> = {
    0: { tier: "Unranked", emoji: "⚪", color: "text-gray-400" },
    201: { tier: "Bronze III", emoji: "🟤", color: "text-amber-700" },
    202: { tier: "Bronze II", emoji: "🟤", color: "text-amber-700" },
    203: { tier: "Bronze I", emoji: "🟤", color: "text-amber-600" },
    204: { tier: "Silver III", emoji: "⚪", color: "text-gray-300" },
    205: { tier: "Silver II", emoji: "⚪", color: "text-gray-300" },
    206: { tier: "Silver I", emoji: "⚪", color: "text-gray-200" },
    207: { tier: "Gold III", emoji: "🟡", color: "text-yellow-500" },
    208: { tier: "Gold II", emoji: "🟡", color: "text-yellow-500" },
    209: { tier: "Gold I", emoji: "🟡", color: "text-yellow-400" },
    210: { tier: "Platinum III", emoji: "💎", color: "text-cyan-400" },
    211: { tier: "Platinum II", emoji: "💎", color: "text-cyan-400" },
    212: { tier: "Platinum I", emoji: "💎", color: "text-cyan-300" },
    213: { tier: "Diamond III", emoji: "💠", color: "text-violet-400" },
    214: { tier: "Diamond II", emoji: "💠", color: "text-violet-400" },
    215: { tier: "Diamond I", emoji: "💠", color: "text-violet-300" },
    216: { tier: "Heroic", emoji: "🏆", color: "text-orange-500" },
    217: { tier: "Grandmaster", emoji: "👑", color: "text-red-500" },
    321: { tier: "Bronze III", emoji: "🟤", color: "text-amber-700" },
    322: { tier: "Heroic", emoji: "🏆", color: "text-orange-500" },
    323: { tier: "Heroic", emoji: "🏆", color: "text-orange-500" },
    324: { tier: "Platinum I", emoji: "💎", color: "text-cyan-300" },
    325: { tier: "Diamond I", emoji: "💠", color: "text-violet-300" },
    326: { tier: "Heroic", emoji: "🏆", color: "text-orange-500" },
    327: { tier: "Grandmaster", emoji: "👑", color: "text-red-500" },
  };
  return (
    rankMap[rankId] || { tier: `Rank #${rankId}`, emoji: "🎯", color: "text-muted-foreground" }
  );
}

// Item category detection from ID prefix
export function getItemCategory(id: string | number): { category: ItemCategory; label: string; familyPrefix: string } {
  const idStr = String(id);

  if (idStr.startsWith("1001")) return { category: "badge", label: "Badge", familyPrefix: "1001" };
  if (idStr.startsWith("90409")) return { category: "title", label: "Profile Title", familyPrefix: "90409" };
  if (idStr.startsWith("904")) return { category: "title", label: "Profile Title", familyPrefix: "904" };
  if (idStr.startsWith("902")) return { category: "head_frame", label: "Head Frame", familyPrefix: "902" };
  if (idStr.startsWith("901")) return { category: "banner", label: "Profile Banner", familyPrefix: "901" };
  if (idStr.startsWith("907")) return { category: "weapon_skin", label: "Weapon Skin", familyPrefix: "907" };
  if (idStr.startsWith("912")) return { category: "weapon_skin", label: "Weapon Skin (Gloo Wall)", familyPrefix: "912" };
  if (idStr.startsWith("910")) return { category: "pin", label: "Profile Pin", familyPrefix: "910" };
  if (idStr.startsWith("102")) return { category: "avatar", label: "Avatar", familyPrefix: "102" };
  if (idStr.startsWith("1315")) return { category: "pet_skill", label: "Pet Skill", familyPrefix: "1315" };
  if (idStr.startsWith("131")) return { category: "pet_skin", label: "Pet Skin", familyPrefix: "131" };
  if (idStr.startsWith("130")) return { category: "pet", label: "Pet", familyPrefix: "130" };
  // Clothing families
  if (idStr.startsWith("203")) return { category: "clothing", label: "Outfit Top", familyPrefix: "203" };
  if (idStr.startsWith("204")) return { category: "clothing", label: "Outfit Bottom", familyPrefix: "204" };
  if (idStr.startsWith("205")) return { category: "clothing", label: "Shoes", familyPrefix: "205" };
  if (idStr.startsWith("211")) return { category: "clothing", label: "Accessory", familyPrefix: "211" };
  if (idStr.startsWith("214")) return { category: "clothing", label: "Headwear", familyPrefix: "214" };

  return { category: "unknown", label: "Item", familyPrefix: idStr.substring(0, 3) };
}

// Character skill IDs (non-prefix-based)
const CHARACTER_SKILLS: Record<string, string> = {
  "6006": "Kelly - Dash",
  "7506": "Alok - Drop the Beat",
  "4905": "Hayato - Bushido",
  "4306": "Chrono - Time Turner",
  "4804": "K (Captain Booyah)",
  "6906": "Dimitri - Healing Heartbeat",
  "5806": "Maxim - Gluttony",
  "3705": "Moco - Hacker's Eye",
  "5106": "Skyler - Riptide Rhythm",
  "3405": "Andrew - Armor Specialist",
  "5205": "Wukong - Camouflage",
  "4406": "A124 - Thriver",
  "3505": "Misha - Afterburner",
  "5606": "Tatsuya - Musha",
  "6106": "Xayne - Xtreme Encounter",
  "3305": "Joseph - Nutty Movement",
  "4606": "Olivia - Healing Touch",
  "4105": "Ramona - Sustained Raids",
  "6206": "Leon - Buzzer Beater",
  "6706": "J.Biebs - Iron Will",
};

export function decodeItem(id: string | number): DecodedItem {
  const idStr = String(id);
  const { category, label, familyPrefix } = getItemCategory(id);

  // Check if it's a character skill
  if (CHARACTER_SKILLS[idStr]) {
    return {
      id,
      category: "character_skill",
      subCategory: "Active Skill",
      imageUrl: `${ITEM_IMAGE_BASE}/${id}`,
      label: CHARACTER_SKILLS[idStr],
      familyPrefix,
    };
  }

  return {
    id,
    category,
    imageUrl: `${ITEM_IMAGE_BASE}/${id}`,
    label,
    familyPrefix,
  };
}

// Clothing slot labels
export const CLOTHING_SLOT_NAMES = ["Headwear", "Top", "Accessory", "Accessory 2", "Bottom", "Shoes"] as const;

export function decodeOutfit(clothesIds: (string | number)[]): DecodedItem[] {
  return clothesIds.map((id, index) => {
    const decoded = decodeItem(id);
    decoded.label = CLOTHING_SLOT_NAMES[index] || decoded.label;
    return decoded;
  });
}

// Prime privilege labels
export const PRIVELEGE_LABELS: Record<number, string> = {
  8: "Lobby Animation",
  10: "Weekly Salary",
  11: "Weekly Salary",
  12: "Daily Login Reward",
  15: "Game Mode Discount",
  16: "Lobby Wallpaper",
  17: "Chat Bubble",
  19: "Pet Slot",
  20: "Prime Bundle",
  21: "Prime Outfit",
};

// Region mapping
export const REGION_MAP: Record<string, string> = {
  IND: "India",
  BR: "Brazil",
  ID: "Indonesia",
  TH: "Thailand",
  VN: "Vietnam",
  PH: "Philippines",
  MY: "Malaysia",
  SG: "Singapore",
  TW: "Taiwan",
  HK: "Hong Kong",
  ME: "Middle East",
  SA: "South America",
  NA: "North America",
  EU: "Europe",
  RU: "Russia",
};