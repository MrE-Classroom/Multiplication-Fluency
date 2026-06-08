# Multiplication Quest: Boss Realms — RPG Gear Build

A static GitHub Pages multiplication fluency game for facts 1–10.

## Features

- Quest areas for multiplication facts 1–10
- Boss battle at the end of each area
- Local-only save progress
- Local-only leaderboard on the student device/browser
- No export button
- No real names, emails, school names, or personal information requested
- Student nickname warning
- Class choice: Knight, Archer, Mage
- RPG gear: helmet, body armor, leg armor, weapon
- Power shop and gear shop
- Mid-area save and Continue Adventure
- Mobile-friendly answer input

## Hosting on GitHub Pages

Upload these files to the root of your GitHub repository:

- `index.html`
- `style.css`
- `script.js`
- `README.md`

Then go to Settings → Pages → Deploy from branch → main → root.

## Privacy

All progress and leaderboard data are stored only in the browser using localStorage. Nothing is sent to a server.


## Mobile Keyboard Focus Fix
This build keeps the answer box focused after pressing Next Question/Fight Boss by focusing the input immediately in the button event, adding autofocus/mobile numeric input attributes, and retrying focus after render.
