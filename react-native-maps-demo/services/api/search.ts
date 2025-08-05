const BASE_URL =  "http://10.0.0.53:4000/api";
// const BASE_URL =  "http://192.168.1.94:4000/api";


import { UserSearchReturn, PolisSearchReturn } from "@/types/types";
export async function searchUsers(searchTerm: string): Promise<UserSearchReturn[]> {
  try {
    const res = await fetch(`${BASE_URL}/user-search?searchTerm=${encodeURIComponent(searchTerm)}`);
    if (!res.ok) throw new Error("Failed to search users");
    return await res.json();
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}
export async function searchPolis(searchTerm: string): Promise<PolisSearchReturn[]> {
    try {
      const res = await fetch(`${BASE_URL}/user-tag-search?searchTerm=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Failed to search users");
      return await res.json();
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }