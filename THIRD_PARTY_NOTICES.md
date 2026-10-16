# Third-party notices

Everything in this repository is original work released under the [MIT License](LICENSE), except the items below. Each library keeps its own licence header and licence file.

## Libraries

| Library | Version | Licence | Location | Used by |
| --- | --- | --- | --- | --- |
| Font Awesome Free | 6.5.1 | Icons: CC BY 4.0 · Fonts: SIL OFL 1.1 · Code: MIT — © Fonticons, Inc. | `shared/vendor/fontawesome/` (see `LICENSE.txt`) | SkyPulse |
| Chart.js | 4.4.1 | MIT — © Chart.js Contributors | `shared/vendor/chartjs/` (see `LICENSE.md`) | SkyPulse |
| html2canvas | 1.4.1 | MIT — © Niklas von Hertzen | `shared/vendor/html2canvas/`, `apps/cardify/assets/libs/` | PageMint Business, Cardify |
| JSZip | 3.10.1 | MIT (dual-licensed MIT or GPLv3; used here under MIT) — © Stuart Knightley and contributors | `shared/vendor/jszip/` (see `LICENSE.markdown`) | PageMint Business |
| jsPDF | 2.5.1 | MIT — © James Hall, yWorks GmbH and contributors (bundled components are listed in the file header) | `apps/cardify/assets/libs/` | Cardify |

All libraries are self-hosted, so pages make no requests to CDNs.

## Fonts — SIL Open Font License 1.1

The font files in `shared/fonts/` are unmodified Latin and Latin Extended subsets as distributed by Google Fonts. Each font's licence is included next to it.

| Font | Copyright | Licence file |
| --- | --- | --- |
| Inter | © 2020 The Inter Project Authors | `OFL-inter.txt` |
| Space Grotesk | © 2020 The Space Grotesk Project Authors | `OFL-spacegrotesk.txt` |
| Libre Baskerville | © 2012 The Libre Baskerville Project Authors, Reserved Font Name "Libre Baskerville" | `OFL-librebaskerville.txt` |
| Manrope | © 2018 The Manrope Project Authors | `OFL-manrope.txt` |
| Sora | © 2019 The Sora Project Authors | `OFL-sora.txt` |
| Playfair Display | © 2017 The Playfair Display Project Authors, Reserved Font Name "Playfair Display" | `OFL-playfairdisplay.txt` |

Cards exported from Cardify as HTML/SVG reference these fonts on Google Fonts so that the downloaded file looks the same on other devices; the R3TRO Lab pages themselves never contact Google.

## Data services

| Service | Used by | Terms |
| --- | --- | --- |
| [Open-Meteo](https://open-meteo.com/) — weather, air quality and geocoding | SkyPulse | Data under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); free for non-commercial use. Attribution is shown in the app. |
| [CoinGecko](https://www.coingecko.com/) — cryptocurrency prices | CoinPulse | Public API; attribution "Price data by CoinGecko" is shown in the app. |

Requests go straight from the visitor's browser to these services and only when the respective app is opened.

## Trademarks

Cryptocurrency names and tickers shown in CoinPulse (Bitcoin, Ethereum, …) belong to their respective projects; the app shows text badges, not their logos. Social-network names used as placeholders in Cardify and PageMint Business belong to their owners. Sample businesses in PageMint Business and ProdFlow are fictional and use `example.com` addresses.
