# Generic Grocery Co. website

The website of Generic Grocery Co., a family-owned neighborhood grocery store at
214 Main Street. It has produce, a bakery and a deli counter, and it's open every day,
with shorter hours on Sundays.

The site is HTML, CSS and JavaScript modules, run and built with [Vite](https://vite.dev/).

## Run it

You need Node.js, which comes with npm. Install the project's packages once:

```console
npm install
```

Then start Vite's dev server, and open the address it prints in VS Code's integrated
browser:

```console
npm run dev
```

The dev server runs as long as that command does. `npm run build` writes the site to
`dist/`, the folder to publish, and `npm run preview` serves that build so you can check
it first. `npm run check` reports on the repository.

## Where things are

| File | What it is |
|---|---|
| `index.html`, `deals.html`, `departments.html`, `pickup.html` | The four pages |
| `css/styles.css` | All the styles |
| `src/data/hours.js` | The weekly opening hours |
| `src/data/holidays.js` | Holiday hours, by date |
| `src/data/deals.js` | This week's deals. Prices are in cents |
| `src/lib/hours.js` | Works out the hours for a date, and whether the store is open |
| `src/lib/prices.js` | Formats prices for the pages |
| `src/lib/badge.js` | The text of the home page's "Open now" badge |
| `src/lib/deals.js` | Whether a deal week is on, on a given date |
| `src/home.js`, `src/deals-page.js` | Fill in the home page and the deals page |
| `scripts/check.js` | Checks the project's Git repository: `npm run check` |
| `package.json`, `package-lock.json` | The packages the site needs, and their exact versions |
| `vite.config.js` | Tells Vite to build all four pages, not only `index.html` |
| `.gitignore` | Keeps untracked files, such as `notes.txt`, out of Git |
| `src/vendor/curbside.js` | A stand-in for Generic Curbside's pickup widget: `mountCurbside(element, { key })` |

Weekly deals run from Wednesday to Tuesday, like the printed weekly ad.

## To do

- [x] New weekly deals from Wednesday, November 25: eggs go back to $4.99 a dozen,
      sweet potatoes are 99¢ a pound, and canned pumpkin is $1.79.
- [x] Close at 2 p.m. on Thanksgiving (Thursday, November 26). It's missing from the
      holiday hours.
- [x] Add the bakery to the departments page: fresh bread every morning, pies and
      cakes to order.
- [x] Fix the typo in "Produse" on the departments page.
- [x] The phone number in the footer is old. The new one is (555) 014-2290.

### Next: the move to npm and Vite

- [x] Show an "Open now" badge on the home page that knows the holiday hours, so it
      says the store is closed on Christmas Day and closes early on Christmas Eve.
- [x] Show the deals as this week's deals on the deals page while their week is on.
      A deal week runs from Wednesday to Tuesday. Once it has ended, show the deals
      with their dates instead, until the next week's deals arrive.
- [ ] Take curbside pickup orders on the pickup page through Generic Curbside. Its
      widget is in `src/vendor/curbside.js`, and it needs the store's publishable key
      (`curb_pub_...`). The secret key (`curb_sec_...`) is for Generic Curbside's admin
      only and never goes in the site.
- [x] Close at 3 p.m. on Christmas Eve, an hour earlier than now.
- [x] Open at 10 a.m. on New Year's Day, an hour later than now.
