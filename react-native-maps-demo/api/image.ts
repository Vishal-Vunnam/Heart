const BASE_URL = "http://localhost:4000/api";

export async function getImageUrlWithSAS(url: string) {
    const res = await fetch(`${BASE_URL}/safeimage?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error("Failed to fetch safe image URL");
    return res.json();
}