// const BASE_URL = "http://localhost:4000/api/auth"; // Change to your backend URL if needed

// // Sign in
// export async function signIn(email: string, password: string) {
//   const res = await fetch(`${BASE_URL}/signin`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });
//   if (!res.ok) throw new Error("Failed to sign in");
//   return res.json();
// }

// // Sign up
// export async function signUp(email: string, password: string, displayName?: string, photoURL?: string) {
//   const res = await fetch(`${BASE_URL}/signup`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password, displayName, photoURL }),
//   });
//   if (!res.ok) throw new Error("Failed to sign up");
//   return res.json();
// }

// // Logout
// export async function logout() {
//   const res = await fetch(`${BASE_URL}/logout`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//   });
//   if (!res.ok) throw new Error("Failed to log out");
//   return res.json();
// }

// // Get current user
// export async function getCurrentUser() {
//   const res = await fetch(`${BASE_URL}/current-user`);
//   if (!res.ok) throw new Error("Failed to get current user");
//   return res.json();
// }
