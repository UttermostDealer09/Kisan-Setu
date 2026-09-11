# Voice Assistant & SMS/IVR — Scope Decision (E, Day 1)

Per the Tier 3 call: these are **fake-but-honest** for the demo. The goal is
"convincing and rehearsed," not "general-purpose and robust." Deciding the
exact scope today means Day 5–6 is execution, not still-figuring-it-out.

## Voice Assistant — the 2 fixed phrases

Pick exactly two, and pick them **now** so they can be rehearsed all week:

1. **"मेरा स्लॉट स्टेटस चेक करो"** (check my slot status)
   → Web Speech API converts to text → matched against a fixed string →
   calls `GET /transactions/:bookingId/status` → speaks/shows the result.

2. **"आज का मौसम कैसा है"** (how's the weather today)
   → matched against fixed string → calls `GET /weather-risk` for the
   farmer's centre + today's date → speaks/shows the result.

**Build approach:**
- Web Speech API `SpeechRecognition` listens, converts speech → text.
- Do a simple fuzzy match (not exact string match — accents/mic noise vary)
  against these two known phrases. A basic approach: lowercase, strip
  punctuation, check if it *contains* 2–3 key words from each phrase
  (e.g. "status" or "स्टेटस" for #1, "मौसम" or "weather" for #2).
- If neither matches: "Sorry, try 'check my slot status' or 'how's the
  weather'" — a graceful known-limitation response, not silence or an error.
- **Do not** attempt open-ended NLU. Two hardcoded intents, done well, beats
  a shaky general system that might fail live in front of judges.

**Owner:** E, Day 5–6. Get it working Day 5, spend all of Day 6 rehearsing it
against background noise (the actual demo room won't be silent).

## SMS/IVR — screen-recording approach

Real telephony (Twilio etc.) needs account verification that won't clear in
time. Decision: **fake it with a screen recording**, shown at the right
moment in the live demo rather than attempted live.

**What to actually produce:**
1. A real phone's SMS app (or a convincing mockup), showing a received
   message like:
   > *Kisan Setu: Your turn is approaching. Token #124 expected in
   > ~35 min. Start travelling now.*
2. Screen-record receiving it (or the mockup animating in) — 5–8 seconds,
   no more.
3. Slot this into the live demo script at the exact moment the "Start
   Travelling Now" alert would fire for a farmer using IVR/SMS instead of
   the app.

**Say-so if asked:** if a judge asks "is this SMS live?" — say plainly that
full telephony integration needs an account-verification window this hackathon
doesn't have, and this is a recording of the exact message the backend
would send via a provider like Twilio in production. That's consistent with
the "honesty" framing already in the solution doc — better than pretending.

**Owner:** E, Day 6. Record it once the "Start Travelling Now" alert logic
(B/C's work) is actually generating that message text for real, so the
recording matches what the system truly produces — not an invented example.

## Today's actual output (Day 1)

- [x] Two voice phrases picked and written down (above) — Hindi + English gloss.
- [x] SMS/IVR approach decided: screen recording, not live telephony.
- [ ] Share both decisions in the team channel so B/C know their alert-message
      text needs to be finalized by Day 5 (E needs the real wording to record
      an accurate SMS screenshot).
- [ ] Confirm with F: Web Speech API needs HTTPS or `localhost` to access the
      mic in most browsers — make sure the staging deploy target is HTTPS by
      default (Render/Railway/Vercel all are) so this doesn't break on
      Day 7's deploy.
