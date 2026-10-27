
import { fetchBooks } from "./fetchBooks.js";
import { addFavorite, getFavorites, removeFavorite } from "./favorites.js";

const grid = document.getElementById("book-grid");
const status = document.getElementById("book-search-status");
const searchInput = document.getElementById("book-search-input");
const params = new URLSearchParams(window.location.search);
const initialSearch = params.get("search") || "";
let requestNumber = 0;

// Keep the search box in sync with the search term in the page URL.

searchInput.value = initialSearch;

function bookFromResult(result) {
  const id = result.key || `${result.title}-${(result.author_name || []).join("")}`;

  return {
    id,
    title: result.title || "Untitled",
    author: (result.author_name || []).slice(0, 2).join(", ") || "Unknown author",
    year: result.first_publish_year || "",
    cover: result.cover_i ? `https://covers.openlibrary.org/b/id/${result.cover_i}-M.jpg` : ""
  };
}

// Create a book card using the same Tailwind classes as the original page.


function makeCard(book) {
  const article = document.createElement("article");
  article.className = "overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg";

  const image = document.createElement("img");
  image.src = book.cover || "https://covers.openlibrary.org/b/id/10909258-M.jpg";
  image.alt = `Cover of ${book.title}`;
  image.loading = "lazy";
  image.className = "h-56 w-full object-cover";
  image.addEventListener("error", () => { image.src = "https://covers.openlibrary.org/b/id/10909258-M.jpg"; }, { once: true });

  const details = document.createElement("div");
  details.className = "p-5";

  const title = document.createElement("h3");
  title.className = "mt-2 text-xl font-bold text-gray-900";
  title.textContent = book.title;

  const author = document.createElement("p");
  author.className = "mt-2 text-sm text-gray-500";
  author.textContent = `By ${book.author}`;

  const description = document.createElement("p");
  description.className = "mt-3 leading-6 text-gray-600";
  description.textContent = book.year ? `First published ${book.year}. Discover this title in the Open Library collection.` : "Discover this title in the Open Library collection.";

  const actions = document.createElement("div");
  actions.className = "mt-5 flex items-center justify-between gap-3";

  const availability = document.createElement("span");
  availability.className = "text-sm font-semibold text-green-800";
  availability.textContent = book.year ? `Published ${book.year}` : "In collection";

  actions.append(availability);

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";
  favoriteButton.dataset.favoriteId = book.id;
  favoriteButton.dataset.book = JSON.stringify(book);
  favoriteButton.className = "mt-4 w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800";
  const saved = getFavorites().some((favorite) => favorite.id === book.id);
  favoriteButton.innerHTML = `<i class="fa-${saved ? "solid" : "regular"} fa-heart mr-2"></i>${saved ? "Remove from Favorites" : "Add to Favorites"}`;

  details.append(title, author, description, actions, favoriteButton);
  article.append(image, details);
  return article;
}

// Fetch the books, then update the grid and its feedback message.

async function showBooks(title = "") {
  const currentRequest = ++requestNumber;
  grid.replaceChildren();
  status.textContent = "Loading books…";
  try {
    const results = await fetchBooks(title);
    if (currentRequest !== requestNumber) return;
    const books = results.map(bookFromResult);
    if (books.length === 0) {
      status.textContent = title ? `No books found for “${title}”. Try another title.` : "No books are available right now. Please try again.";
      return;
    }
    status.textContent = `${books.length} books found${title ? ` for “${title}”` : " in the collection"}.`;
    books.forEach((book) => grid.append(makeCard(book)));
  } catch {
    if (currentRequest !== requestNumber) return;
    status.textContent = "We could not load books. Check your connection and try again.";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "ml-2 font-semibold text-green-800 underline";
    retry.textContent = "Try again";
    retry.addEventListener("click", () => showBooks(searchInput.value.trim()));
    status.append(retry);
  }
}

// Search without reloading the page, while keeping the URL shareable.

searchInput.closest("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  const nextUrl = new URL(window.location.href);
  if (query) nextUrl.searchParams.set("search", query);
  else nextUrl.searchParams.delete("search");
  history.replaceState({}, "", nextUrl);
  showBooks(query);
});

// One click handler covers every favorite button, including newly created cards.

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-favorite-id]");
  if (!button) return;
  const isSaved = getFavorites().some((book) => book.id === button.dataset.favoriteId);
  if (isSaved) removeFavorite(button.dataset.favoriteId);
  else addFavorite(JSON.parse(button.dataset.book));
  button.innerHTML = `<i class="fa-${isSaved ? "regular" : "solid"} fa-heart mr-2"></i>${isSaved ? "Add to Favorites" : "Remove from Favorites"}`;
});

window.addEventListener("storage", () => showBooks(searchInput.value.trim()));
showBooks(initialSearch);
