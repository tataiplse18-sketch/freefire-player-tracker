/**
 * Free Fire API Client
 * Multi-strategy fetching with aggressive caching
 * 
 * Strategy order:
 * 1. Server cache (6hr TTL) — zero API calls
 * 2. Server direct API call (public endpoint)
 * 3. Client browser direct (each user has own IP = own 5/day)
 * 4. Client CORS proxy rotation (multiple proxies = distributed limits)
 * 5. Mock fallback (only when everything fails)
 */

import { decodeItem, decodeOutfit, getRankInfo, PRIVELEGE_LABELS, REGION_MAP } from "./item-decoder";

// ─── TYPES ───────────────────────────────────────────────────────

export interface FreeFirePlayerInfo {
  uid: string;
  userName: string;
  region: string;
  regionName: string;
  accountType: string;
  level: number;
  likesCount: number;
  basicInfo: {
    rank: number;
    rankLabel: string;
    rankEmoji: string;
    rankColor: string;
    rankPoints?: number;
    csRank: number;
    csRankLabel: string;
    csRankEmoji: string;
    csRankColor: string;
    csRankPoints?: number;
    badgeId: string;
    badgeImage: string;
    titleId: string;
    titleImage: string;
    headPicId: string;
    headPicImage: string;
    weaponSkinShows: Array<{ id: string; image: string; label: string }>;
    pinId: string;
    pinImage: string;
    seasonId: number;
    releaseVersion: string;
    primePrivileges: Array<{ id: number; label: string }>;
  };
  profileInfo: {
    avatarId: string;
    avatarImage: string;
    equippedSkills: Array<{ id: string; label: string; image: string }>;
    clothes: Array<{ id: string; label: string; image: string; category: string }>;
  };
  petInfo: {
    id: string;
    image: string;
    skinId: string;
    skinImage: string;
    skillId: string;
    skillImage: string;
  } | null;
  clanBasicInfo: {
    clanId: string;
    name: string;
    level: number;
    memberCount: number;
    maxMembers: number;
  } | null;
  socialInfo: {
    gender: string;
    language: string;
    mode: string;
    rankShow: string;
  };
  captainBasicInfo: {
    uid: string;
    name: string;
    bannerId: string;
    bannerImage: string;
    headPicId: string;
    headPicImage: string;
    titleId: string;
    titleImage: string;
    weaponSkinShows: Array<{ id: string; image: string }>;
    pinId: string;
    pinImage: string;
  } | null;
}

// ─── SERVER-SIDE CACHE (6 hour TTL) ────────────────────────────

interface CacheEntry {
  data: FreeFirePlayerInfo;
  timestamp: number;
}

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
const serverCache = new Map<string, CacheEntry>();

function getCacheKey(uid: string, region: string) {
  return `${region}:${uid}`;
}

function getFromCache(uid: string, region: string): FreeFirePlayerInfo | null {
  const key = getCacheKey(uid, region);
  const entry = serverCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  if (entry) {
    serverCache.delete(key); // expired
  }
  return null;
}

function setCache(uid: string, region: string, data: FreeFirePlayerInfo) {
  const key = getCacheKey(uid, region);
  serverCache.set(key, { data, timestamp: Date.now() });
}

// ─── CORS PROXY LIST ────────────────────────────────────────────

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// ─── MOCK DATA ──────────────────────────────────────────────────

const MOCK_PLAYER: Record<string, unknown> = {
  userName: "DEMONXIIC",
  level: 78,
  likesCount: 1243,
  basicInfo: {
    accountType: 1,
    rank: 322,
    rankPoints: 4151,
    csRank: 323,
    csRankPoints: 162,
    badgeId: "1001000098",
    title: "904090025",
    headPic: "902032006",
    weaponSkinShows: [907193103, 912040001],
    pinId: "910000008",
    seasonId: 52,
    releaseVersion: "OB54",
    primePrivilegeDetail: {
      privilegeIdList: [21, 10, 11, 15, 20, 8, 19, 12, 17, 16],
    },
  },
  profileInfo: {
    avatarId: "102000015",
    equipedSkills: "6006,7506,4905,4306",
    clothes: [214000017, 203054026, 211000748, 211050022, 204035010, 205050020],
  },
  petInfo: {
    id: "1300000091",
    skinId: "1310000099",
    selectedSkillId: "1315000012",
  },
  captainBasicInfo: {
    bannerId: "901000144",
    headPic: "902000166",
    title: "904090027",
    weaponSkinShows: [912040001],
    pinId: "910044001",
  },
  clanBasicInfo: {
    clanId: "3051679062",
    name: "H4_UNITED",
    level: 6,
    memberCount: 45,
    maxMembers: 45,
  },
  socialInfo: {
    gender: "MALE",
    language: "EN",
    mode: "CS",
    rankShow: "CS",
  },
};

// ─── TRANSFORM RAW DATA ─────────────────────────────────────────

