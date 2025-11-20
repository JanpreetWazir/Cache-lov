# Cache Vulnerability Toolkit

Interactive site + documentation for testing web cache poisoning and deception.

## Files in this repo

```
/index.html        # Generator (interactive)
/docs.html         # Documentation & knowledge base
/css/style.css     # Shared styles
/js/main.js        # Shared JavaScript (generator + theme)
/assets/logo.png   # Logo (use provided local asset)
```

**Note on logo:** The uploaded image used as logo is available at local path:
`/mnt/data/82129cd8-2523-4b22-ac07-a6a3e6d22578.png`

## Screenshots

Screenshot of generator (sample):

![](/mnt/data/82129cd8-2523-4b22-ac07-a6a3e6d22578.png)

---

## How to deploy (GitHub Pages)

1. Initialize git and commit

```bash
git init
git add .
git commit -m "Initial commit: cache toolkit"
```

2. Create repository on GitHub (replace USER and REPO below)

```bash
git branch -M main
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

3. Enable GitHub Pages

* Go to repo Settings → Pages
* Source: Deploy from branch → `main` branch, folder: `/ (root)`
* Save

Your site will be live at:

```
https://USER.github.io/REPO/
```

## Local testing

Open `index.html` and `docs.html` in browser. For full features (download, clipboard) serve via a simple HTTP server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

## Notes

* The generator includes payload templates only. Use responsibly and only on authorized targets.
* To change the logo, replace `/assets/logo.png` with your image and commit.

---

If you want, I can:

* Create the GitHub repo for you (you must provide access token)
* Create a ZIP file of the repo for direct download
* Add more payload templates or Burp Intruder files
