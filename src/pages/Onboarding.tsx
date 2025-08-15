import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserCheck, Shield, Users } from "lucide-react";

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      icon: UserCheck,
      title: "검증된 여성 기술인",
      description: "PASS 인증을 통해 검증된\n여성 기술인만 만날 수 있어요",
      bgColor: "bg-primary-light",
    },
    {
      icon: Shield,
      title: "실시간 안심 모니터링",
      description: "서비스 중 실시간 영상으로\n안전하게 모니터링해요",
      bgColor: "bg-accent",
    },
    {
      icon: Users,
      title: "안심 파트너",
      description: "가족이나 친구를 안심 파트너로 등록하여\n함께 지켜봐요",
      bgColor: "bg-primary-soft",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/auth");
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="min-h-screen flex flex-col">
      {/* 슬라이드 컨텐츠 */}
      <div 
        className={`flex-1 flex flex-col items-center justify-center px-8 ${currentSlideData.bgColor} transition-all duration-500 cursor-pointer`}
        onClick={handleNext}
      >
        <div className="text-center slide-up">
          <div className="mb-8">
            <div className="bg-white rounded-full p-8 shadow-lg inline-block">
              <Icon size={80} className="text-primary" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {currentSlideData.title}
          </h2>
          
          <p className="text-muted-foreground leading-relaxed text-center whitespace-pre-line">
            {currentSlideData.description}
          </p>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="bg-white px-8 py-6">
        {/* 인디케이터 */}
        <div className="flex justify-center mb-6">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full mx-1 transition-all duration-300 ${
                index === currentSlide ? "bg-primary w-6" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* 버튼 */}
        <div className="flex justify-between items-center">
        </div>
      </div>
    </div>
  );
};

export default Onboarding;