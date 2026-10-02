# 春泥棒 Web 题目 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished single-page interactive CTF challenge that simulates a studio desktop, collects four groups of clues, derives an Ethereum test wallet locally, and reveals the flag only after the correct recovery flow.

**Architecture:** Use a Vite + React + TypeScript single-page app with one central challenge state and configuration-driven clue/game/cipher data. The visual shell is a desktop workspace with modal windows; the recovery station owns mnemonic validation, derivation, private-key/address checks, and the configured flag reveal. The fixed word groups are kept in the UI data, while the implementation includes a standard BIP-39 validity check and a clear fallback error if the chosen phrase is not valid.

**Tech Stack:** Vite, React, TypeScript, CSS, `ethers` v6, Vitest, Playwright-compatible browser verification.

**Spec:** `docs/superpowers/specs/2026-09-28-chunni-bang-design.md`

## Global Constraints

- Four groups each contain three fixed words: `only sunny day`, `fever dream high`, `forever night day`, `your how good`.
- The browser module must encourage searching Taylor Swift's `Cruel Summer` opening lyric while using local static search data.
- Game center contains memory matching, drag sorting, and find-the-difference.
- Cipher terminal contains Caesar shift, keyboard offset, and Morse code.
- Recovery flow teaches `BIP-39`, `BIP-32/BIP-44`, `secp256k1`, and `Keccak-256` before calculating.
- Calculations are local-only and use test data; no real wallet, NFT, signing, or transaction is used.
- Flag is `DLNUCTF{w3lc0m3_t0_w3b3}` and must not be stored as a visible frontend plaintext constant in the challenge runtime.
- XOR flag mode treats the 20-byte address as a repeating byte stream so the 24-byte flag can be recovered.
- The UI must be usable for beginners within 10–20 minutes and expose progressive hints.

---

### Task 1: Scaffold the application and testable domain utilities

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/types.ts`
- Create: `src/data/challenge.ts`
- Create: `src/lib/normalize.ts`
- Create: `src/lib/wallet.ts`
- Create: `src/lib/flag.ts`
- Create: `src/lib/wallet.test.ts`
- Create: `src/lib/flag.test.ts`

**Interfaces:**
- `challenge.ts` exports `challengeConfig` with clue, browser, game, cipher, and recovery data.
- `wallet.ts` exports `validateMnemonic(words: string[]): { valid: boolean; phrase: string; reason?: string }`, `deriveWallet(phrase: string): { privateKey: string; address: string; path: string }`, and `normalizeAddress(value: string): string`.
- `flag.ts` exports `revealXorFlag(dataHex: string, address: string): string` and `revealEncryptedFlag(...)` behind configuration, without exporting a plaintext flag constant.
- `App.tsx` owns the top-level active-window and clue-progress state.

- [ ] **Step 1: Write failing wallet and flag tests**

Test the public functions with a known-valid BIP-39 fixture, reject missing/incorrect word counts, normalize addresses, and verify repeating-address XOR decoding with a generated fixture.

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test -- --run`
Expected: FAIL because the Vite project and utility modules do not exist yet.

- [ ] **Step 3: Scaffold Vite, React, TypeScript, Vitest, and ethers**

Add scripts `dev`, `build`, `test`, and `test:e2e` placeholders. Keep all dependencies local and avoid runtime CDN requests.

- [ ] **Step 4: Implement normalization and wallet utilities**

Use ethers v6 `Mnemonic.fromPhrase`, `HDNodeWallet.fromPhrase`, and `Wallet`/address helpers. Use path `m/44'/60'/0'/0/0`. Normalize mnemonic whitespace and lowercase input, but never truncate private keys or addresses.

- [ ] **Step 5: Implement the flag transform utilities**

Decode address bytes from lowercase hex without `0x`, repeat them modulo 20, XOR against `dataHex`, and decode UTF-8. Keep payload configuration-only; do not add the flag string to runtime constants.

- [ ] **Step 6: Run the tests and verify they pass**

Run: `npm test -- --run`
Expected: PASS for wallet derivation, invalid input handling, address normalization, and XOR decoding.

