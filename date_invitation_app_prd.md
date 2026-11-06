# Product Requirement Document (PRD)
## Project: Interactive Guided Date Invitation Web App

---

## 1. Executive Summary & Objective

### 1.1 Objective
Build a lightweight, highly engaging, single-page interactive web application to invite a partner on a date. The application replaces standard messaging with a gamified, cinematic story flow designed to maximize emotional resonance, playful humor, and a guaranteed positive response.

### 1.2 Core Value Proposition
- **Guided Narrative:** The user is taken on an automated, multi-stage storytelling journey rather than browsing a static website.
- **Editorial & Tangible Craft Aesthetic:** Visuals avoid generic modern template clichés, employing vintage tactile textures, warm paper tones, wax seals, stamps, and editorial serif typography.
- **Playful Anti-Pattern (The Unclickable "Gak Mau" Button):** An impossible-to-click rejection button that actively evades touch and pointer interactions while strictly staying within visible viewport bounds.

---

## 2. User Persona & Target Audience
- **Sender:** A romantic partner seeking a creative, thoughtful, and playful invitation format for an upcoming date.
- **Recipient:** The partner receiving the invitation, likely accessing the site on a mobile device or desktop browser via a direct link.

---

## 3. Core Product Principles & UX Guardrails
1. **No Unintentional Scrolling (Strict Story Progression):**
   - The user cannot freely scroll down using touch swipes, trackpads, or scroll wheels.
   - Transitions between chapters are programmatically controlled via state progression.
2. **Single-File Architecture:**
   - Entire client codebase (HTML, CSS/Tailwind, JavaScript, audio/assets) must be deployable as an autonomous single file (`index.html`) with CDN dependencies.
3. **Responsive Viewport Clamping:**
   - Interactive runaway components must calculate dynamic screen dimensions so they never clip beyond the viewport edges or behind navigation bars.

---

## 4. User Journey & Story Flow Architecture

```
[Section 1: Greeting & Persona]
        │
        ▼ (User clicks "Buka Surat Sekarang")
[Section 2: Parental Clearance Letter (Auto-Sequence)]
        │  ├── 1. Scroll transition to Section 2
        │  ├── 2. Envelope wax seal breaks & flap rotates
        │  ├── 3. Letter slides up out of envelope pocket
        │  ├── 4. Typewriter animates clearance letter
        │  └── 5. Stamp "✓ RESMI DI-ACC ORTU!" slams down + mini confetti
        │
        ▼ (Auto-trigger after ~1.3s delay)
[Section 3: Rundown Dossier & Decision]
        │  ├── 1. Scroll transition to Section 3
        │  ├── 2. Staggered timeline entries appear sequentially (0.45s interval)
        │  ├── 3. Decision Card fades in with "YES" & evasive "Gak Mau" buttons
        │  │
        │  ├── "Gak Mau" Hover/Touch ──► Evade cursor within viewport bounds
        │  │
        │  └── "YES" Click ──► Confetti Cannon Blast + Confirmation Modal
        │
        ▼
[Output: WhatsApp Confirmation Link & Digital Ticket]
```

---

## 5. Detailed Feature Specifications

### 5.1 Section 1: Hero & Greeting
- **Visuals:**
  - Header pill showing current phase badge (`TAHAP 1: PENGANTAR PROPOSAL`).
  - Top stamp badges with playful notes (e.g., *"Confidential Document"*, *"Priority 100%"*).
  - Editorial headline: *"A Very Formal & Completely Non-Negotiable Date Proposal."*
- **Customizable Recipient Name:**
  - Default: *"Seseorang yang Paling Manis"*.
  - An inline edit icon triggers a `prompt()` modal allowing the user to update the name in real time, synchronizing with subsequent sections and ticket outputs.
- **Primary CTA:**
  - Button text: `"Buka Surat Sekarang"`.
  - Action: Disables manual interaction and triggers `startGuidedStory()`.

---

### 5.2 Section 2: Automated Parental Clearance Letter
- **Visuals & Metaphor:**
  - Parody of a formal government clearance letter issued by *"Kementerian Perizinan Kencan Nasional"*.
  - Graphic envelope constructed in HTML/CSS with an envelope base, upper triangular flap, wax seal (`ACC`), and internal letter sheet.
- **Automation Sequence:**
  1. Window automatically smoothly scrolls to `section-2`.
  2. 700ms delay: Wax seal shrinks/fades, flap rotates $180^\circ$ on the X-axis (`transform: rotateX(180deg)`).
  3. Letter sheet translates upward (`translateY(-135px)`).
  4. Typewriter effect starts typing paragraph letter text at $\sim 18\text{ ms/char}$.
  5. Upon text completion, a rubber stamp element (`#rubberStamp`) is unhidden and animated via `stampSlam` keyframes (scaling from $3.2\times$ to $0.9\times$ with tilt).
  6. A minor confetti burst occurs.
  7. After a 1300ms pause, the app invokes `scrollToSection('section-3')` followed by `animateTimelineSteps()`.

---

### 5.3 Section 3: The Boarding Pass Rundown & Final Question

