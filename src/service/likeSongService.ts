export const likeSong = async (trackId: string, accessToken: string) => {
  try {
    const response = await fetch("http://localhost:5000/like-song", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trackId, accessToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to like the song.");
    }

    alert("Låten har lagts till i dina Gillade låtar!");
  } catch (error) {
    console.error("Fel vid gillande av låt:", error);
    alert("Det gick inte att gilla låten.");
  }
};
