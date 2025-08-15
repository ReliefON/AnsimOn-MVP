import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Heart, CheckCircle } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-safe">
      <div className="text-center fade-in">
        {/* 메인 로고 아이콘 */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="bg-primary rounded-full p-6 shadow-xl animate-pulse">
              <Shield size={64} className="text-white" />
            </div>
          </div>
        </div>
        
        {/* 앱 이름 */}
        <h1 className="text-5xl font-bold text-primary mb-3 tracking-tight">
          안심ON
        </h1>
        
        {/* 캐치프레이즈 */}
        <p className="text-lg font-medium text-primary mb-8">
          여성 1인 가구의 안심 생활 파트너
        </p>
      </div>
    </div>
  );
};

export default Splash;