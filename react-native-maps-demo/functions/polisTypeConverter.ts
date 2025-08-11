import { DisplayPostInfo, MarkerPostInfo, MarkerColor } from "@/types/types";
import { getRandomColor } from "@/functions/getRandomColor";

export const DisplayPostInfoToMarkerPostInfo = (
    post: DisplayPostInfo
): MarkerPostInfo => {
    console.log("Converting DisplayPostInfo to MarkerPostInfo:", post);
    if (!post.postInfo) {   
         console.log("ne or error");
        throw new Error("Invalid postInfo in DisplayPostInfo");
    }
    
    // Ensure all required fields are present   
    if (
        post.postInfo.postId === undefined ||
        post.postInfo.userId === undefined ||
        post.postInfo.latitude === undefined ||
        post.postInfo.latitudeDelta === undefined ||
        post.postInfo.longitude === undefined ||
        post.postInfo.longitudeDelta === undefined
    ) {
    console.log("ne or error");
        throw new Error("Missing required fields in DisplayPostInfo");
    }

    // Return the converted MarkerPostInfo object   
    return {
        postId: post.postInfo.postId,
        userId: post.postInfo.userId,
        latitude: post.postInfo.latitude,
        latitudeDelta: post.postInfo.latitudeDelta,
        longitude: post.postInfo.longitude,
        longitudeDelta: post.postInfo.longitudeDelta,
        private: post.postInfo.private,
        markerColor: getRandomColor() as MarkerColor,
    };
};
