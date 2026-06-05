# SnapStudio

A privacy-first browser image editor for fast visual edits.

**Fast image editing, right in your browser.**

## Features

- Upload images locally (PNG, JPEG, WebP)
- Crop and resize with social media presets
- Add text, arrows, lines, shapes, highlights, and blur/redaction boxes
- Apply live filters (brightness, contrast, saturation, grayscale, blur, sepia)
- Create polished social graphics with backgrounds, padding, rounded corners, and shadows
- Export as PNG, JPEG, or WebP with quality and scale controls
- No account, no upload, no backend

## Privacy

All editing happens locally in your browser. SnapStudio does **not** upload, store, or process your images on a server.

- No account required
- No image uploads
- All editing happens locally in the browser
- No server-side storage

> Upload. Edit. Export. Nothing leaves your browser.

## Live Demo

**[https://snapstudio.prince.sh](https://snapstudio.prince.sh)**

## Installation

```bash
npm install
```

## Usage

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

### Run tests

```bash
npm test
```

## Tech Stack

- React + TypeScript
- Vite
- Canvas API
- Vitest

## Social Presets

| Preset | Dimensions |
|--------|-----------|
| Square 1:1 | 1080 × 1080 |
| YouTube 16:9 | 1280 × 720 |
| X Post 16:9 | 1200 × 675 |
| LinkedIn 1.91:1 | 1200 × 628 |
| Instagram 4:5 | 1080 × 1350 |
| Story 9:16 | 1080 × 1920 |

## Deployment

SnapStudio is hosted at **[https://snapstudio.prince.sh](https://snapstudio.prince.sh)** — a static SPA served by nginx. No backend is required; all editing runs in the browser.

```bash
# Build and deploy to the server
./scripts/deploy.sh

# Enable HTTPS after DNS A record points to the server
./scripts/setup-ssl-when-ready.sh
```

## Repository

[github.com/princejain756/SnapStudio](https://github.com/princejain756/SnapStudio)

## License

MIT
