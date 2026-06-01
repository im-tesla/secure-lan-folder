# Secure LAN Folder

A private, password-protected file browser for your local network. Browse photos and videos through a clean dark-themed gallery — no cloud, no accounts, just your files.

## Features

- **Password protection** — JWT-based auth with configurable password
- **Media gallery** — unified lightbox for photos and videos with swipe, keyboard nav, and pinch-to-zoom
- **Grid & list views** — toggle between thumbnail grid and detailed list
- **Sorting** — by date, name, or random shuffle
- **Folder browsing** — navigate subdirectories with breadcrumbs
- **Thumbnail generation** — auto-generated thumbnails for images and videos
- **Delete support** — remove files directly from the UI
- **Dark mode** — clean, modern dark interface
- **Self-hosted** — runs entirely on your machine, no external services

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` file:

```env
PASSWORD=your-password-here
FOLDER_PATH=C:\path\to\your\media\folder
JWT_SECRET=a-random-secret-string
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter your password, and browse.

For production:

```bash
npm run build
npm start
```

## Tech stack

- [Next.js 16](https://nextjs.org/) — React framework
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [SWR](https://swr.vercel.app/) — data fetching
- [jose](https://github.com/panva/jose) — JWT authentication
- [sharp](https://sharp.pixelplumbing.com/) — image processing & thumbnails

## Supported formats

- **Images:** JPG, PNG, GIF, WebP, SVG, BMP, TIFF
- **Videos:** MP4, WebM, MOV, AVI, MKV
