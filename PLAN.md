# TuckBook — MVP Business Plan
### Credit & Debt Tracker for Informal Businesses

---

## 1. PROBLEM IDENTIFICATION

### Specific Niche
**Informal small business owners** — tuck shop owners, spaza shops, market vendors, hair salons, hardware stalls, and street food sellers in **Zimbabwe, South Africa, Zambia, and broader Sub-Saharan Africa**.

Target demographic:
- Runs a physical shop or stall
- Sells goods on credit ("I'll pay you on Friday")
- Has 5–100 regular customers
- Uses a physical book or memory to track debts
- Owns a basic Android smartphone (sub-$100 device)

### The Pain Point (CRITICAL — High Frequency, High Stakes)
Every single day, informal business owners face this exact scenario:

> "Mama Chipo took goods worth $12 but said she'll pay next week. I wrote it in my book. The book got wet. Now I don't know who owes me what. I lost $400 this month."

The core problems:
1. **Physical books get lost, wet, or burned** — debt records disappear
2. **Owners forget who owes what** — especially with 20+ credit customers
3. **Awkward in-person confrontations** — hard to remind a neighbor they owe you
4. **No way to send reminders without looking rude** — WhatsApp makes it impersonal but polite
5. **Cash flow blindness** — no idea how much is owed to them in total

**This costs informal traders an estimated 15-30% of monthly revenue** in forgotten or uncollected debts.

### Why Existing Solutions Fail
| Solution | Why It Fails |
|----------|-------------|
| Physical notebook | Gets lost, destroyed, no reminders |
| Excel/Sheets | Too complex, needs data literacy, no mobile UX |
| QuickBooks / Wave | $25+/month, designed for formal businesses, overkill |
| Khatabook (India) | Not localized for Zimbabwe/Africa, poor offline support |
| Pesabook | Limited features, poor UX, not widely known |
| WhatsApp notes | Disorganized, no totals, no history |

**The gap**: A dead-simple, offline-first, WhatsApp-integrated debt tracker that works on a $50 Android phone with no data required.

---

## 2. MVP APP CONCEPT

### App Name: TuckBook
**Tagline**: *"Track credit. Get paid. Grow your business."*

### Core Features (MVP — ONLY 2)
1. **Customer Credit Ledger** — Add customers, record credit given and payments received, see running balance
2. **One-Tap WhatsApp Reminder** — Send a polite, pre-written payment reminder via WhatsApp with the exact amount owed

That's it. Two features. Everything else is v2.

### User Flow (Step-by-Step)

```
FLOW A: Recording a Credit Sale
─────────────────────────────────
1. Open app → Home screen (shows total owed + today's stats)
2. Tap "Give Credit" button
3. Select customer from list (or add new)
4. Type amount: $8.50
5. Quick-fill what it was for: [Bread] [Sugar] [Cooking Oil] chips
6. Tap "Record Credit"
7. ✅ Done. Customer balance updated. Takes 15 seconds.

FLOW B: Sending a Reminder
──────────────────────────
1. Open app → Customers tab
2. See list sorted by highest balance (who owes most)
3. Tap on "Tendai Moyo — owes $47.50"
4. Tap green WhatsApp button
5. WhatsApp opens with pre-written message:
   "Hi Tendai, friendly reminder from Mama Chipo's Shop.
    Your balance is $47.50. Please come settle when you can 🙏"
6. Hit send → DONE.

FLOW C: Recording a Payment
─────────────────────────────
1. Customer says "here's $20"
2. Open customer profile
3. Tap "Got Payment" → type $20 → tap Record
4. Balance updates: was $47.50, now $27.50
```

### Why Users Will Adopt Immediately
- **Zero learning curve** — if you can use WhatsApp, you can use TuckBook
- **Works offline** — SQLite local database, no internet required for core functions
- **15-second transaction recording** — faster than writing in a book
- **Solves immediate fear** — "I won't lose my debt records again"
- **WhatsApp reminder = magic** — business owners immediately see value: polite, instant, works

---

## 3. TECHNICAL BUILD PLAN