export function transformPlayerData(raw: Record<string, unknown>, uid: string, region: string): FreeFirePlayerInfo {
  const basicInfo = raw.basicInfo as Record<string, unknown>;
  const profileInfo = raw.profileInfo as Record<string, unknown>;
  const petInfo = raw.petInfo as Record<string, unknown> | null;
  const clanInfo = raw.clanBasicInfo as Record<string, unknown> | null;
  const socialInfo = (raw.socialInfo as Record<string, unknown>) || {};
  const captainInfoRaw = raw.captainBasicInfo as Record<string, unknown> | null;

  const rankId = (basicInfo.rank as number) || 0;
  const csRankId = (basicInfo.csRank as number) || 0;
  const rankInfo = getRankInfo(rankId);
  const csRankInfo = getRankInfo(csRankId);

  const weaponSkins = ((basicInfo.weaponSkinShows as number[]) || []).map((id) => {
    const decoded = decodeItem(id);
    return { id: String(id), image: decoded.imageUrl, label: decoded.label };
  });

  const primePrivs = ((basicInfo.primePrivilegeDetail as Record<string, unknown>)?.privilegeIdList as number[]) || [];
  const primePrivileges = primePrivs.map((id) => ({
    id,
    label: PRIVELEGE_LABELS[id] || `Privilege #${id}`,
  }));

  const skillsStr = (profileInfo.equipedSkills as string) || "";
  const equippedSkills = skillsStr
    .split(",")
    .filter(Boolean)
    .map((s) => s.trim())
    .map((id) => {
      const decoded = decodeItem(id);
      return { id, label: decoded.label, image: decoded.imageUrl };
    });

  const clothesIds = (profileInfo.clothes as (string | number)[]) || [];
  const clothes = decodeOutfit(clothesIds).map((item) => ({
    id: String(item.id),
    label: item.label,
    image: item.imageUrl,
    category: item.category,
  }));

  let petInfoDecoded: FreeFirePlayerInfo["petInfo"] = null;
  if (petInfo && petInfo.id) {
    const pet = decodeItem(petInfo.id as string);
    const petSkin = decodeItem(petInfo.skinId as string);
    const petSkill = decodeItem(petInfo.selectedSkillId as string);
    petInfoDecoded = {
      id: String(petInfo.id),
      image: pet.imageUrl,
      skinId: String(petInfo.skinId),
      skinImage: petSkin.imageUrl,
      skillId: String(petInfo.selectedSkillId),
      skillImage: petSkill.imageUrl,
    };
  }

  const badge = decodeItem(basicInfo.badgeId as string);
  const title = decodeItem(basicInfo.title as string);
  const headPic = decodeItem(basicInfo.headPic as string);
  const pin = decodeItem(basicInfo.pinId as string);
  const avatar = decodeItem(profileInfo.avatarId as string);

  let clanBasicInfo: FreeFirePlayerInfo["clanBasicInfo"] = null;
  if (clanInfo && clanInfo.name) {
    clanBasicInfo = {
      clanId: String(clanInfo.clanId || ""),
      name: String(clanInfo.name),
      level: (clanInfo.level as number) || 0,
      memberCount: (clanInfo.memberCount as number) || 0,
      maxMembers: (clanInfo.maxMembers as number) || 50,
    };
  }

  let captainInfo: FreeFirePlayerInfo["captainBasicInfo"] = null;
  if (captainInfoRaw) {
    const capBanner = decodeItem(String(captainInfoRaw.bannerId || ""));
    const capHeadPic = decodeItem(String(captainInfoRaw.headPic || ""));
    const capTitle = decodeItem(String(captainInfoRaw.title || ""));
    const capPin = decodeItem(String(captainInfoRaw.pinId || ""));
    const capWeaponSkins = ((captainInfoRaw.weaponSkinShows as number[]) || []).map((id: number) => {
      const d = decodeItem(id);
      return { id: String(id), image: d.imageUrl };
    });
    captainInfo = {
      uid: String(captainInfoRaw.captainUid || captainInfoRaw.uid || ""),
      name: String(captainInfoRaw.captainName || ""),
      bannerId: String(captainInfoRaw.bannerId || ""),
      bannerImage: capBanner.imageUrl,
      headPicId: String(captainInfoRaw.headPic || ""),
      headPicImage: capHeadPic.imageUrl,
      titleId: String(captainInfoRaw.title || ""),
      titleImage: capTitle.imageUrl,
      weaponSkinShows: capWeaponSkins,
      pinId: String(captainInfoRaw.pinId || ""),
      pinImage: capPin.imageUrl,
    };
  }

  return {
    uid,
    userName: String(raw.userName || raw.nickName || raw.nickname || `Player #${uid}`),
    region,
    regionName: REGION_MAP[region] || region,
    accountType: basicInfo.accountType === 1 ? "Standard" : "Guest",
    level: (raw.level as number) || 0,
    likesCount: (raw.likesCount as number) || (raw.likeCount as number) || 0,
    basicInfo: {
      rank: rankId,
      rankLabel: rankInfo.tier,
      rankEmoji: rankInfo.emoji,
      rankColor: rankInfo.color,
      rankPoints: (basicInfo.rankPoints as number) || undefined,
      csRank: csRankId,
      csRankLabel: csRankInfo.tier,
      csRankEmoji: csRankInfo.emoji,
      csRankColor: csRankInfo.color,
      csRankPoints: (basicInfo.csRankPoints as number) || undefined,
      badgeId: String(basicInfo.badgeId || ""),
      badgeImage: badge.imageUrl,
      titleId: String(basicInfo.title || ""),
      titleImage: title.imageUrl,
      headPicId: String(basicInfo.headPic || ""),
      headPicImage: headPic.imageUrl,
      weaponSkinShows: weaponSkins,
      pinId: String(basicInfo.pinId || ""),
      pinImage: pin.imageUrl,
      seasonId: (basicInfo.seasonId as number) || 0,
      releaseVersion: String(basicInfo.releaseVersion || ""),
      primePrivileges,
    },
    profileInfo: {
      avatarId: String(profileInfo.avatarId || ""),
      avatarImage: avatar.imageUrl,
      equippedSkills,
      clothes,
    },
    petInfo: petInfoDecoded,
    clanBasicInfo,
    captainBasicInfo: captainInfo,
    socialInfo: {
      gender: (socialInfo.gender as string) || "Unknown",
      language: (socialInfo.language as string) || "EN",
      mode: (socialInfo.mode as string) || "BR",
      rankShow: (socialInfo.rankShow as string) || "BR",
    },
  };
}

