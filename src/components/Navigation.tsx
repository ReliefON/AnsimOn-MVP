import { Home, Clock, User, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useService } from "@/contexts/ServiceContext";

interface NavigationProps {
  className?: string;
}

const Navigation = ({ className }: NavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { resetService } = useService();

  const handleLogout = async () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Reset service context
    resetService();
    
    // Sign out from Supabase
    await signOut();
    
    // Navigate to auth page
    navigate('/auth');
  };

  const navItems = [
    {
      icon: Home,
      label: "홈",
      path: "/home",
      active: location.pathname === "/home" || location.pathname === "/",
    },
    {
      icon: Clock,
      label: "서비스 내역",
      path: "/services",
      active: location.pathname === "/services",
      disabled: true, // MVP에서 비활성화
    },
    {
      icon: User,
      label: "내 정보",
      path: "/profile",
      active: location.pathname === "/profile",
    },
    {
      icon: LogOut,
      label: "로그아웃",
      path: "/logout",
      active: false,
      onClick: handleLogout,
    },
  ];

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50",
      className
    )}>
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          
          return (
            <button
              key={item.path}
              onClick={() => {
                if (item.disabled) return;
                if (item.onClick) {
                  item.onClick();
                } else {
                  navigate(item.path);
                }
              }}
              disabled={item.disabled}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary-light" 
                  : item.disabled 
                    ? "text-muted-foreground opacity-50" 
                    : item.label === "로그아웃"
                    ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                    : "text-muted-foreground hover:text-primary hover:bg-primary-light/50"
              )}
            >
              <Icon size={20} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;