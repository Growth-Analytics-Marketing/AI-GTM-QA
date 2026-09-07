---
name: gtm-mixpanel-qa
description: QA a Google Tag Manager → Mixpanel implementation against a tracking requirements sheet. Builds test cases, drives the live site through GTM Preview with the Claude in Chrome extension, verifies payloads in Mixpanel, records pass/fail with screenshots in the tracking QA tracker, and can apply approved GTM fixes and re-run. Use when asked to "QA the tracking", "test the GTM tags", "verify Mixpanel events", "run a QA round", or "check the tracking plan against GTM".
---

# GTM → Mixpanel tracking QA

You verify that every event in a tracking plan fires from GTM with the right properties and arrives in Mixpanel, then record one row per test case in the tracker. You never publish GTM: all edits stay in the QA workspace until the client signs off.

## Inputs to collect first (ask if missing)

- Site URL to test, and any pages that matter (search, forms, media, accordions).
- GTM account id, container id, public id (GTM-XXXXXXX) and the **workspace** holding the analytics tags.
- Mixpanel project id (and the Mixpanel connector if the Lexicon sync is wanted).
- The tracking requirements (a sheet or doc): event names, properties, when each fires.
- A test identity for forms (name + email the client is happy to see in Mixpanel).
- Which destination: Mixpanel by default. For GA4, Segment or others, swap the request pattern in `scripts/mixpanel-request-logger.js` and the receipt check.

Store these in `meta/config` in the tracker (`title`, `subtitle`, `gtmBase` = `https://tagmanager.google.com/#/container/accounts/<account>/containers/<container>/workspaces/<workspace>/`) so the plan links straight into GTM.

## Phase 0 — discovery

Read every tag, trigger and variable in the workspace that sends to the destination. Write `events`, `properties` and, for each requirement, note where the sheet and GTM disagree (`mismatch` on the property, `disagree` on the case). GTM is the source of truth for triggers; the sheet is the source of truth for intent; the client decides final names (`finalName`).

## Phase 1 — test cases

One `cases/TC-xxx` per: trigger rule (kind `trigger`), explicit exclusion in a trigger (kind `negative`, only where the trigger has one), property (kind `property`), Mixpanel receipt (kind `receipt`), and configuration item (kind `config`: SDK init, autocapture, session replay, single init). Each case has `page`, `steps`, `expected`.

## Phase 2 — run a round

1. Create `runs/run-N` (label, date, browser, gtmVersion, previewEnv, workspace, notes).
2. In GTM click **Preview**, connect Tag Assistant to the site. Keep the `?gtm_debug=<id>` parameter on every URL you test. **The preview is a snapshot: after any tag save, click Preview again and reconnect.**
3. On each page after load, run `scripts/mixpanel-request-logger.js` in the site tab, then read with `scripts/read-log.js`. Requests can carry several events; the reader flattens them.
4. Walk each journey per the case steps. Prefer `el.focus()` / `el.click()` from JS over extension clicks right after a page load; GTM click triggers fire on synthetic clicks. Set `a.target='_blank'` on links you click so the page stays put.
5. For each event capture evidence: the Tag Assistant tag detail (event row → tag card) and the Mixpanel Events row. Save screenshots through `scripts/receiver.py` (serve it, open `receiver.html`, screenshot with `computer`, `upload_image` into the file input). Shrink to ~560 px and store as data-URI thumbnails in `results.gtmShot` / `results.mpShot`. Keep documents under ~60 KB and batches under 50 docs / 1 MB.
6. Write `results/run-N__TC-xxx` with status (pass | fail | blocked | notrun), `actual` (the values seen), thumbnails, `tested`. A fail gets a recommended fix and a `tasks` entry with an owner (GTM vs site developer).
7. Report to the user: totals, fails with fixes, blocked with reasons, what needs a human (media players, CAPTCHA forms).

## Phase 3 — fixes (only with explicit approval per item)

Edit Custom HTML tags from Claude in Chrome: open the tag, click the pencil on Tag Configuration, click inside the editor, set the code via CodeMirror (`document.querySelectorAll('.CodeMirror')` → last `.CodeMirror.getValue()/setValue()`), click inside the editor again, dispatch synthetic Space + Backspace KeyboardEvents on `cm.getInputField()` so Save enables, click Save from JS. Reload and compare the saved code with your draft using `scripts/tag-hash.js`. Stray characters from typing experiments have silently broken tags before; always verify. Then click Preview again and re-run the affected cases as a new round.

Guard every property: send a value only when it exists (never the string "undefined" or "null").

## Phase 4 — handover

- Standalone report: `python3 scripts/build-data-js.py data tracker/data.js` and hand over `tracker/`.
- Live shared report: publish `tracker/tracker.html` as an artifact with `capabilities: {"db": {}}`, then seed it with `scripts/make-seed-batches.py` and `write_db` batches.
- Lexicon sync (optional): the plan tab's "Sync to Lexicon" queues names/descriptions; push them with the Mixpanel connector (Bulk-Edit-Events / Bulk-Edit-Properties) and set `meta/lexiconSync` done.

## Gotchas learned the hard way

- Mixpanel SDK batches events; hook XHR / sendBeacon / fetch at the prototype level because the `mixpanel` global is replaced after the SDK loads.
- Sites often load GTM twice; the SDK tag shows "fired 2 times" while only one `mixpanel.init` runs. Report it as a site task.
- Tag Assistant gets slow after a few hundred events; reload its tab, the session survives.
- Counts rendered after the trigger (search results) need the tag to wait for the number to change, not just to exist.
