# Generic Grocery Co. website

The website of Generic Grocery Co., a family-owned neighborhood grocery store at
214 Main Street. It has produce, a bakery and a deli counter, and it's open every day,
with shorter hours on Sundays.

The site is plain HTML, CSS and JavaScript modules. There's nothing to install.

## Run it

Open this folder in VS Code, right-click `index.html`, and choose **Open in Integrated
Browser**. The page opens in a tab inside VS Code.

The site needs a local server, because its JavaScript files are modules and browsers
don't load modules from a page opened straight from disk. If you double-click
`index.html` instead, the page shows up without hours or deals.

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
| `src/home.js`, `src/deals-page.js` | Fill in the home page and the deals page |
| `scripts/check.js` | Checks the project's Git repository: `node scripts/check.js` |
| `.gitignore` | Keeps untracked files, such as `notes.txt`, out of Git |

Weekly deals run from Wednesday to Tuesday, like the printed weekly ad.

## To do

- [x] New weekly deals from Wednesday, November 25: eggs go back to $4.99 a dozen,
      sweet potatoes are 99¢ a pound, and canned pumpkin is $1.79.
- [ ] Close at 2 p.m. on Thanksgiving (Thursday, November 26). It's missing from the
      holiday hours.
- [x] Add the bakery to the departments page: fresh bread every morning, pies and
      cakes to order.
- [x] Fix the typo in "Produse" on the departments page.
- [x] The phone number in the footer is old. The new one is (555) 014-2290.
