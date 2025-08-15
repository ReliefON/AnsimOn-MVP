import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Shield } from "lucide-react";

interface SafetyPartnerWidgetProps {
  variant?: "home" | "compact";
  className?: string;
}

const SafetyPartnerWidget = ({ variant = "compact", className = "" }: SafetyPartnerWidgetProps) => {
  const [newPartnerPhone, setNewPartnerPhone] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAddPartner = () => {
    if (!newPartnerPhone.trim()) return;
    setNewPartnerPhone("");
    setShowForm(false);
    alert("안심 파트너가 등록되었습니다!");
  };

  if (variant === "home") {
    return (
      <div className={`bg-primary-light rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            <h3 className="font-medium text-primary">안심 파트너 시스템</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-primary text-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} className="mr-1" />
            추가
          </Button>
        </div>
        
        {showForm && (
          <div className="space-y-3 mb-3 p-3 bg-white rounded border">
            <div className="space-y-2">
              <label htmlFor="partnerPhone" className="text-sm font-medium">휴대폰 번호</label>
              <Input
                id="partnerPhone"
                value={newPartnerPhone}
                onChange={(e) => setNewPartnerPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="h-10"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddPartner} size="sm" className="flex-1">
                등록하기
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" size="sm">
                취소
              </Button>
            </div>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground mb-3">
          가족이나 지인을 안심 파트너로 등록하면 서비스 이용 시 실시간 모니터링을 함께 할 수 있어요.
        </p>
        
        <div className="flex items-center gap-2 text-xs text-primary">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          현재 등록된 파트너: 2명 (어머니, 언니)
        </div>
      </div>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`flex items-center gap-2 text-primary border-primary ${className}`}
      onClick={() => setShowForm(!showForm)}
    >
      <Users size={16} />
      파트너 추가
    </Button>
  );
};

export default SafetyPartnerWidget;