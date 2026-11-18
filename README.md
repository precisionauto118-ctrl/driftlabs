# Drift Labs Website

Website for **Drift Labs**, a remote ECU tuning business for **1990–2005 NA and NB Mazda Miatas** running **Megasquirt** (MS2, MS3, MSPNP) with **TunerStudio**. Customers anywhere in the US order online, pay through Stripe, send their tune file (.msq) and datalogs by email, and get a custom tune back.

## Files

| File | What it is |
|---|---|
| `site/index.html` | **The real website.** This is the file that goes on GitHub Pages. |
| `miata-tuning.html` | Working copy used for the Claude preview link. Same content as `site/index.html`, minus the page head. Edit this one, then rebuild `site/index.html` from it (or just edit `site/index.html` directly once the site is live). |
| `README.md` | This file. |

Preview link (private to the owner's Claude account): https://claude.ai/artifact/QXWjt43mG6TGmZqb1xXaUM

## Business decisions so far

- **Name:** Drift Labs. Checked: no car tuning company uses it. A crypto company and a small NZ software studio use "Drift Labs", so different industries. "RaceLabs" was rejected because a dyno tuning shop in Indiana already uses "RaceLab".
- **Cars:** NA and NB Miatas only (B6 1.6, BP 1.8, NB VVT, Mazdaspeed).
- **ECU:** Megasquirt only (MS2, MS3, MSPNP). Factory NA/NB ECUs can't be reflashed.
- **Price:** $350 Full Remote Tune.
  - Custom remote tune built to the customer's request
  - Up to 4 revision rounds included
  - Email support through the whole process
- **Add-ons:** extra revision round $50, re-tune after new mods $150, boost/launch control setup $75.
- **Experience:** 10+ years in the tuning business. Real shop backs the business.
- **Market:** US-wide, all 50 states. Shop location helps trust and doesn't limit national reach.
- **Payments:** Stripe Payment Link (customer pays on Stripe's checkout page).
- **Order emails:** Formspree (optional, free) sends each order form to the business email.
- **Hosting:** free on GitHub Pages first, move to a custom domain later.
- **Legal:** tunes are sold for off-road and competition use only. Disclaimer is in the footer, FAQ and order form checkbox. Site says it's not affiliated with Mazda. Don't use "Miata" or "Mazda" in the business name.

## Settings to fill in

At the top of the `<script>` near the bottom of `site/index.html`:

```js
var STRIPE_LINK = "https://buy.stripe.com/REPLACE_ME";  // Stripe Payment Link for the $350 tune
var FORMSPREE_ID = "";                                     // e.g. "xyzabcd" from formspree.io
var CONTACT_EMAIL = "yourname@example.com";                // business email
```

## Still to do

- [ ] Create Stripe account, make a $350 Payment Link, paste it into `STRIPE_LINK`
- [ ] Set `CONTACT_EMAIL` to the business email
- [ ] (Optional) Create a Formspree form, paste its ID into `FORMSPREE_ID`
- [ ] Fill in the yellow highlighted placeholders (search the file for `class="fill"`):
  - [ ] Shop city and state ("Why Drift Labs" section)
  - [ ] 3 real customer reviews, used with permission (never made up)
- [ ] Once nothing is left to fill in, delete the `.fill` style rule so no yellow highlights remain
- [ ] Create a free GitHub account and put the site on GitHub Pages (steps below)
- [ ] Grab social handles (Facebook, Instagram) for Drift Labs
- [ ] Check a domain (e.g. driftlabstuning.com) and the USPTO trademark search: https://tmsearch.uspto.gov
- [ ] Maybe: a simple Drift Labs text logo
- [ ] Later: buy the domain and point it at GitHub Pages

## Putting it on GitHub Pages

1. Sign in at github.com and click **New repository**. Name it something like `driftlabs` and make it **Public**.
2. Click **uploading an existing file**, drag in `site/index.html` (just the file, so it sits at the top of the repo), then click **Commit changes**.
3. Go to **Settings → Pages**. Under "Branch", pick `main` and `/ (root)`, then click **Save**.
4. After a minute the site is live at `https://YOUR-USERNAME.github.io/driftlabs/`.
5. To update it later, open `index.html` on GitHub, click the pencil icon, edit, and commit.

**Custom domain later:** buy the domain, then in **Settings → Pages → Custom domain** type it in and follow GitHub's DNS instructions.

## Getting the word out (nationwide)

- Miata.net and MiataTurbo.net forums
- r/Miata on Reddit
- Facebook groups for NA and NB Miata owners
- Post dyno sheets and before/after datalogs as proof of results
- Set up a Google Business Profile for the shop
