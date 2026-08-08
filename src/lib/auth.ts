// A lightweight mock authentication system for the Nexa prototype
// Persists session in localStorage so auth feels real across reloads.

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export const useAuth = () => {
  const getSession = (): User | null => {
    try {
      const data = localStorage.getItem("nexa-session");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const signIn = (email: string, name: string) => {
    const user: User = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      name: name || email.split("@")[0],
      email,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`,
    };
    localStorage.setItem("nexa-session", JSON.stringify(user));
    // Trigger a storage event manually so other tabs/components can sync
    window.dispatchEvent(new Event("nexa-auth-change"));
    return user;
  };

  const signOut = () => {
    localStorage.removeItem("nexa-session");
    window.dispatchEvent(new Event("nexa-auth-change"));
  };

  return { getSession, signIn, signOut };
};
