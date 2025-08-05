const BASE_URL =  "http://10.0.0.53:4000/api";
// const BASE_URL =  "http://192.168.1.94:4000/api";
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
  try {
    console.log("Adding friend...");

    const currentUser = getCurrentUser();
    const currentUserId = currentUser?.uid;

    if (!currentUserId) {
      throw new Error("No logged-in user.");
    }

    const res = await fetch(`${BASE_URL}/add-friend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        followerId: currentUserId,
        followeeId: followeeId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Failed to add friend:", errorData);
      throw new Error(errorData.message || "Unknown error occurred.");
    }

    const data = await res.json();
    console.log("Friend added successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in addFriend:", error);
    throw error;
  }
}



// Function to get the current user's friends
export async function getFriends() {
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;

  if (!currentUserId) {
    console.error("User not logged in");
    return;
  }
  console.log("here?");
  const res = await fetch(`${BASE_URL}/friends?currentUserId=${currentUserId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch friends");
  }

  return res.json(); // Expected to return { success: true, friends: [...] }
}

export async function isFriend(followeeId: string): Promise<boolean> {
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;
  console.log(currentUserId, followeeId);

  if (!currentUserId) {
    console.error("User not logged in");
    return false;
  }

  try {
    const res = await fetch(
      `${BASE_URL}/is-friend?currentUserId=${currentUserId}&followeeId=${followeeId}`
    );

    if (!res.ok) {
      throw new Error("Failed to check friendship status");
    }

    const data = await res.json();
    console.log(data.isFriend);
    return data.isFriend ?? false;
  } catch (error) {
    console.error("Error in isFriend:", error);
    return false;
  }
}
export async function deleteFriend(followeeId: string): Promise<boolean> {
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;
  console.log(currentUserId, followeeId);

  if (!currentUserId) {
    console.error("User not logged in");
    return false;
  }

  try {
    const res = await fetch(
      `${BASE_URL}/delete-friend?currentUserId=${currentUserId}&followeeId=${followeeId}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to delete friend");
    }

    const data = await res.json();
    console.log("Delete success:", data.success);
    return data.success ?? false;
  } catch (error) {
    console.error("Error in deleteFriend:", error);
    return false;
  }
}
