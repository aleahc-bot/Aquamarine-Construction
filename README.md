# Aquamarine Construction — Website

A static, multi-page website for Aquamarine Construction, a Cape Coral (SW Florida)
marine contractor. Every page is its own `.html` file that shares one stylesheet
(`style.css`) and one script (`script.js`). There is no build step and nothing to
install — it's plain HTML, CSS, and JavaScript.

The site uses the **Elegant** design throughout (warm cream palette, centered hero,
floating category pill bar, soft rounded floating cards).

## Pages

| File | Page |
|------|------|
| `index.html` | Home |
| `about.html` | About Us |
| `services.html` | Services overview |
| `boat-docks.html` | Boat Docks |
| `boat-dock-repair.html` | Boat Dock Repair |
| `boat-lifts.html` | Boat Lifts |
| `seawall-repair.html` | Seawall Repair |
| `tiki-huts.html` | Tiki Huts |
| `kayak-stations.html` | Kayak Stations |
| `marine-services.html` | Marine Services |
| `gallery.html` | Project Gallery |
| `reviews.html` | Reviews |
| `contact.html` | Contact |

## Shared files

- `style.css` — all styling for every page.
- `script.js` — shared behaviour: mobile menu, scroll reveals, count-up stats,
  header shrink on scroll, gallery filter + lightbox, and the contact-form note.

## Running locally

Just open `index.html` in a browser, or serve the folder with any static server:

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying to GitHub Pages

1. Create a new repository on GitHub and push every file in this folder
   (keep them all at the repo root so the relative links resolve).
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Select your branch (usually `main`) and the `/ (root)` folder, then **Save**.
5. After a minute or two the site is live at
   `https://<your-username>.github.io/<your-repo>/`.

The empty `.nojekyll` file tells GitHub Pages to serve the files as-is.

## Editing tips

- Shared header, footer, and top bar are duplicated in each `.html` file. If you
  change the navigation or footer, update it in every page (or introduce a small
  templating/include step if you prefer).
- Change colors, spacing, and fonts once in `style.css` and it applies everywhere.
- Images and the logo load from `aquamarinecapecoral.com`; a built-in SVG
  placeholder shows automatically if any image fails to load.
- Fonts (Oswald + Open Sans) load from Google Fonts.
