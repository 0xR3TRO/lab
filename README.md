# R3TRO Lab

24 small web apps, tools and UI experiments — plain HTML, CSS and JavaScript, running entirely in the browser.

**Open:** https://klefas.me/lab/

| Group | Apps |
| --- | --- |
| Tools | Calcify · TipEase · Any2Any · DateSpan · Qryptix · Chromify · CoinPulse · SkyPulse · Battery Detector |
| Time & productivity | TimeSnap · TempoDial · FocusTempo · ChronoPeek · TaskFlow · Testify · InspireMint |
| UI & components | ButtonCraft · CardMotion · ShowcaseGrid · AccessPoint · WindowSync |
| Builders & dashboards | Cardify · PageMint Business · ProdFlow |

## Run locally

No build step. Serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

and open http://localhost:8000.

## Structure

```
index.html            gallery
assets/               gallery styles, script and icon
shared/
  back.js             "← Lab" button on every app
  module.css          common look of the newer modules
  fonts/              self-hosted fonts + their licences
  vendor/             self-hosted libraries + their licences
apps/<name>/          one folder per app
```

## Privacy

No analytics and no cookies. Fonts and libraries are self-hosted. Only two apps call external services, and only when you open them: SkyPulse (weather from Open-Meteo, no API key) and CoinPulse (prices from CoinGecko). Settings and saved items stay in your browser (`localStorage`).

## Licence

Code: [MIT](LICENSE) © 2026 0xR3TRO. Third-party libraries, fonts and data sources are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## History

R3TRO Lab replaced 27 separate repositories in October 2026. Twenty-one apps come from their 2026 versions. Three were rewritten from scratch (Battery Detector, CoinPulse, DateSpan). Duplicates were merged: ChronoPeek covers the two older calendar apps and Qryptix includes the password generator that used to be CipherMint. SkyPulse moved from OpenWeatherMap to Open-Meteo, so it no longer needs an API key.