### Task 2: Build the studio desktop shell and clue state

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/components/Desktop.tsx`
- Create: `src/components/Window.tsx`
- Create: `src/components/ClueBag.tsx`
- Create: `src/components/ProgressBar.tsx`

**Interfaces:**
- `Desktop` receives `openWindow(id)`, `completedModules`, and `clues`.
- `Window` receives `title`, `icon`, `onClose`, `children`, and `wide?`.
- `ClueBag` receives `clues` and `slots: (string | null)[]`, and emits `onArrange(slots)`.

- [ ] **Step 1: Add shell-level state and module registry**

Track active window, completed module IDs, collected clue IDs, hint counts, and ordered slots in React state. Persist only harmless progress data to `localStorage`; never persist private keys or flag output.

- [ ] **Step 2: Implement desktop layout**

Create the desktop background, top status bar, module icons, case card, progress meter, and a recommended-next banner. Keep module cards unframed enough to read as a desktop rather than nested cards.

- [ ] **Step 3: Implement reusable windows and clue bag**

Windows must be keyboard closable, have visible titles, and remain usable at narrow widths. The clue bag must show source, word, slot hint, and confirmation state; collected clues are auto-ordered into their configured mnemonic slots.

- [ ] **Step 4: Verify shell manually**

Run: `npm run dev -- --host 127.0.0.1`
Check desktop and mobile viewport layouts, open/close behavior, refresh persistence, and no horizontal overflow.

### Task 3: Implement the four clue modules

**Files:**
- Create: `src/components/modules/ArchiveModule.tsx`
- Create: `src/components/modules/BrowserModule.tsx`
- Create: `src/components/modules/GameModule.tsx`
- Create: `src/components/modules/CipherModule.tsx`
- Create: `src/lib/ciphers.ts`
- Modify: `src/data/challenge.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Each module receives `onComplete(clueIds)`, `completedClues`, and `onHint(moduleId)`.
- `decodeCaesar(input: string, shift: number): string`, `decodeKeyboard(input: string): string`, and `decodeMorse(input: string): string` are pure functions.

- [ ] **Step 1: Add the archive module**

Show the first group `only / sunny / day` with direct, beginner-friendly files and explicit slots. Completing the file review grants the three clues.

- [ ] **Step 2: Add the local browser search module**

Provide a search box, local result index, noise results, a hint that points to Taylor Swift and `Cruel Summer`, and a result that reveals `fever / dream / high` plus direct slots. Do not require external network access or display the entire lyric.

- [ ] **Step 3: Add game center interactions**

Implement memory matching, drag sorting, and find-the-difference as independent mini-panels. Each successful panel grants one clue from `forever / night / day` and its slot. Include retry, success feedback, and progressive hints.

- [ ] **Step 4: Add cipher terminal interactions**

Implement Caesar shift, keyboard offset, and Morse decoding with examples, controlled inputs, and three hint levels. Each successful panel grants one clue from `your / how / good` and its slot.

- [ ] **Step 5: Run unit tests for pure ciphers**

Run: `npm test -- --run src/lib/ciphers.test.ts`
Expected: PASS for known Caesar, keyboard, and Morse examples.

### Task 4: Implement recovery station and flag reveal

**Files:**
- Create: `src/components/modules/RecoveryModule.tsx`
- Create: `src/components/KnowledgePanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/data/challenge.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Recovery receives ordered slots and returns `onSolved({ privateKey, address })`.
- It must call `validateMnemonic`, `deriveWallet`, and the configured flag transform rather than duplicating crypto logic.

- [ ] **Step 1: Build the relationship explainer**

Show the directional chain mnemonic → seed → private key → public key/address, with plain-language explanations and algorithm labels.

- [ ] **Step 2: Add algorithm-name unlock gates**

Accept normalized `BIP-39`, `BIP-32`/`BIP-44`, and `secp256k1` + `Keccak-256`. Unlock each tool only after its gate is solved, with progressive hints and terminology links.

- [ ] **Step 3: Add mnemonic slot arrangement and validation**

Collect the 12 words into their configured slots automatically. Report missing clues and incomplete recovery without revealing the answer; allow the fixed challenge phrase through an explicitly labeled teaching derivation mode when its BIP-39 checksum is intentionally invalid.

- [ ] **Step 4: Add local wallet computation and manual submission**

After gates pass, show the locally derived seed-derived private key and Ethereum address with copy buttons. Require the player to enter both values into separate fields and compare normalized values exactly.

- [ ] **Step 5: Add flag reveal modes**

Support configured XOR mode by default and an encrypted payload mode as an alternate implementation. On success, show the flag in a final case-closed panel; do not expose it before private-key/address validation.

- [ ] **Step 6: Verify the full recovery flow**

Run: `npm run build && npm test -- --run`
Expected: production build succeeds and all utility tests pass.

### Task 5: Polish, accessibility, and browser verification

**Files:**
- Modify: `src/styles.css`
- Modify: `src/components/*.tsx`
- Create: `tests/e2e/recovery.spec.ts`
- Create: `README.md`

- [ ] **Step 1: Add responsive and keyboard polish**

Ensure focus-visible states, labeled inputs, button semantics, reduced-motion support, mobile stacking, readable contrast, and no text overflow in windows or clue cards.

- [ ] **Step 2: Add end-to-end happy path and error tests**

Cover opening the desktop, collecting at least one clue, wrong algorithm feedback, invalid mnemonic feedback, and successful local reveal using the fixture configuration.

- [ ] **Step 3: Run production verification**

Run: `npm run build`; `npm test -- --run`; `npm run dev -- --host 127.0.0.1`.
Expected: build and tests pass; browser flow is usable at desktop and mobile viewport sizes.

- [ ] **Step 4: Document run and safety instructions**

README must state local-only calculations, test-wallet-only policy, dev command, test command, and the known frontend-inspection limitation for any purely client-side challenge.
