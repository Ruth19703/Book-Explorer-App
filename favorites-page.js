import { getFavorites, removeFavorite } from "./favorites.js";

const favoritesList = document.getElementById("favorites-list");
const emptyMessage = document.getElementById("empty-message");
const favoritesCount = document.getElementById("favorites-count");

function renderFavorites() {
  const favorites = getFavorites();

  favoritesCount.textContent = `${favorites.length} favorite ${
    favorites.length === 1 ? "book" : "books"
  }`;
  favoritesList.replaceChildren();
  emptyMessage.classList.toggle("hidden", favorites.length > 0);
  favoritesList.classList.toggle("hidden", favorites.length === 0);

  favorites.forEach((book) => {
    const card = document.createElement("article");
    card.className =
      "overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg";

    const cover = document.createElement("img");
    cover.src = book.cover || "./images/libraryJPEG.jpg";
    cover.alt = `Cover of ${book.title || "a saved book"}`;
    cover.loading = "lazy";
    cover.className = "h-56 w-full object-cover";
    cover.addEventListener(
      "error",
      () => {
        cover.src = "./images/libraryJPEG.jpg";
      },
      { once: true },
    );

    const details = document.createElement("div");
    details.className = "p-5";

    const title = document.createElement("h2");
    title.className = "mt-2 text-xl font-bold text-gray-900";
    title.textContent = book.title || "Untitled";

    const author = document.createElement("p");
    author.className = "mt-2 text-sm text-gray-500";
    author.textContent = `By ${book.author || "Unknown author"}`;

    const year = document.createElement("p");
    year.className = "mt-3 leading-6 text-gray-600";
    year.textContent = book.year
      ? `First published ${book.year}`
      : "Saved to your reading list.";

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.removeId = book.id;
    button.className =
      "mt-4 w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800";
    button.textContent = "Remove from Favorites";

    details.append(title, author, year, button);
    card.append(cover, details);
    favoritesList.append(card);
  });
}

favoritesList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-id]");

  if (!button) {
    return;
  }

  removeFavorite(button.dataset.removeId);
  renderFavorites();
});

window.addEventListener("storage", renderFavorites);
renderFavorites();
