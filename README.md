# Apart Web MVP

First-stage Web MVP for a shared couple room.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the `NEXT_PUBLIC_FIREBASE_*` values from a Firebase Web app.
3. Enable Firebase Anonymous Auth.
4. Create a Cloud Firestore database.
5. Publish `firestore.rules`.
6. Run:

```powershell
npm.cmd install
npm.cmd run dev
```

## Routes

- `/`: landing page, create a room or open a room code/link.
- `/room/[roomId]`: shared room, join modal, realtime status sync, chat, and daily usage limit.

## First-Stage Notes

- Avatar is fixed to `lion`.
- Future Rive file path: `public/assets/rive/lion.riv`.
- PNG fallback paths: `public/assets/avatars/lion/{idle,work,sleep,miss,happy}.png`.
- If Rive and PNG assets are missing, the app renders a CSS lion placeholder.
- Daily text message limit is `10` per user per day.

## Security Rules

`firestore.rules` is intentionally MVP-level. It requires signed-in users and checks room membership for reads/writes, but it should be hardened before production, especially for field-level room updates and message validation.
