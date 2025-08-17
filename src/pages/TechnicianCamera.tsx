import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useService } from '@/contexts/ServiceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Video, VideoOff, Camera, StopCircle, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TechnicianCamera = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { 
    serviceRequests,
    serviceInfo,
    emergencyTriggered,
    startMonitoring,
    endMonitoring 
  } = useService();
  const { toast } = useToast();
  
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState<string>('0:00');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentRequest = serviceRequests.find(req => req.id === serviceId);

  useEffect(() => {
    if (!currentRequest) {
      navigate('/technician');
      return;
    }

    // Start monitoring if status is 'accepted' (just arrived from dashboard)
    if (currentRequest.status === 'accepted') {
      startMonitoring();
    }

    // Auto-start recording when component mounts
    startRecording();
    
    return () => {
      // Cleanup stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentRequest, navigate]);

  // Duration timer
  useEffect(() => {
    if (isRecording && serviceInfo?.startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const start = serviceInfo.startTime!;
        const diffMs = now.getTime() - start.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          setDuration(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRecording, serviceInfo?.startTime]);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setIsRecording(true);
      
      toast({
        title: "녹화 시작",
        description: "실시간 모니터링 녹화가 시작되었습니다.",
      });
    } catch (error) {
      console.error('Camera access failed:', error);
      toast({
        title: "카메라 오류",
        description: "카메라에 접근할 수 없습니다. 권한을 확인해주세요.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsRecording(false);
    
    toast({
      title: "녹화 중지",
      description: "녹화가 중지되었습니다.",
    });
  };

  const handleCompleteService = () => {
    stopRecording();
    endMonitoring();
    
    toast({
      title: "서비스 완료",
      description: "모니터링이 종료되었습니다.",
    });
    
    // Navigate back to dashboard
    setTimeout(() => navigate('/technician'), 2000);
  };

  const handleEmergencyComplete = () => {
    stopRecording();
    endMonitoring();
    
    toast({
      title: "긴급 대응 완료",
      description: "긴급 상황 대응이 완료되었습니다.",
    });
    
    setTimeout(() => navigate('/technician'), 1000);
  };

  if (!currentRequest) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-technician px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/technician/service/${serviceId}`)}
              className="mr-2"
            >
              <ArrowLeft size={20} className="text-primary" />
            </Button>
            <div className="bg-primary rounded-full p-2">
              <Camera size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">실시간 모니터링</h1>
              <p className="text-sm text-muted-foreground">
                {currentRequest.customer_name}님 서비스 중
              </p>
            </div>
          </div>
          <Badge variant="default" className="bg-primary text-white">
            {isRecording ? '녹화 중' : '대기 중'}
          </Badge>
        </div>
      </div>

      {/* Emergency Alert */}
      {emergencyTriggered && (
        <div className="px-6 mb-6">
          <Card className="bg-destructive/10 border-destructive border-2 animate-pulse">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle size={48} className="text-destructive mx-auto mb-4" />
                <h4 className="font-bold text-destructive text-xl mb-2">긴급 상황 발생!</h4>
                <p className="text-destructive/80 mb-4">
                  고객의 긴급 신고가 접수되었습니다. <br />
                  즉시 작업을 중단하고 현장을 벗어나 안전을 확보해주세요.
                </p>
                <Button 
                  onClick={handleEmergencyComplete}
                  variant="emergency"
                  size="xl"
                  className="w-full h-16 text-xl font-bold"
                >
                  즉시 현장 벗어나기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="px-6 space-y-6">
        {/* Video Recording Section */}
        <Card className="bg-primary-light border-primary">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
                {isRecording ? (
                  <Video className="h-8 w-8 text-white animate-pulse" />
                ) : (
                  <VideoOff className="h-8 w-8 text-white" />
                )}
              </div>
              <h3 className="font-bold text-primary text-lg mb-2">
                기술인 모니터링 카메라
              </h3>
              <Badge variant="outline" className="bg-white text-primary border-primary">
                실시간 전송 중
              </Badge>
            </div>

            {/* Video Display */}
            <div className="relative bg-black rounded-xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
              <video 
                ref={videoRef}
                autoPlay 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
              
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">REC</span>
                </div>
              )}
              
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full">
                  <Clock size={14} />
                  <span className="text-sm font-medium">{duration}</span>
                </div>
              )}
              
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-white">
                    <VideoOff size={48} className="mx-auto mb-2 opacity-70" />
                    <p className="text-sm opacity-70">녹화가 중지되었습니다</p>
                  </div>
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-primary/20">
                <div>
                  <p className="font-medium text-foreground">서비스 정보</p>
                  <p className="text-sm text-muted-foreground">{serviceInfo?.serviceType || currentRequest.service_type}</p>
                </div>
                <Badge variant="outline" className="bg-primary-light text-primary">
                  진행 중
                </Badge>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
              {!isRecording ? (
                <Button 
                  onClick={startRecording}
                  variant="safe"
                  size="lg"
                  className="flex-1 min-w-0 flex items-center justify-center"
                >
                  <Video className="mr-2 flex-shrink-0" size={20} />
                  녹화 시작
                </Button>
              ) : (
                <Button 
                  onClick={stopRecording}
                  variant="outline"
                  size="lg"
                  className="flex-1 min-w-0 flex items-center justify-center"
                >
                  <VideoOff className="mr-2 flex-shrink-0" size={20} />
                  녹화 중지
                </Button>
              )}
              
              <Button 
                onClick={handleCompleteService}
                variant="safe"
                size="lg"
                className="flex-1 min-w-0 flex items-center justify-center"
              >
                <StopCircle className="mr-2 flex-shrink-0" size={20} />
                모니터링 종료
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-primary font-medium">
                실시간 영상이 고객에게 전송되고 있습니다
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechnicianCamera;