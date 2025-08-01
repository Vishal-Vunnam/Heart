const BASE_URL = "http://10.0.0.53:4000/api/user"; // Change to your backend URL if needed

import { UserInfo } from "@/types/types";
import { getCurrentUser } from "../auth/fireAuth";
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
  console.log("HEYEHEYEHYE", userInfo.photoURL);
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userInfo),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function updateUser(userInfo: UserInfo
) {
  const res = await fetch(BASE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userInfo),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

export async function addFriend(followeeId: string) { 
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;
  const res = await fetch(BASE_URL, {
    method: "POST", 
    headers: { }
  }) 
}