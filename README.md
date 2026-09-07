# AI GTM QA

Automated QA for a Google Tag Manager → Mixpanel implementation, run by Claude Code driving Chrome. It compares your tracking requirements with what is in GTM, builds test cases, walks the live site with GTM Preview attached, checks the payloads that reach Mixpanel, and compiles a report with pass/fail per case and screenshot proof. Approved fixes are applied in the GTM workspace and the round is re-run, with the previous round shown alongside.

Works with GA4, Segment or other destinations by changing the request pattern in the logger and the receipt check.

## What's in here

| Folder | What it is |
|---|---|
| `skill/gtm-mixpanel-qa/` | The Claude Code skill (procedure) and helper scripts: Mixpanel request logger, log reader, screenshot receiver, tag hash check, seed-batch and data builders. |
| `tracker/` | The report. `tracker.html` opens as a plain file (no server) and shows two tabs: **QA runs** (one row per test case, status per run with the previous run next to it, evidence thumbnails, outstanding tasks) and **Tracking plan** (events, properties, triggers with links into GTM, how to test, Lexicon sync). `data.js` holds the data; the bundled one is a small fictional sample. |
| `data/` | The same data as JSON, one file per collection. |

## Setup

1. Install [Claude Code](https://claude.com/claude-code) and the **Claude in Chrome** extension in the Chrome profile that is logged in to GTM, Tag Assistant and Mixpanel.
2. Clone this repo and install the skill:
   ```bash
   git clone https://github.com/Growth-Analytics-Marketing/AI-GTM-QA.git
   cd AI-GTM-QA
   mkdir -p ~/.claude/skills && cp -R skill/gtm-mixpanel-qa ~/.claude/skills/
   ```
3. Start Claude Code in the repo (`claude`) and ask, for example:
   - `/gtm-mixpanel-qa QA the tracking on https://www.example.com against this sheet: <link>. GTM container GTM-XXXXXXX, workspace "Analytics QA", Mixpanel project 123456.`
   - `/gtm-mixpanel-qa run round 2 for the cases that failed in round 1`
   - `/gtm-mixpanel-qa apply the fixes for t01 and t03, refresh the preview and re-test`

Claude will ask for anything missing (test identity, pages that matter) and will tell you which steps it cannot do alone: pressing play in embedded players, submitting forms behind a CAPTCHA, and the Tag Assistant "Connect" prompt.

## Reading the report

Open `tracker/tracker.html`. Pick a run in the run bar; the status column shows the current result and the previous run underneath. Filter by event, case type, status, or "Changed vs previous". Click a thumbnail to see the evidence. The Tracking plan tab is the spec: final names, descriptions, triggers, properties with mismatches flagged, and how to test each event.

To share a live, multi-user copy, publish `tracker/tracker.html` as a Claude artifact with the `db` capability and seed it from `data/` with `skill/gtm-mixpanel-qa/scripts/make-seed-batches.py`.

## Safety

Nothing is published to the live GTM container by the skill. Edits stay in the workspace you name, and every tag edit is verified against the draft by hash before the preview is refreshed.

## Licence

MIT
