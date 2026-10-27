import { fetchBooks } from "./fetchBooks.js";
import { addFavorite, getFavorites, removeFavorite } from "./favorites.js";

const grid = document.getElementById("featured-grid");
const status = document.getElementById("featured-status");

// Build one featured card using the homepage's existing styles.
function makeFeatured(book) {
  const article = document.createElement("article");
  article.className = "overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg";

  const cover = document.createElement("img");
  cover.src = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : "https://covers.openlibrary.org/b/id/10909258-M.jpg";
  cover.alt = `Cover of ${book.title || "a featured book"}`;
  cover.loading = "lazy";
  cover.className = "h-52 w-full object-cover";

  const content = document.createElement("div");
  content.className = "p-5";

  const title = document.createElement("h3");
  title.className = "mt-2 text-xl font-bold text-gray-900";
  title.textContent = book.title || "Untitled";

  const summary = document.createElement("p");
  summary.className = "mt-2 text-sm leading-6 text-gray-600";
  summary.textContent = `${(book.author_name || ["Unknown author"])[0]}${book.first_publish_year ? ` · First published ${book.first_publish_year}` : ""}`;

  const link = document.createElement("a");
  link.href = `books.html?search=${encodeURIComponent(book.title || "")}`;
  link.className = "mt-4 inline-block font-semibold text-green-800 hover:underline";
  link.textContent = "Explore Books";

  const favorite = {
    id: book.key || `featured-${book.title}`,
    title: book.title || "Untitled",
    author: (book.author_name || []).slice(0, 2).join(", ") || "Unknown author",
    year: book.first_publish_year || "",
    cover: cover.src
  };

  const button = document.createElement("button");
  button.type = "button";
  button.dataset.favoriteId = favorite.id;
  button.dataset.book = JSON.stringify(favorite);
  button.className = "mt-4 w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800";
  const saved = getFavorites().some((item) => item.id === favorite.id);
  button.innerHTML = `<i class="fa-${saved ? "solid" : "regular"} fa-heart mr-2"></i>${saved ? "Remove from Favorites" : "Add to Favorites"}`;

  content.append(title, summary, link, button);
  article.append(cover, content);
  return article;
}

// Load a few current titles so the homepage stays fresh.
async function loadFeatured() {
  status.textContent = "Loading featured books…";
  try {
    const books = await fetchBooks();
    grid.replaceChildren();
    if (!books.length) {
      status.textContent = "No featured books are available right now.";
      return;
    }
    books.slice(0, 4).forEach((book, index) => grid.append(makeFeatured(book, index)));
    status.textContent = "A few titles to get your reading started.";
  } catch {
    status.textContent = "Featured books could not be loaded. ";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "font-semibold text-green-800 underline";
    retry.textContent = "Try again";
    retry.addEventListener("click", loadFeatured);
    status.append(retry);
  }
}

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-favorite-id]");
  if (!button) return;
  const exists = getFavorites().some((item) => item.id === button.dataset.favoriteId);
  if (exists) removeFavorite(button.dataset.favoriteId);
  else addFavorite(JSON.parse(button.dataset.book));
  button.innerHTML = `<i class="fa-${exists ? "regular" : "solid"} fa-heart mr-2"></i>${exists ? "Add to Favorites" : "Remove from Favorites"}`;
});

loadFeatured();
