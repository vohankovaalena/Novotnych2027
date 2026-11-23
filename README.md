# Svatební web – Marie a Ondřej (29. 5. 2027)

Jednostránkový statický web pro GitHub Pages. RSVP formulář přes [Web3Forms](https://web3forms.com).

## Struktura

```
index.html          celý web (vybraný návrh „Luční kvítí" – akvarel z oznámení, krémová)
assets/js/main.js   sdílený skript: RSVP formulář, odpočet, animace
assets/svg/         ozdobné nadpisy (marie-a-ondrej, rsvp, dotazy)
assets/img/         fotky (fotoXX.jpg = 1200 px, fotoXX-s.jpg = 640 px), kvetiny.webp (akvarel z oznámení), og.jpg
_email/             původní podklady z e-mailu – NENÍ v gitu (.gitignore)
```

## 1. Web3Forms (formulář)

1. Na <https://web3forms.com> zadejte e-mail, kam mají chodit odpovědi → přijde **Access Key**.
2. Vložte ho do `assets/js/main.js`:
   ```js
   const WEB3FORMS_ACCESS_KEY = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
   ```
3. Dokud tam je výchozí text, formulář běží v **demo režimu** – nic neodesílá, jen ukáže poděkování
   (data vypíše do konzole prohlížeče). Ideální pro ukázku návrhů.

Každá odpověď přijde jako e-mail s předmětem `RSVP: Jméno – Ano, přijdu` a poli:
jméno, účast, počet osob, další hosté, odvoz, vzkaz. Free plán Web3Forms = 250 odeslání/měsíc.

## 2. GitHub Pages

```bash
git init
git add .
git commit -m "Svatební web – návrhy"
git branch -M main
git remote add origin https://github.com/<uzivatel>/<repo>.git
git push -u origin main
```

Na GitHubu: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
Za minutu běží na `https://<uzivatel>.github.io/<repo>/`.

## 3. Před spuštěním

- Do `og:image` dejte absolutní URL (např. `https://novotnych2027.cz/assets/img/og.jpg`), aby se při sdílení ukázal náhled.

## 4. Vlastní doména Novotnych2027.cz

1. Do kořene repa přidejte soubor `CNAME` s obsahem `novotnych2027.cz`.
2. U registrátora domény nastavte DNS:
   - `A` záznamy pro `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` pro `www` → `<uzivatel>.github.io`
3. V Settings → Pages vyplňte Custom domain a zapněte **Enforce HTTPS**.

## Co ještě doplnit

- Tipy na ubytování (FAQ „Dá se tam přespat?" – teď je tam „(odkazy doplníme)").
- Podrobnosti o odjezdech odvozu.
- Lokální náhled: `python3 -m http.server 8000` a otevřít <http://localhost:8000>.
