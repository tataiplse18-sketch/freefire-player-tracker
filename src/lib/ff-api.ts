/**
 * Free Fire API Client
 * Proxies requests to the Free Fire Community API
 * Falls back to mock data when external API is unavailable
 */

import { decodeItem, decodeOutfit, getRankInfo, PRIVELEGE_LABELS, REGION_MAP } from "./item-decoder";

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
    weaponSkinShows: Array<{ id: string; image: string }>;
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

// Mock data based on the DECODE_REPORT.md for uid 2259942102
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

function transformPlayerData(raw: Record<string, unknown>, uid: string, region: string): FreeFirePlayerInfo {
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

  // Decode weapon skins
  const weaponSkins = ((basicInfo.weaponSkinShows as number[]) || []).map((id) => {
    const decoded = decodeItem(id);
    return { id: String(id), image: decoded.imageUrl, label: decoded.label };
  });

  // Decode prime privileges
  const primePrivs = ((basicInfo.primePrivilegeDetail as Record<string, unknown>)?.privilegeIdList as number[]) || [];
  const primePrivileges = primePrivs.map((id) => ({
    id,
    label: PRIVELEGE_LABELS[id] || `Privilege #${id}`,
  }));

  // Decode equipped skills
  const skillsStr = (profileInfo.equipedSkills as string) || "";
  const equippedSkills = skillsStr
    .split(",")
    .filter(Boolean)
    .map((s) => s.trim())
    .map((id) => {
      const decoded = decodeItem(id);
      return { id, label: decoded.label, image: decoded.imageUrl };
    });

  // Decode outfit
  const clothesIds = (profileInfo.clothes as (string | number)[]) || [];
  const clothes = decodeOutfit(clothesIds).map((item) => ({
    id: String(item.id),
    label: item.label,
    image: item.imageUrl,
    category: item.category,
  }));

  // Decode pet
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

  // Decode badge, title, headpic, pin
  const badge = decodeItem(basicInfo.badgeId as string);
  const title = decodeItem(basicInfo.title as string);
  const headPic = decodeItem(basicInfo.headPic as string);
  const pin = decodeItem(basicInfo.pinId as string);
  const avatar = decodeItem(profileInfo.avatarId as string);

  // Clan info
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

  // Captain info
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

export async function fetchPlayerInfo(
  uid: string,
  region: string = "IND"
): Promise<{ data: FreeFirePlayerInfo; source: "live" | "mock" }> {
  const apiUrl = `https://developers.freefirecommunity.com/api/public/info?region=${region}&uid=${uid}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "FreeFirePlayerInfo/1.0",
        Accept: "application/json",
      },
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = (await response.json()) as Record<string, unknown>;
      if (data && data.basicInfo) {
        return {
          data: transformPlayerData(data, uid, region),
          source: "live",
        };
      }
    }
  } catch {
    // External API unavailable — use mock data
  }

  // Fallback to mock data
  return {
    data: transformPlayerData(MOCK_PLAYER, uid, region),
    source: "mock",
  };
}

// Item image proxy — fetches from ffitems.devhubx.org and returns as buffer
export async function fetchItemImage(itemId: string): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  const imageUrl = `https://ffitems.devhubx.org/items/${itemId}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "FreeFirePlayerInfo/1.0",
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

// Bulk decode
export function decodeItems(ids: (string | number)[]) {
  return ids.map((id) => decodeItem(id));
}