### Tech Stack
| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React Native + Expo | Cross-platform, fastest path to APK |
| Database | expo-sqlite (SQLite) | Offline-first, zero backend needed |
| Navigation | React Navigation 6 | Battle-tested, smooth animations |
| UI | Custom StyleSheet | No library dependency, faster load |
| WhatsApp | Deep Links (`wa.me/`) | No API key needed, works everywhere |
| Build | EAS Build | Free tier, outputs APK directly |
| Icons | @expo/vector-icons | Built-in, no extra install |

### Why No Backend for MVP
- **Privacy**: Business owners don't want their customer debt data in the cloud
- **Cost**: Zero server costs = sustainable from day 1
- **Offline**: Works without internet — critical in areas with poor connectivity
- **Speed**: No latency, instant responses
- **Security**: Data stays on device

### Build Timeline (48 Hours)
```
Hour 0-4:   Project setup, navigation scaffold, DB schema
Hour 4-12:  Core screens (Home, Customers, CustomerDetail)
Hour 12-18: Add/Edit Customer, Add Transaction screens
Hour 18-22: WhatsApp integration, haptics, polish
Hour 22-26: Settings screen, empty states, error handling
Hour 26-32: Testing on real device, fix bugs
Hour 32-36: EAS build → generate APK
Hour 36-48: Distribution and first users
```

### Project Structure
```
/
├── App.js                    # Root: navigation + DB init
├── app.json                  # Expo config
├── eas.json                  # Build profiles (APK, AAB)
├── babel.config.js
├── package.json
└── src/
    ├── database/
    │   └── db.js             # SQLite operations (CRUD)
    ├── context/
    │   └── AppContext.js     # Global state (refresh trigger)
    ├── utils/
    │   ├── whatsapp.js       # WhatsApp + SMS + Call deep links
    │   └── formatters.js     # Currency, dates, initials
    ├── components/
    │   ├── SummaryCard.js    # Dashboard stat card
    │   ├── CustomerCard.js   # Customer list row
    │   ├── TransactionItem.js # Transaction history row
    │   └── EmptyState.js     # Empty screen placeholder
    └── screens/
        ├── HomeScreen.js          # Dashboard
        ├── CustomersScreen.js     # Customer list + search
        ├── CustomerDetailScreen.js # Per-customer ledger
        ├── AddCustomerScreen.js    # Add new customer
        ├── EditCustomerScreen.js   # Edit customer info
        ├── AddTransactionScreen.js # Record credit/payment
        └── SettingsScreen.js       # Business name + share
```

### Database Schema
```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('credit', 'payment')),
  description TEXT DEFAULT '',
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
```

### Build Commands
```bash
# Install dependencies
npm install

# Run on Android (with Expo Go)
npx expo start --android

# Build APK (free via EAS)
npx eas login
npx eas build --platform android --profile apk

# Or local build
npx expo run:android
```

---

## 4. MONETIZATION STRATEGY

### Freemium Model (Day 1)

**Free Tier** (forever free):
- Up to 20 customers
- Unlimited transactions
- WhatsApp reminders
- All core features

**Pro Tier — $1 USD/month** (or $10/year):
- Unlimited customers
- Bulk SMS reminders (send to all debtors at once)
- Export statement to PDF (share with customer)
- Daily debt summary report via WhatsApp to self
- Multi-device sync (v2 — when backend is added)

### Why $1/month Works
- Lower than cost of a notebook and pen (replaces a real expense)
- Less than 30 cents/week — psychologically negligible
- Business owners recoup this in the FIRST single debt they collect
- Comparable to MTN/Airtel data bundles they already buy

### Payment Collection (Emerging Markets)
1. **EcoCash / Mukuru / Innbucks** (Zimbabwe) — mobile money integration
2. **M-Pesa** (Kenya/Tanzania) — largest mobile money
3. **Airtel Money** — wide reach
4. **Paystack** — card payments, Nigeria/Ghana/SA
5. **WhatsApp invoice** — manually send payment request for month 1

### Revenue Projections (Conservative)
```
Month 1:  50 free users, 5 paid = $5/month (validation)
Month 3:  500 free users, 50 paid = $50/month
Month 6:  2,000 free users, 200 paid = $200/month
Month 12: 10,000 free users, 1,000 paid = $1,000/month
```

