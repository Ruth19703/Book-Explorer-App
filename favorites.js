const STORAGE_KEY = "NOVA-favorites";

export function getFavorites() {
  try {
    const savedFavorites = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(savedFavorites)) {
      return [];
    }

    const favoritesWithoutCategories = savedFavorites.map((book) => {
      const savedBook = { ...book };
      delete savedBook.category;
      return savedBook;
    });

    if (JSON.stringify(savedFavorites) !== JSON.stringify(favoritesWithoutCategories)) {
      saveFavorites(favoritesWithoutCategories);
    }

    return favoritesWithoutCategories;
  } catch (error) {
    console.error("Could not read saved favorites:", error);
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function addFavorite(book) {
  if (!book || !book.id) {
    throw new Error("A book with an ID is required to save a favorite.");
  }

  const favorites = getFavorites();
  const alreadySaved = favorites.some((favorite) => favorite.id === book.id);

  if (alreadySaved) {
    return favorites;
  }

  const savedBook = { ...book };
  delete savedBook.category;

  const updatedFavorites = [...favorites, savedBook];
  saveFavorites(updatedFavorites);
  return updatedFavorites;
}

export function removeFavorite(bookId) {
  const updatedFavorites = getFavorites().filter(
    (favorite) => favorite.id !== bookId,
  );

  saveFavorites(updatedFavorites);
  return updatedFavorites;
}
