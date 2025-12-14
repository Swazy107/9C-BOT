// Roblox API utilities for fetching user data and avatars

interface RobloxUser {
  id: number;
  name: string;
  displayName: string;
}

interface RobloxUserSearchResult {
  data: RobloxUser[];
}

interface RobloxThumbnail {
  targetId: number;
  state: string;
  imageUrl: string;
}

interface RobloxThumbnailResult {
  data: RobloxThumbnail[];
}

export async function getRobloxUserByUsername(username: string): Promise<RobloxUser | null> {
  try {
    const response = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false,
      }),
    });

    if (!response.ok) {
      console.error("Failed to fetch Roblox user:", response.status);
      return null;
    }

    const result: RobloxUserSearchResult = await response.json();
    
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching Roblox user:", error);
    return null;
  }
}

export async function getRobloxAvatarUrl(userId: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
    );

    if (!response.ok) {
      console.error("Failed to fetch Roblox avatar:", response.status);
      return null;
    }

    const result: RobloxThumbnailResult = await response.json();
    
    if (result.data && result.data.length > 0 && result.data[0].state === "Completed") {
      return result.data[0].imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching Roblox avatar:", error);
    return null;
  }
}

export async function getRobloxUserWithAvatar(username: string): Promise<{
  user: RobloxUser;
  avatarUrl: string;
} | null> {
  const user = await getRobloxUserByUsername(username);
  
  if (!user) {
    return null;
  }

  const avatarUrl = await getRobloxAvatarUrl(user.id);
  
  return {
    user,
    avatarUrl: avatarUrl || "https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png",
  };
}

export async function checkRobloxInventoryOpen(userId: number): Promise<boolean> {
  try {
    const response = await fetch(
      `https://inventory.roblox.com/v1/users/${userId}/can-view-inventory`
    );

    if (!response.ok) {
      console.error("Failed to check Roblox inventory:", response.status);
      return false;
    }

    const result = await response.json();
    return result.canView === true;
  } catch (error) {
    console.error("Error checking Roblox inventory:", error);
    return false;
  }
}

export async function getRobloxUserWithInventoryCheck(username: string): Promise<{
  user: RobloxUser;
  avatarUrl: string;
  inventoryOpen: boolean;
} | null> {
  const user = await getRobloxUserByUsername(username);
  
  if (!user) {
    return null;
  }

  const [avatarUrl, inventoryOpen] = await Promise.all([
    getRobloxAvatarUrl(user.id),
    checkRobloxInventoryOpen(user.id)
  ]);
  
  return {
    user,
    avatarUrl: avatarUrl || "https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png",
    inventoryOpen,
  };
}