### Alternative Revenue Streams (v2)
- **Lending referrals**: Connect debtors who need loans to microfinance partners (e.g., Jumo, Branch) — $5-15 per referral
- **USSD extension**: Charge $0.20 per SMS reminder sent to customers without smartphones
- **B2B tier**: $10/month for small wholesalers managing 100+ accounts

---

## 5. LAUNCH STRATEGY (48-HOUR PLAYBOOK)

### Hour 0-12: Build & APK
1. Build APK using EAS Build (free)
2. Upload to a simple landing page (use Carrd.co or Notion — free)
3. OR distribute directly via WhatsApp link to APK file

### Hour 12-24: Seed Users

**Step 1 — Personal Network**
Send this exact message to 20 people who own or know a tuck shop:

> "Hey [Name]! I built a free app for tuck shop owners to track who owes them money. Works without internet, takes 10 seconds to record. No more lost books!
>
> Download free here: [link]
>
> Can you try it and tell me one thing you'd change? 🙏"

**Step 2 — WhatsApp Groups**
Find and join these types of groups:
- "Zimbabwe Entrepreneurs"
- "Harare Business Network"
- "Tuck Shop Owners ZW"
- Local buying/selling groups

Post this message:

> 🚨 FREE app for tuck shop & spaza shop owners!
>
> Tired of losing your credit book? Never know who owes you? I made TuckBook — 100% FREE, works offline, send WhatsApp reminders with 1 tap.
>
> 📲 Download: [link]
>
> Share to your group if you know a shop owner! 🙏

**Step 3 — Facebook Groups**
Post in:
- "Zimbabwe Small Business"
- "Harare Entrepreneurs"
- "SA Spaza Shop Owners"

Post:

> 📚➡️📱 STOP losing your debt book!
>
> I made a FREE app for tuck shops to:
> ✅ Know exactly who owes you
> ✅ Send WhatsApp reminders in 1 tap
> ✅ Works WITHOUT internet
>
> [Screenshot of dashboard showing $847 owed]
>
> 👇 Download free link in comments

### Hour 24-48: Organic Growth

**TikTok / Instagram Reels content formula**:
Record a 30-second video:
1. Open a messy notebook (relatable pain)
2. Switch to TuckBook — clean dashboard
3. Record a $15 credit in 10 seconds
4. Tap WhatsApp reminder, message auto-fills
5. Text overlay: "Never lose your debt book again 💰"

Caption: "Free app for tuck shop owners 👇 link in bio"

**Influencer approach**:
Find 5 micro-influencers who post about:
- "How I run my tuck shop"
- "Small business tips Zimbabwe"
- Market vendors / "hustle" content

DM them: "I'll give you free Pro access forever if you post a 30-second honest review."

### Copy-Paste Marketing Messages

**WhatsApp (personal):**
```
Sisi/Bhuti, you run a tuck shop right? 

I made a free app that tracks who owes you money. You can even send a WhatsApp reminder with 1 button. No more lost books!

It works without internet. Download here: [link]

Let me know what you think 🙏
```

**WhatsApp Group:**
```
🎉 FREE app for shop owners!

TuckBook helps you:
📝 Record who owes you money
💰 See your total outstanding
📱 Send WhatsApp reminders

100% FREE • Works offline • Android

Download: [link]

Please share to all shop owners you know 🙏
```

**Facebook:**
```
ATTENTION: Tuck shop owners, spaza shop owners, market vendors!

Are you still using a notebook to track who owes you?
What happens when it gets wet? Or lost? 😢

I built TuckBook — a FREE app that:
✅ Tracks all your credit customers
✅ Shows you exactly who owes what
✅ Lets you send a WhatsApp reminder in 1 tap
✅ Works WITHOUT internet (perfect for load shedding!)

No subscription. No data needed. 100% FREE.

Drop a 🙏 below and I'll send you the download link directly!

#TuckShop #SpazaShop #ZimbabweBusiness #SmallBusiness
```

---

## 6. UI/UX STRUCTURE

### Design Language
- **Primary Green**: `#00C853` (money, growth, positive)
- **Alert Red**: `#E53935` (debt, owed amounts)
- **Background**: `#f5f5f5` (light gray — easy on battery)
- **Cards**: `#FFFFFF` with subtle shadow
- **Typography**: System font (San Francisco / Roboto) — no custom fonts needed
- **Minimum touch target**: 48x48dp (accessible)

