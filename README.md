# Nebula

An interactive 3D portfolio generator that transforms your CV (DOCX or PDF) into an immersive Three.js experience with a procedural nebula planet.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.183-000000?logo=threedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

## Overview

Upload a CV document and Nebula automatically parses it into structured sections, then presents them as interactive hotspots orbiting a procedurally-generated 3D nebula planet. Click a hotspot to explore that section while the planet shifts and morphs to match.

## Features

- **Smart CV Parsing** — Supports DOCX (via Mammoth) and PDF (via unpdf) with font-based heading detection and keyword fallback
- **3D Nebula Planet** — Procedural GLSL shaders with simplex noise, domain-warped FBM, Fresnel glow, and multi-layered sparkles
- **Interactive Hotspots** — Each portfolio section is a clickable marker orbiting the planet, positioned with golden angle spiral distribution
- **Section Personalities** — The planet's distortion, speed, and color palette morph based on the active section (e.g., Skills = high energy, About = calm blue)
- **ScrambleTitle Animation** — Section titles animate in with character-by-character scrambling effect
- **Dynamic Sections** — Portfolio sections are built from your CV data. Unrecognized headings become custom sections with their own 3D markers
- **Aurora Background** — Animated gradient mesh backdrop behind the 3D scene
- **Contact Protection** — Optionally hide contact info behind a passcode
- **Admin Password Protection** — Restrict upload and edit access with an optional admin password

## 3D Scene

The planet uses custom GLSL shaders to create a gaseous nebula effect:

- **Surface**: Domain-warped fractional Brownian motion with simplex noise displacement
- **Colors**: Purple, pink, and cyan base palette that shifts per section
- **Sparkles**: Three octaves of procedural star particles at different scales
- **Atmosphere**: Colored rim halo that animates between section accent colors
- **Camera**: Auto-rotates when idle, locks when viewing a section

When a section is selected, the planet slides left and scales down while a content panel slides in from the right.

## Sections

| Section | Description |
|---------|-------------|
| About | Professional summary |
| Skills | Categorized skill tags with smart merging |
| Experience | Work entries with company, role, period, and highlights |
| Projects | Expandable cards with tech stack, highlights, and links |
| Education | Degree, institution, and year |
| Personal Information | Contact details (plain or encrypted) |
| AI Build Log | Info about the generated portfolio |
| Custom | Any extra CV sections get their own 3D markers and accent colors |

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:4200`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AZURE_STORAGE_CONNECTION_STRING` | Yes | Azure Blob Storage connection string (from Storage Account → Access keys) |
| `ADMIN_PASSWORD` | No | Protects upload and edit endpoints. If unset, anyone can upload/edit. |
| `CONTACT_PASSCODE` | No | Protects personal info visibility. If unset, contact details are shown publicly. |

For local development, create a `.env` file in the project root:

```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
ADMIN_PASSWORD=your-admin-password
CONTACT_PASSCODE=your-contact-passcode
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data` | Fetch portfolio data |
| GET | `/api/auth-status` | Check password/passcode status |
| POST | `/api/upload` | Upload and parse a CV |
| POST | `/api/edit` | Edit portfolio fields |
| POST | `/api/reveal-contact` | Reveal contact info (requires passcode if set) |

## Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend | React 18, TypeScript, Tailwind CSS 4 |
| 3D | Three.js, React Three Fiber, React Three Drei, Postprocessing |
| Animations | Framer Motion, Custom GLSL shaders |
| Build | Vite |
| CV Parsing | Mammoth (DOCX), unpdf (PDF), Cheerio (HTML) |
| Backend | Azure Functions (production), Vite middleware (dev) |
| Storage | Azure Blob Storage |
| Security | Plain env var auth (admin password + contact passcode) |