// ─── SERVER-SIDE FETCH (with cache) ─────────────────────────────

export async function fetchPlayerInfo(
  uid: string,
  region: string = "IND"
): Promise<{ data: FreeFirePlayerInfo; source: string; message?: string }> {
  // 1. Check cache first
  const cached = getFromCache(uid, region);
  if (cached) {
    return {
      data: cached,
      source: "cache",
      message: `Cached data (${Math.round((CACHE_TTL - (Date.now() - (serverCache.get(getCacheKey(uid, region))?.timestamp || 0))) / 60000)}min remaining)`,
    };
  }

  // 2. Try direct server-side API call
  const apiUrl = `https://developers.freefirecommunity.com/api/public/info?region=${region}&uid=${uid}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "application/json",
        Referer: "https://developers.freefirecommunity.com/",
        Origin: "https://developers.freefirecommunity.com",
      },
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = (await response.json()) as Record<string, unknown>;
      if (data && data.basicInfo) {
        const result = transformPlayerData(data, uid, region);
        setCache(uid, region, result);
        return { data: result, source: "live" };
      }
    }

    // If 429, return helpful message
    if (response.status === 429) {
      const errBody = await response.json().catch(() => ({})) as Record<string, unknown>;
      const retryAfter = (errBody.retryAfter as number) || 0;
      const hours = Math.ceil(retryAfter / 3600);
      return {
        data: transformPlayerData(MOCK_PLAYER, uid, region),
        source: "mock",
        message: `API limit reached. Resets in ~${hours}h. Try from browser (different IP).`,
      };
    }
  } catch {
    // Server fetch failed
  }

  // 3. Mock fallback
  return {
    data: transformPlayerData(MOCK_PLAYER, uid, region),
    source: "mock",
    message: "Server could not reach API. Browser will try directly from your IP.",
  };
}

// ─── CLIENT-SIDE FETCH (multi-strategy) ─────────────────────────
// This runs in the browser — each user has their OWN IP = own 5/day limit!

export async function fetchPlayerInfoClient(
  uid: string,
  region: string = "IND"
): Promise<{ data: FreeFirePlayerInfo; source: string; message?: string } | null> {
  const apiUrl = `https://developers.freefirecommunity.com/api/public/info?region=${region}&uid=${uid}`;

  // Strategy 1: Direct browser fetch (user's own IP = own 5/day)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);
    if (res.ok) {
      const json = (await res.json()) as Record<string, unknown>;
      if (json && json.basicInfo) {
        return {
          data: transformPlayerData(json, uid, region),
          source: "live-browser",
          message: "Live data from your browser",
        };
      }
    }
    if (res.status === 429) {
      // Rate limited on browser too, try proxies
    }
  } catch {
    // CORS blocked, try proxies
  }

  // Strategy 2: Rotate through CORS proxies (each has own 5/day)
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxyUrl = CORS_PROXIES[i](apiUrl);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const json = (await res.json()) as Record<string, unknown>;
        if (json && json.basicInfo) {
          return {
            data: transformPlayerData(json, uid, region),
            source: "live-proxy",
            message: `Live data via proxy #${i + 1}`,
          };
        }
      }
    } catch {
      // This proxy failed, try next
    }
  }

  return null;
}

// ─── ITEM IMAGE PROXY ───────────────────────────────────────────

export async function fetchItemImage(itemId: string): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  const imageUrl = `https://ffitems.devhubx.org/items/${itemId}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeout);

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/png";
      return { buffer, contentType };
    }
  } catch {
    // Image CDN unavailable
  }

  return null;
}

// ─── BULK DECODE ────────────────────────────────────────────────

export function decodeItems(ids: (string | number)[]) {
  return ids.map((id) => decodeItem(id));
}