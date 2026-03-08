import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin";
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  adminLogin: (user: AdminUser) => void;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  isAdminAuthenticated: false,
  adminLogin: () => {},
  adminLogout: () => {},
});

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem("saveplate_admin");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (admin) {
      localStorage.setItem("saveplate_admin", JSON.stringify(admin));
    } else {
      localStorage.removeItem("saveplate_admin");
    }
  }, [admin]);

  const adminLogin = (userData: AdminUser) => setAdmin(userData);
  const adminLogout = () => setAdmin(null);

  return (
    <AdminAuthContext.Provider value={{ admin, isAdminAuthenticated: !!admin, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
