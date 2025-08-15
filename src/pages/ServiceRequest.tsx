import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, Shield } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const ServiceRequest = () => {
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const handleSubmit = () => {
    if (!serviceType || !location || !description || !selectedDate || !selectedTime) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    
    // Store the service request data to pass to matching
    sessionStorage.setItem("serviceRequest", JSON.stringify({
      serviceType,
      location,
      description,
      selectedDate: selectedDate.toISOString(),
      selectedTime
    }));

    // Navigate to matching page after loading
    setTimeout(() => {
      setIsLoading(false);
      navigate("/matching");
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-safe">
        <div className="text-center">
          <div className="pulse-safe mb-6">
            <div className="bg-primary rounded-full p-8 shadow-xl inline-block">
              <Shield size={64} className="text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-primary mb-4">
            나에게 맞는 기술인을 찾고 있어요
          </h2>
          
          <p className="text-muted-foreground">
            검증된 여성 기술인들이 지원 중입니다...
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-primary">서비스 요청</h1>
        </div>
        <div className="border-b border-border"></div>
        
        <p className="text-lg text-foreground mt-8">
          어떤 도움이 필요하신가요?
        </p>
      </div>

      {/* 폼 */}
      <div className="px-6 py-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-foreground">
              안심하고 요청해주세요
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  서비스 종류
                </label>
                <Input
                  placeholder="예: 화장실 변기 막힘"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  위치
                </label>
                <Input
                  placeholder="예: 서울시 강남구 역삼동"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  희망 날짜
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar size={16} className="mr-2" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: ko }) : "날짜를 선택하세요"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date < new Date(Date.now() - 24 * 60 * 60 * 1000)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  희망 시간
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="text-xs"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  문제 상황
                </label>
                <Textarea
                  placeholder="문제 상황을 자세히 설명해주세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-24"
                />
              </div>

              <div className="bg-primary-light p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-primary" />
                  <span className="text-sm font-medium text-primary">안심 안내</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  모든 기술인은 PASS 인증을 완료한 검증된 여성 기술인입니다.
                  서비스 중에는 실시간 모니터링이 진행됩니다.
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                variant="safe"
                size="lg"
                className="w-full"
              >
                공고 작성 완료
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceRequest;