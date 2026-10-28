
const API_URL = "https://openlibrary.org/search.json";

export async function fetchBooks(title = "") {
  try {
    const params = new URLSearchParams({
      fields: "key,title,author_name,first_publish_year,cover_i",
      limit: "60"
    });

    if (title.trim() !== "") {
      params.set("title", title.trim());
    } else {
      params.set("q", "book");
    }

    const response = await fetch(`${API_URL}?${params}`);

    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }

    const data = await response.json();

    return Array.isArray(data.docs) ? data.docs : [];
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
}
