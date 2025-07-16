/**
 * Adds a new user to the "users" collection.
 * @param userInfo UserInfo
 * @returns Firestore DocumentReference
 *
 * User JSON structure:
 * {
 *   displayName: string,
 *   email: string,
 *   uid: string
 * }
 */
export async function addUser(userInfo: UserInfo){
    try {
        const userWithId = { 
            ...userInfo,
        }
        const userRef = await addDoc(collection(db, "users"), userWithId);
        return userRef;
    } catch (error) {
        console.error("Error adding user: ", error);
        throw error;
    }
}

/**
 * Gets all users from the "users" collection.
 * @returns Array<{ displayName, email, uid }>
 *
 * User JSON structure:
 * {
 *   displayName: string,
 *   email: string,
 *   uid: string
 * }
 */
export async function getAllUsers() {
    console.log("getting users")
    const usersRef = collection(db, "users")
    const usersSnap = await getDocs(usersRef);
    return usersSnap.docs.map((doc) => {
        const data = doc.data();
        return {
            displayName: data.displayName,
            email: data.email,
            uid: data.uid,
            photoURL: data.photoURL
        };
    });
}
