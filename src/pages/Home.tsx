import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, ChevronRight, Clock, Play, Video, AlertTriangle, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useService } from "@/contexts/ServiceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    status, 
    serviceInfo, 
    serviceRequests,
    currentServiceId,
    statusChangeFlags,
    userType,
    loading,
    startMonitoring,
    triggerEmergency,
    clearStatusChangeFlag 
  } = useService();
  const [monitoringDuration, setMonitoringDuration] = useState<string>("");

  // Redirect to auth if not logged in (but wait for loading to complete)
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, navigate, loading]);

  // Redirect technicians to their dashboard (safely in useEffect)
  useEffect(() => {
    if (!loading && userType === 'technician') {
      navigate('/technician');
    }
  }, [userType, loading, navigate]);

  // Show notifications when technician accepts/rejects requests
  useEffect(() => {
    Object.keys(statusChangeFlags).forEach(flag => {
      const [action, requestId] = flag.split('_');
      const request = serviceRequests.find(req => req.id === requestId);
      
      if (action === 'accepted' && request) {
        alert(`예약 확정! ${request.technician_name} 기술인이 예약을 수락했습니다.`);
        clearStatusChangeFlag(flag);
      } else if (action === 'rejected' && request) {
        alert(`예약 거절됨: ${request.technician_name} 기술인이 예약을 거절했습니다.`);
        clearStatusChangeFlag(flag);
      }
    });
  }, [statusChangeFlags, serviceRequests, clearStatusChangeFlag]);

  const technicianData = [
    {
      id: 1,
      name: "김미영",
      rating: 4.9,
      specialty: "배관/보일러",
      keywords: ["#꼼꼼해요", "#친절해요", "#시간약속", "#여성인증완료"],
      image: "👩‍🔧",
    },
    {
      id: 2,
      name: "박수진",
      rating: 4.8,
      specialty: "전기/조명",
      keywords: ["#전문적", "#깔끔해요", "#안전함", "#여성인증완료"],
      image: "👩‍💼",
    },
    {
      id: 3,
      name: "이영희",
      rating: 4.9,
      specialty: "가전/에어컨",
      keywords: ["#친절해요", "#신속함", "#믿음직", "#여성인증완료"],
      image: "👩‍🔧",
    },
  ];

  const reviewKeywords = ["#안전함", "#신속함", "#전문적"];

  const showEmergencyAlert = () => {
    const result = confirm("긴급 상황을 신고하시겠습니까?");
    if (result) {
      triggerEmergency();
      alert("긴급 신고가 완료되었습니다. 기술인과 안심 파트너에게 알림이 전송되었습니다.");
    }
  };

  useEffect(() => {
    const monitoringRequests = serviceRequests.filter(req => req.status === 'monitoring');
    
    if (monitoringRequests.length > 0) {
      const updateDuration = () => {
        // Use the current active monitoring request's start time
        const currentRequest = monitoringRequests.find(req => req.id === currentServiceId);
        if (currentRequest?.start_time) {
          const now = new Date();
          const diff = now.getTime() - new Date(currentRequest.start_time).getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (hours > 0) {
            setMonitoringDuration(`${hours}시간 ${minutes}분 진행 중`);
          } else {
            setMonitoringDuration(`${minutes}분 진행 중`);
          }
        }
      };

      updateDuration();
      const interval = setInterval(updateDuration, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [serviceRequests, currentServiceId]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Early return for technicians (navigation handled in useEffect)
  if (userType === 'technician') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <div className="gradient-safe px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full p-2">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">안심ON</h1>
            </div>
          </div>
        </div>
        <div className="border-b border-border"></div>

        {/* 서비스 요청 섹션 - 항상 표시 */}
        <div className="text-center mb-8 mt-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2">
              {serviceRequests.filter(req => ['pending', 'accepted', 'monitoring'].includes(req.status)).length === 0 
                ? '안전한 서비스가 필요하신가요? 🌱' 
                : '추가 서비스가 필요하신가요? 🌱'
              }
            </h2>
            <p className="text-muted-foreground mb-4">
              검증된 여성 기술인과 함께하는 안심 서비스
            </p>
          </div>
          
          <Button
            variant="safe"
            size="xl"
            className="w-full h-16 text-xl font-bold shadow-xl hover-scale rounded-2xl"
            onClick={() => navigate("/service-request")}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Shield size={24} className="text-white" />
              </div>
              {serviceRequests.filter(req => ['pending', 'accepted', 'monitoring'].includes(req.status)).length === 0 
                ? '새로운 서비스 요청하기' 
                : '추가 서비스 요청하기'
              }
            </div>
          </Button>
        </div>

        {/* 진행 중인 서비스들 표시 */}
        {serviceRequests.filter(req => ['pending', 'accepted', 'monitoring'].includes(req.status)).map((request) => (
          <Card key={request.id} className="bg-primary-light border-primary mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-primary text-lg mb-1">
                    {request.status === 'pending' && '요청 처리 중'}
                    {request.status === 'accepted' && '예약 확정 ✅'}
                    {request.status === 'monitoring' && '모니터링 진행 중'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(request.scheduled_date).toLocaleDateString('ko-KR')} {request.scheduled_time}
                  </p>
                  <p className="text-foreground font-medium">{request.technician_name || '미배정'} 기술인</p>
                  <p className="text-sm text-muted-foreground">{request.service_type}</p>
                </div>
                <Badge 
                  variant={request.status === 'monitoring' ? "default" : "secondary"}
                  className={request.status === 'monitoring' ? "bg-primary text-white" : ""}
                >
                  {request.status === 'pending' && '매칭 대기 중'}
                  {request.status === 'accepted' && '예약됨'}
                  {request.status === 'monitoring' && '모니터링 중'}
                </Badge>
              </div>

              {request.status === 'pending' && (
                <div className="text-center">
                  <div className="animate-pulse mb-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full mx-auto flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-800" />
                    </div>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    기술인에게 요청을 보냈어요. 곧 답변이 올 예정입니다.
                  </p>
                </div>
              )}

              {request.status === 'accepted' && (
                <Button 
                  variant="safe" 
                  size="lg"
                  className="w-full hover-scale"
                  onClick={() => {
                    startMonitoring();
                    navigate("/safe-cam");
                  }}
                >
                  <Video className="mr-2" size={20} />
                  모니터링 시작
                </Button>
              )}

              {request.status === 'monitoring' && currentServiceId === request.id && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-primary/20">
                    <div>
                      <p className="font-medium text-foreground">진행 시간</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={14} className="text-primary" />
                        <span className="text-sm text-primary font-medium">{monitoringDuration}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="safe" 
                    size="lg"
                    className="w-full"
                    onClick={() => navigate("/safe-cam")}
                  >
                    <Shield className="mr-2" size={20} />
                    안심 모니터링 화면 보기
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      onClick={showEmergencyAlert}
                      variant="emergency"
                      size="sm"
                      className="flex-1 bg-emergency text-emergency-foreground hover:bg-emergency/90"
                    >
                      <AlertTriangle size={16} className="mr-2" />
                      긴급 신고
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Users size={16} className="mr-2" />
                      안심 파트너
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 컨텐츠 */}
      <div className="px-6 space-y-8">
        {/* 추천 기술인 섹션 */}
        <section className="slide-up mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-2xl">👩‍🔧</span>
                검증된 추천 기술인
              </h2>
              <p className="text-sm text-muted-foreground">안전 검증을 통과한 여성 기술인들이에요</p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4">
            {technicianData.map((tech) => (
              <Card 
                key={tech.id} 
                className="min-w-72 shadow-lg hover:shadow-xl transition-all cursor-pointer hover-scale bg-white/95 backdrop-blur-sm"
                onClick={() => navigate("/service-request")}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{tech.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-foreground text-lg">{tech.name}</h3>
                        <span className="text-xs text-muted-foreground">{tech.specialty} 전문</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={16} className="text-yellow-500 fill-current" />
                        <span className="text-sm font-bold text-yellow-600">{tech.rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">(128개 후기)</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tech.keywords.map((keyword, index) => (
                          <span key={index} className="text-xs text-gray-800">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 후기 키워드 섹션 */}
        <section className="slide-up">
          <Card className="bg-primary-light border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                안심ON 사용자들은 이런 점에서 만족했어요!
              </h3>
              
              <div className="flex justify-center gap-2 flex-wrap">
                {reviewKeywords.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-primary border-primary bg-white hover:bg-primary hover:text-white transition-colors"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground mt-3">
                검증된 여성 기술인과 함께하는 안전한 서비스
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 실시간 안심 모니터링 섹션 */}
        <section className="slide-up">
          <Card className={`border-primary/30 ${status === 'monitoring' ? 'bg-primary-light border-primary' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <Shield size={24} className="text-primary" />
                  {status === 'monitoring' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  실시간 안심 모니터링
                </h3>
              </div>
              
              {status === 'monitoring' && serviceInfo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-primary/20">
                    <div>
                      <p className="font-medium text-foreground">{serviceInfo.technicianName} 기술인</p>
                      <p className="text-sm text-muted-foreground">{serviceInfo.serviceType}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={14} className="text-primary" />
                        <span className="text-sm text-primary font-medium">{monitoringDuration}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate("/safe-cam")}
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      <Play size={16} className="mr-1" />
                      모니터링 화면 보기
                    </Button>
                  </div>
                </div>
              ) : status === 'pending' ? (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  기술인에게 요청을 보냈어요. 수락되면 실시간 모니터링 준비가 시작됩니다.
                </p>
              ) : status === 'accepted' ? (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  예약된 서비스가 있어요. 기술인 도착 시 모니터링이 시작됩니다.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    현재 진행 중인 모니터링이 없습니다. 서비스 중 실시간 영상 모니터링과 안심 파트너 알림으로 더욱 안전하게 서비스를 받으실 수 있어요.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-primary text-primary hover:bg-primary hover:text-white w-full"
                      >
                        <Play size={16} className="mr-1" />
                        안심 모니터링 화면 미리보기
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>진행 중인 모니터링이 없습니다</AlertDialogTitle>
                        <AlertDialogDescription>
                          현재 진행 중인 모니터링이 없어서 미리보기를 사용할 수 없어요.
                          <br />
                          서비스 요청 후 기술인이 작업을 시작하면 실시간 모니터링을 사용하실 수 있습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction>확인</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <Navigation />
    </div>
  );
};

export default Home;