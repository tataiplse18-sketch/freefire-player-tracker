# 🔥 Free Fire Player Tracker

A professional Free Fire player info tool built with Next.js 16, Tailwind CSS 4, and shadcn/ui. Search any player by UID to view their profile, outfits, weapon skins, pets, skills, and more.

![Free Fire Tracker](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black)

## ✨ Features

- **Player Search** — Lookup any Free Fire player by UID and region
- **Profile Dashboard** — Level, likes, rank (BR & CS), clan info, season & game version
- **Outfit Visualizer** — Full outfit grid (hat, jacket, pants, shoes, gloves, backpack)
- **Weapon Skins** — View equipped weapon skins with images
- **Pet & Skills** — Pet info, pet skin, pet skill, and character skills (4 slots)
- **Collectibles** — Badge, title, head frame, and pin display
- **Prime Privileges** — Shows active prime subscription perks
- **Dark/Light Mode** — Toggle between themes with next-themes
- **Responsive Design** — Works on mobile, tablet, and desktop
- **Smart Fallbacks** — SVG placeholders for unavailable item images
- **Live + Mock Data** — Fetches real API data with automatic mock fallback

## 🚀 Deploy on Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → Select this repo
3. Click **Deploy** — that's it!

No environment variables needed for basic player info lookup.

## 🛠️ Tech Stack

| Tech | Purpose |
|------|---------|
| Next.js 16 (App Router) | Full-stack framework |
| Tailwind CSS 4 | Styling |
| shadcn/ui | UI components |
| Framer Motion | Animations |
| next-themes | Dark/Light mode |
| Lucide React | Icons |

## 📡 API

This app uses the [Free Fire Community API](https://developers.freefirecommunity.com) for player data.

### Endpoints Used

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /info` | Public | Player basic info |
| `GET /stats` | API Key | Detailed stats |
| `GET /craftland` | API Key | Craftland data |
| `GET /wishlist` | API Key | Wishlist items |
| `GET /bancheck` | API Key | Ban status |
| `GET /image` | API Key | Player avatar |

### Item Images

Item images are served from [ffitems.devhubx.org](https://ffitems.devhubx.org) — a free CORS-enabled CDN mirror for Garena assets.

## 🎮 How It Works

1. User enters a **Player UID** and selects **Region**
2. API proxy fetches data from Free Fire Community API
3. Raw Garena resource IDs are decoded into human-readable categories
4. Item images are loaded from ffitems.devhubx.org
5. If image fails to load, a category-specific SVG icon is shown as fallback

### Resource ID Prefix Mapping

| Prefix | Category |
|--------|----------|
| 203/204/205/211/214 | Clothing (Outfit) |
| 907/912 | Weapon Skins |
| 130 | Pet |
| 131 | Pet Skin |
| 1315 | Pet Skill |
| 102 | Avatar |
| 1001 | Badge |
| 904 | Title |
| 902 | Head Frame |
| 910 | Pin |
| 901 | Banner |

## 📂 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── player/route.ts      # Player info API proxy
│   │   └── item/[id]/route.ts   # Item image proxy
│   ├── globals.css              # Global styles + FF theme
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page
├── components/
│   ├── ff/
│   │   ├── ff-image.tsx         # Image with SVG fallback
│   │   ├── info-cards.tsx       # Weapon/Pet/Skills/Prime cards
│   │   ├── outfit-grid.tsx      # Outfit visualizer grid
│   │   ├── player-profile.tsx   # Player profile header
│   │   ├── player-search.tsx    # Search bar component
│   │   └── theme-toggle.tsx     # Dark/Light toggle
│   ├── theme-provider.tsx       # next-themes provider
│   └── ui/                      # shadcn/ui components
└── lib/
    ├── ff-api.ts                # API client + mock data
    ├── item-decoder.ts          # Garena ID decoder
    └── utils.ts                 # Utility functions
```

## 📝 License

MIT