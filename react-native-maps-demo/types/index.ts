// Shared types that can be imported across the app

export type GET_POST_TEMPLATE = {
  author: string;
  authorId: string;
  postId: string;
  location: {
    latitude: number;
    latitudeDelta: number;
    longitude: number;
    longitudeDelta: number;
  };
  description: string;
  date: string;
  title: string;
};

export type UserInfo = {
  displayName: string; 
  email: string;
  uid: string;
};

export type Location = { 
  latitude: number, 
  longitude: number,
  latitudeDelta: number,
  longitudeDelta: number
};

export type PostData = {
  title: string;
  location: any;
  authorId: string;
  date: string;
  description: string;
  authorName: string;
  visibility: string;
}; 