### Screen Map

```
┌─────────────────────────────────┐
│         HOME SCREEN              │
│  Good morning 👋                 │
│  Tendai's Shop                   │
│                                  │
│  ┌─────────────────────────┐    │
│  │   Total Outstanding      │    │
│  │   $847.50               │    │
│  │   12 customers owe you  │    │
│  └─────────────────────────┘    │
│                                  │
│  [Today's Credit] [Today's Pay] │
│  $45.00            $120.00      │
│                                  │
│  [📤 Give Credit] [💵 Got Paid] │
│                                  │
│  Recent Activity                 │
│  ──────────────────────────     │
│  Tendai   Bread    -$5.00       │
│  Chipo    Sugar    +$10.00      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│         CUSTOMERS                │
│  🔍 Search customers...          │
│  12 debtors · $847.50 total     │
│                                  │
│  OWES YOU (12)                  │
│  ○ John Moyo        -$120.00    │
│  ○ Chipo Dube       -$87.50     │
│  ○ Tendai Mwari     -$45.00     │
│  ○ ...                          │
│                              [+] │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  ← John Moyo                    │
│                                  │
│    ●J●   John Moyo              │
│          0771234567             │
│          Owes you               │
│          $120.00                │
│                                  │
│  [WhatsApp] [SMS] [Call] [Edit] │
│                                  │
│  [📤 Give Credit] [💵 Got Paid] │
│                                  │
│  Transaction History (8)         │
│  ──────────────────────────     │
│  ● Cooking Oil  -$15   Today    │
│  ● Payment      +$20   Mon      │
│  ● Mealie Meal  -$25   Fri      │
└─────────────────────────────────┘
```

### Key UX Decisions
1. **Sorted by balance (highest first)** — most urgent customers at top
2. **Red for money owed, green for payments** — instantly readable
3. **Avatar initials with colors** — recognize customers at a glance, no photos needed
4. **Quick-fill chips** (Bread, Sugar, etc.) — 0 typing needed for common items
5. **Preview text** before saving — "You gave $8.50 for Bread to John" (confirms action)
6. **Haptic feedback** on save — tactile confirmation

---

## 7. APK BUILD INSTRUCTIONS

### Prerequisites
```bash
# Install Node.js (v18+)
# Install Expo CLI
npm install -g expo-cli eas-cli

# Clone and install
cd /home/user/Mvp
npm install
```

### Option A: EAS Cloud Build (Recommended — Free)
```bash
# Login to Expo
eas login

# Build APK (takes ~10 min on EAS servers)
eas build --platform android --profile apk

# Download APK from the link provided
# Share APK directly via WhatsApp or upload to drive
```

### Option B: Local Build (Requires Android Studio)
```bash
# Generate native Android project
npx expo prebuild --platform android

# Build debug APK
cd android
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Option C: Expo Go (Fastest for Testing)
```bash
# Start dev server
npx expo start

# Scan QR code with Expo Go app
# (Available on Google Play Store)
```

### Sharing the APK
Once you have the APK file:
1. **WhatsApp**: Send APK directly in chat (friends can install from WhatsApp)
2. **Google Drive**: Upload → share link
3. **Telegram**: Group with direct APK download
4. **GitHub Releases**: Upload as release asset

> **Note**: Users need to enable "Install from Unknown Sources" on Android.
> TuckBook will display instructions for this on first launch.

---

## 8. SUCCESS METRICS (Week 1)

| Metric | Target |
|--------|--------|
| Downloads | 100+ |
| Active users (opened 3+ times) | 40+ |
| Customers added | 500+ total |
| Transactions recorded | 1,000+ |
| WhatsApp reminders sent | 200+ |
| Paid conversions | 5+ |
| WhatsApp group shares | 20+ |

### The ONE metric that matters most
**Number of WhatsApp reminders sent per day** — this means users found real value (they used it to collect real money).

---

## COMPETITIVE MOAT

Once a tuck shop owner has 30 customers and 200 transactions in TuckBook, they will NEVER switch. The switching cost is their entire debt history. This is a **data moat** that builds itself automatically, one transaction at a time.

That's why getting users to record their first 10 transactions in the first 24 hours is the entire growth strategy.

---

*Built in 48 hours. Designed for the street. Built for Africa.*
