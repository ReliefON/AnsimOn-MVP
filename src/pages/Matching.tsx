import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Shield } from "lucide-react";
import { useService } from "@/contexts/ServiceContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Matching = () => {
  const navigate = useNavigate();
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);
  const { requestService, userType } = useService();

  const candidates = [
    {
      id: 1,
      name: "김미영",
      rating: 4.9,
      specialty: "전기/조명",
      keywords: ["#꼼꼼해요", "#친절해요", "#시간약속", "#여성인증완료"],
      description: "10년 경력의 전기 전문가입니다. 고객 만족도 최우선으로 서비스해드려요.",
      image: "👩‍🔧",
      location: "강남구",
    },
    {
      id: 2,
      name: "박수진",
      rating: 4.8,
      specialty: "전기/조명",
      keywords: ["#전문적", "#깔끔해요", "#안전함", "#여성인증완료"],
      description: "전기 관련 모든 문제를 안전하고 깔끔하게 해결해드립니다.",
      image: "👩‍💼",
      location: "서초구",
    },
    {
      id: 3,
      name: "이영희",
      rating: 4.9,
      specialty: "전기/조명",
      keywords: ["#친절해요", "#신속함", "#믿음직", "#여성인증완료"],
      description: "빠르고 정확한 서비스로 고객님의 문제를 해결해드려요.",
      image: "👩‍🔧",
      location: "강남구",
    },
  ];

  const handleConfirmSelection = () => {
    const selectedCandidate = candidates.find(c => c.id === selectedTechnician);
    const serviceRequest = JSON.parse(sessionStorage.getItem("serviceRequest") || "{}");
    
    if (selectedCandidate && serviceRequest) {
      // Request the service
      requestService({
        technicianName: selectedCandidate.name,
        serviceType: serviceRequest.serviceType,
        scheduledDate: new Date(serviceRequest.selectedDate),
        scheduledTime: serviceRequest.selectedTime,
        location: serviceRequest.location,
      });
      
      // Clean up
      sessionStorage.removeItem("serviceRequest");
      
      // Navigate based on user type
      if (userType === 'customer') {
        // Show success message for customer
        alert(`${selectedCandidate.name} 기술인에게 요청을 보냈어요! 승인을 기다려주세요.`);
        navigate("/home");
      } else {
        // Navigate to technician page for technician users
        navigate("/technician");
      }
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="gradient-safe px-6 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary hover:bg-primary-light"
          >
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary">기술인 선택</h1>
          </div>
        </div>
        <div className="border-b border-border"></div>
        
        {/* 서비스 정보 표시 */}
        <div className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-border mt-6">
          <div className="space-y-3">
            <div className="text-center">
              <Badge variant="outline" className="bg-primary text-primary-foreground px-3 py-1 text-sm">
                전기/조명 수리
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <span className="text-muted-foreground">위치</span>
                <p className="font-medium">서울시 강남구 역삼동</p>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground">날짜</span>
                <p className="font-medium">오늘 오후 2시</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 후보 목록 */}
      <div className="px-6 py-6 space-y-4">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{candidate.image}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {candidate.name} - {candidate.specialty} 전문
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {candidate.location}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500 fill-current" />
                      <span className="font-medium">{candidate.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <Shield size={14} />
                      <span className="text-xs">검증 완료</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {candidate.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {candidate.description}
                  </p>
                </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="safe"
                    className="w-full"
                    onClick={() => setSelectedTechnician(candidate.id)}
                  >
                    이 기술인 선택하기
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>기술인 선택 확인</AlertDialogTitle>
                    <AlertDialogDescription>
                      {candidate.name} - {candidate.specialty} 전문 기술인에게 예약을 요청하시겠습니까?
                      <br />
                      <br />
                      요청 후 기술인이 수락하면 예약이 확정되며, 
                      홈 화면에서 예약 현황을 확인할 수 있습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmSelection}>
                      확인
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Matching;