#### 5.3.1 Staggered Timeline Card
- Boarding pass styling with dashed dividers and monospace accents.
- Timeline items are initially set to `opacity: 0; transform: translateY(18px);`.
- Sequence renders each step sequentially with a 450ms offset:
  1. `15:30` - VIP Pickup Service 🚗
  2. `16:30` - Culinary Exploration 🍕🍝
  3. `18:30` - Golden Hour & Deep Talk ☕
  4. `20:30` - Ice Cream & Safe Journey Home 🍦🏡
  5. Verified Location Box: Secret Romantic & Cozy Spot 📍

#### 5.3.2 The Final Decision Card
- Fades and slides in 300ms after the last timeline step completes.
- Headline: *"Jadi, mau kencan bareng akhir pekan ini? 🌹"*.
- Contains two primary CTAs: **YES** and **Gak Mau**.

---

### 5.4 Evasive Button Engine ("Gak Mau")

The core comedic interaction requires the negative button to be mathematically unclickable across desktop and touch interfaces while remaining 100% visible on screen.

#### Technical Rules & Boundary Constraints:
1. **DOM Positioning:** Uses `position: fixed` or dynamic absolute offsets within viewport bounds.
2. **Safe Margin Clamping:**
   $$\text{minLeft} = 24\text{px}, \quad \text{maxLeft} = \text{window.innerWidth} - \text{btnWidth} - 24\text{px}$$
   $$\text{minTop} = 80\text{px} \text{ (below navigation bar)}, \quad \text{maxTop} = \text{window.innerHeight} - \text{btnHeight} - 24\text{px}$$
3. **Collision Avoidance:**
   - If the generated coordinate is within 60px of the user's cursor or touch point $(x, y)$, calculate an inverse directional offset to dodge away from the pointer.
4. **Trigger Listeners:**
   - Must intercept: `pointerenter`, `pointerover`, `pointerdown`, `touchstart`, `focus`, and fallback `click`.
   - All events must call `e.preventDefault()` and `e.stopPropagation()`.
5. **Dynamic Label Cycling:**
   - Every dodge updates the button label randomly from an array:
     - *"Gak Mau 😜"*
     - *"Eits ga kena!"*
     - *"Gaboleh nolak!"*
     - *"Masa gak mau :p"*
     - *"Tombol ini rusak wkwk"*
     - *"Pencet hijau aja! 💖"*
     - *"Wleee meleset 🤪"*
     - *"Gak bisa nolak lho 🤭"*

---

### 5.5 Acceptance & Confirmation (The "YES" State)
- **Trigger:** User clicks `"YES, MAU BANGET! ✨"`.
- **Celebration Effects:**
  - Full-screen multi-color confetti barrage using `canvas-confetti` firing from lateral angles ($60^\circ$ and $120^\circ$) across 2.5 seconds.
- **Modal Display:**
  - Pop-up modal containing an official Digital Date Ticket / Receipt.
  - Displays: Partner Name, Status (*100% Confirmed*), Terms (*Bahagia & Ga Boleh Sedih*), Cost (*0 Rupiah - Ditraktir*).
- **External Hand-off:**
  - Primary button: `"Kirim Konfirmasi ke WhatsApp"`.
  - Opens `https://api.whatsapp.com/send?text=[Encoded Message]` in a new tab with pre-filled acceptance copy.

---

## 6. Technical Stack & Dependencies

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Markup & Runtime** | HTML5 / Vanilla ES6+ | Zero build step, cross-platform compatibility, single-file runnable. |
| **Styling** | Tailwind CSS (Play CDN) | Rapid utility composition with custom palette extensions. |
| **Typography** | Google Fonts | `Newsreader` (Editorial Serif), `Plus Jakarta Sans` (Body UI), `Caveat` & `Sacramento` (Signatures). |
| **Iconography** | Lucide Icons (Vanilla script) | Clean, lightweight SVG iconography. |
| **Particle Physics** | Canvas-Confetti (CDN) | Hardware-accelerated particle animation for celebrations. |

---

## 7. Edge Cases & Defensive Engineering

1. **Mobile Screen Real Estate (Soft Keyboards & Small Viewports):**
   - Section 3 uses `max-h-screen` and `overflow-y-auto` so users on compact devices (e.g., iPhone SE) can comfortably view the full rundown and decision buttons.
2. **Rapid Multi-Touch on "Gak Mau":**
   - Mobile browsers can fire simulated mouse events after touch events. The event listeners use `{ passive: false }` and invoke both `preventDefault()` and dynamic repositioning before the tap registers as a click.
3. **Screen Orientation Changes / Window Resizing:**
   - A window `resize` event listener re-evaluates the "Gak Mau" button's coordinates to guarantee it never stays stuck outside the viewport bounds if the screen size shifts.
4. **Script Execution Errors:**
   - All trigger functions (e.g., `startGuidedStory`, `handleOpenEnvelope`) must be declared in global scope or attached to `window` to prevent `Uncaught ReferenceError` when triggered by inline HTML `onclick` attributes.