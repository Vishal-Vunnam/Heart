const BASE_URL = "http://localhost:4000/api/user"; // Change to your backend URL if needed

/**
 * Create a user in the backend database.
 * @param userInfo The user info object (should include id, email, displayName, photoURL)
 * @returns The backend response
 */
export async function createUser(userInfo: {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userInfo),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}