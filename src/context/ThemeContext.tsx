import { createContext, useContext, useState, useEffect, useMemo } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  setUser: (user: any) => void;
  user: any;
}


const availableThemes = ["clientAdmin", "FCATheme", "kodelabTheme"];

const defaultTheme = "kodelabTheme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const getStoredUser = () => {
    if (typeof window === "undefined") return null;
    const storedUser = sessionStorage.getItem("selectedUser");
    return storedUser ? JSON.parse(storedUser) : null;
  };

  const [user, setUser] = useState<any>(getStoredUser());
  const [theme, setThemeState] = useState<string>(user?.theme || defaultTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    sessionStorage.setItem("theme", theme);
  }, [theme]);


  const setUserAndTheme = (selectedUser: any) => {
    setUser(selectedUser);
    sessionStorage.setItem("selectedUser", JSON.stringify(selectedUser));

    if (availableThemes.includes(selectedUser.theme)) {
      setThemeState(selectedUser.theme);
    }
  };

  const contextValue = useMemo(() => ({ theme, setTheme: setThemeState, setUser: setUserAndTheme, user }), [theme, user]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
