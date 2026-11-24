import { mountCurbside } from "./vendor/curbside.js";

// The publishable key from .env, which Vite hands to the page.
const key = import.meta.env.VITE_CURBSIDE_KEY;

// Generic Curbside's pickup form, or its error line if the key is wrong.
mountCurbside(document.querySelector("#curbside"), { key });
