import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; 

export const saveToFirestore = async (
  collectionPath: string,
  documentId: string,
  data: any
) => {
  try {
    const docRef = doc(db, collectionPath, documentId);
    await setDoc(docRef, data, { merge: true });
    console.log(`Data har sparats i ${collectionPath}/${documentId}`);
  } catch (error) {
    console.error(`Fel vid sparning till ${collectionPath}/${documentId}:`, error);
  }
};

export const fetchFromFirestore = async (
  collectionPath: string,
  documentId: string
) => {
  try {
    const docRef = doc(db, collectionPath, documentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log(`Data hämtades från ${collectionPath}/${documentId}:`, docSnap.data());
      return docSnap.data();
    } else {
      console.log(`Inget dokument hittades i ${collectionPath}/${documentId}`);
      return null;
    }
  } catch (error) {
    console.error(`Fel vid hämtning från ${collectionPath}/${documentId}:`, error);
    return null;
  }
};


export const fetchLikedSongs = async (userId: string) => {
    try {
      const docRef = doc(db, `users/${userId}/data`, "likedSongs");
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Gillade låtar hämtade:", data);
        return data.songs || [];
      } else {
        console.log("Inga gillade låtar hittades.");
        return [];
      }
    } catch (error) {
      console.error("Fel vid hämtning av gillade låtar:", error);
      return [];
    }
  };

  export const fetchExcludedSongs = async (userId: string) => {
    try {
      const docRef = doc(db, `users/${userId}/data`, "excludedSongs");
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Exkluderade låtar hämtade:", data);
        return data.songs || [];
      } else {
        console.log("Inga exkluderade låtar hittades.");
        return [];
      }
    } catch (error) {
      console.error("Fel vid hämtning av exkluderade låtar:", error);
      return [];
    }
  };


  export const fetchAppPlaylists = async (userId: string) => {
    try {
      const docRef = doc(db, `users/${userId}/data`, "playlists");
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        return docSnap.data().playlists || [];
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  export const createPlaylistInFirestore = async (
    userId: string,
    newPlaylist: { name: string; songs: any[] }
  ) => {
    try {
      const docRef = doc(db, `users/${userId}/data`, "playlists");
      const docSnap = await getDoc(docRef);
  
      const existingPlaylists = docSnap.exists() ? docSnap.data()?.playlists || [] : [];
      const updatedPlaylists = [...existingPlaylists, newPlaylist];
  
      await setDoc(docRef, { playlists: updatedPlaylists }, { merge: true });
      return updatedPlaylists;
    } catch (error) {
      throw error;
    }
  };

  export const saveMoodToFirestore = async (userId: string, moodHistory: { date: string; mood: string }[]) => {
    if (!userId) {
      console.warn("Ingen användare inloggad. Kan inte spara humördata.");
      return;
    }
  
    try {
      await saveToFirestore(`users/${userId}/data`, "moodHistory", { entries: moodHistory });
      console.log("Humörhistorik sparad i Firestore:", moodHistory);
    } catch (error) {
      console.error("Fel vid sparande av humörhistorik i Firestore:", error);
    }
  };  
  
  export const updatePlaylistsInFirestore = async (userId: string, playlists: any[]) => {
    try {
      const docRef = doc(db, `users/${userId}/data`, "playlists");
      await setDoc(docRef, { playlists }, { merge: true });
      console.log("Spellistor uppdaterade i Firestore.");
    } catch (error) {
      console.error("Fel vid uppdatering av spellistor i Firestore:", error);
    }
  };
  
  export const updateLikedSongsInFirestore = async (userId: string, likedSongs: any[]) => {
    try {
      const docRef = doc(db, `users/${userId}/data`, "likedSongs");
      await setDoc(docRef, { songs: likedSongs }, { merge: true });
      console.log("Gillade låtar uppdaterade i Firestore.");
    } catch (error) {
      console.error("Fel vid uppdatering av gillade låtar i Firestore:", error);
    }
  };
  
  