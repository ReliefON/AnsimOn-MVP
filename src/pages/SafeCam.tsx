import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield, Users, Video, ArrowLeft, Clock, CheckCircle, VideoOff, Play, Zap, Camera, Maximize2 } from "lucide-react";
import { useService } from "@/contexts/ServiceContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const SafeCam = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [aiDetection, setAiDetection] = useState(false);
  const [duration, setDuration] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const [isTechnicianRecording, setIsTechnicianRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { status, serviceInfo, endMonitoring, resetService, triggerEmergency } = useService();

  // Check if technician is recording (monitoring status)
  useEffect(() => {
    if (status === 'monitoring') {
      setIsTechnicianRecording(true);
      setIsStreaming(true);
      // Simulate receiving technician's video stream
      toast({
        title: "기술인 영상 수신 중",
        description: "기술인의 실시간 영상을 수신하고 있습니다.",
      });
    }
  }, [status, toast]);

  const handleStartStreaming = async () => {
    try {
      setCameraError("");
      console.log('카메라 스트림 요청 시작...');
      
      // 카메라 스트림 가져오기
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          facingMode: 'user' // 전면 카메라 사용
        }, 
        audio: false 
      });
      
      console.log('카메라 스트림 성공:', mediaStream);
      console.log('비디오 트랙:', mediaStream.getVideoTracks());
      
      // 비디오 엘리먼트에 스트림 연결
      if (videoRef.current) {
        console.log('비디오 엘리먼트에 스트림 연결 중...');
        videoRef.current.srcObject = mediaStream;
        
        // 명시적으로 재생 시작
        try {
          await videoRef.current.play();
          console.log('비디오 재생 시작됨');
        } catch (playError) {
          console.error('비디오 재생 오류:', playError);
          // 사용자 상호작용 후 재생 시도
          videoRef.current.muted = true;
          await videoRef.current.play();
        }
      }
      
      setStream(mediaStream);
      setIsStreaming(true);
      
      toast({
        title: "안심 모니터링 시작",
        description: "실시간 영상 모니터링이 시작되었습니다.",
      });
    } catch (error) {
      console.error('Camera access failed:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setCameraError(`카메라에 접근할 수 없습니다: ${errorMessage}`);
      toast({
        title: "카메라 오류",
        description: `카메라에 접근할 수 없습니다: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleEmergency = () => {
    setEmergencyTriggered(true);
    triggerEmergency();
    toast({
      title: "긴급 신고 완료",
      description: "기술인에게 즉시 알림이 전송되었습니다. 안심 파트너와 경찰에 알림이 전송됩니다.",
      variant: "destructive",
    });
  };

  const handleSimulateAI = () => {
    setAiDetection(true);
    toast({
      title: "AI 이상 감지",
      description: "AI가 이상 징후를 감지했습니다. 안심 파트너에게 알림을 보냈습니다.",
      variant: "destructive",
    });
    
    setTimeout(() => {
      setAiDetection(false);
    }, 5000);
  };

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsTechnicianRecording(false);
  };

  const handleCompleteService = () => {
    stopCameraStream();
    endMonitoring();
    toast({
      title: "서비스 종료",
      description: "안심 모니터링이 종료되었습니다.",
    });
    navigate("/home");
  };

  // 모니터링 시간 계산
  useEffect(() => {
    if (status === 'monitoring' && serviceInfo?.startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const start = serviceInfo.startTime!;
        const diffMs = now.getTime() - start.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          setDuration(`${hours}시간 ${minutes}분 ${seconds}초`);
        } else if (minutes > 0) {
          setDuration(`${minutes}분 ${seconds}초`);
        } else {
          setDuration(`${seconds}초`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, serviceInfo?.startTime]);

  // 클린업
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="gradient-safe px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/home")}
            className="mr-2"
          >
            <ArrowLeft size={20} className="text-primary" />
          </Button>
          <div className="bg-primary rounded-full p-2">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">안심ON</h1>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* 서비스 정보 */}
        {(status === 'monitoring' || status === 'accepted') && (
          <Card className="mb-6 bg-primary-light border-primary">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-primary mb-2">안심 모니터링</h1>
                <p className="text-muted-foreground text-sm">
                  기술인: {serviceInfo?.technicianName || "미배정"} | {serviceInfo?.serviceType || "서비스"}
                </p>
                {isTechnicianRecording && (
                  <Badge className="bg-green-500 text-white mt-2">
                    기술인 영상 수신 중
                  </Badge>
                )}
              </div>

              {/* AI 이상 감지 알림 */}
              {aiDetection && (
                <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-yellow-600" size={24} />
                    <div>
                      <p className="font-bold text-yellow-800">AI 이상 징후 감지</p>
                      <p className="text-sm text-yellow-700">안심 파트너에게 알림을 보냈습니다</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 비디오 스트림 */}
              <div className="relative bg-black rounded-xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
                {isTechnicianRecording ? (
                  <>
                    {/* 기술인 영상 표시 (시뮬레이션) */}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Video size={40} className="text-white animate-pulse" />
                        </div>
                        <h3 className="text-lg font-bold text-primary mb-2">기술인 카메라 영상</h3>
                        <p className="text-sm text-muted-foreground">
                          {serviceInfo?.technicianName}님의 실시간 작업 영상을 보고 있습니다
                        </p>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">LIVE</span>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                      기술인 영상 수신 중
                    </div>
                  </>
                ) : (
                  <>
                    <video 
                      ref={videoRef}
                      autoPlay 
                      muted 
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    
                    {isStreaming && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">LIVE</span>
                      </div>
                    )}
                    
                    {!isStreaming && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-center text-white">
                          <VideoOff size={48} className="mx-auto mb-2 opacity-70" />
                          <p className="text-sm opacity-70">모니터링 대기 중</p>
                        </div>
                      </div>
                    )}
                    
                    {cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-center text-white p-4">
                          <AlertTriangle size={48} className="mx-auto mb-2 text-yellow-500" />
                          <p className="text-sm text-yellow-500">{cameraError}</p>
                          <p className="text-xs opacity-70 mt-2">
                            브라우저 설정에서 카메라 권한을 허용해주세요
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 컨트롤 버튼들 */}
              <div className="space-y-3">
                {!isStreaming && !isTechnicianRecording ? (
                  <Button 
                    onClick={handleStartStreaming}
                    variant="safe"
                    size="xl"
                    className="w-full h-16 text-xl font-bold shadow-xl"
                  >
                    <Camera className="mr-3" size={24} />
                    안심 모니터링 시작
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleSimulateAI}
                      variant="outline"
                      size="lg"
                      className="h-14"
                    >
                      <Zap className="mr-2" size={20} />
                      AI 감지 테스트
                    </Button>
                    <Button 
                      onClick={handleCompleteService}
                      variant="secondary"
                      size="lg"
                      className="h-14"
                    >
                      <CheckCircle className="mr-2" size={20} />
                      모니터링 종료
                    </Button>
                  </div>
                )}

                {/* 긴급 신고 버튼 */}
                {isStreaming && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="emergency"
                        size="xl"
                        className="w-full h-16 text-xl font-bold shadow-xl"
                      >
                        <AlertTriangle className="mr-3" size={24} />
                        긴급 상황 신고
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>긴급 상황 신고</AlertDialogTitle>
                        <AlertDialogDescription>
                          긴급 상황을 신고하시겠습니까? 기술인과 안심 파트너에게 즉시 알림이 전송됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleEmergency}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          긴급 신고
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              {/* 모니터링 정보 */}
              {status === 'monitoring' && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-primary" />
                      <span className="text-sm font-medium">진행 시간</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{duration}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      <span className="text-sm font-medium">안심 파트너</span>
                    </div>
                    <span className="text-sm text-muted-foreground">실시간 알림 대기 중</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 서비스가 없을 때 */}
        {status === 'idle' && (
          <Card className="bg-primary-light border-primary">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-primary text-lg mb-2">진행 중인 서비스가 없어요</h3>
              <p className="text-muted-foreground mb-6">
                안심 서비스를 요청하시면 실시간 모니터링을 시작할 수 있습니다
              </p>
              <Button 
                onClick={() => navigate("/service-request")}
                variant="safe"
                className="w-full"
              >
                서비스 요청하기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SafeCam;