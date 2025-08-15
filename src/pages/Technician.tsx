import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useService } from '@/contexts/ServiceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, AlertTriangle, CheckCircle, Shield, Phone, ArrowLeft, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Technician = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { 
    status, 
    serviceInfo, 
    emergencyTriggered, 
    serviceRequests,
    currentServiceId,
    startMonitoring, 
    endMonitoring 
  } = useService();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  // Get current request from URL parameter or current service ID
  const currentRequest = serviceRequests.find(req => req.id === serviceId) || 
                        serviceRequests.find(req => req.id === currentServiceId);

  // Redirect if no valid request found
  useEffect(() => {
    if (!currentRequest || currentRequest.status === 'pending') {
      navigate('/technician');
    }
  }, [currentRequest, navigate]);



  const handleStartMonitoring = () => {
    // 고객에게 알림 시뮬레이션
    const technicianName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || '기술인';
    alert(`${technicianName}님이 모니터링을 시작했습니다.`);
    
    toast({
      title: "모니터링 시작",
      description: "실시간 모니터링이 시작되었습니다.",
    });
    
    // Navigate to camera page - monitoring will start there
    navigate(`/technician/camera/${currentRequest.id}`);
  };

  const handleCompleteService = () => {
    endMonitoring();
    toast({
      title: "서비스 완료",
      description: "서비스가 성공적으로 완료되었습니다.",
    });
    // Navigate back to dashboard after completion
    setTimeout(() => navigate('/technician'), 2000);
  };

  const renderStatusBadge = () => {
    const statusConfig = {
      idle: { label: '대기 중', variant: 'secondary' as const },
      pending: { label: '요청 대기', variant: 'default' as const },
      accepted: { label: '수락됨', variant: 'outline' as const },
      reserved: { label: '예약됨', variant: 'outline' as const },
      monitoring: { label: '모니터링 중', variant: 'default' as const },
      completed: { label: '완료됨', variant: 'secondary' as const },
    };

    const config = statusConfig[status];
    return (
      <Badge 
        variant={config.variant} 
        className={status === 'monitoring' ? "bg-primary text-white" : "bg-white text-muted-foreground"}
      >
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '날짜 없음';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return '잘못된 날짜';
    }
    
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(dateObj);
  };

  if (!currentRequest) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <div className="gradient-technician px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/technician')}
              className="mr-2"
            >
              <ArrowLeft size={20} className="text-primary" />
            </Button>
            <div className="bg-primary rounded-full p-2">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">서비스 상세</h1>
              <p className="text-sm text-muted-foreground">
                {currentRequest.customer_name}님의 서비스
              </p>
            </div>
          </div>
          {renderStatusBadge()}
        </div>
      </div>

      {/* 긴급 알림 */}
      {emergencyTriggered && status === 'monitoring' && (
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
                  onClick={handleCompleteService}
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
        {/* 예약된 서비스 표시 */}
        {(currentRequest.status === 'accepted' || status === 'accepted') && serviceInfo && (
          <Card className="bg-primary-light border-primary">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-primary text-lg mb-2">예약된 서비스</h3>
                <Badge variant="outline" className="bg-white text-primary border-primary">
                  모니터링 시작 준비
                </Badge>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-primary/20">
                  <User size={20} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground">고객 정보</p>
                    <p className="text-sm text-muted-foreground">홍길동 고객님</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-primary/20">
                  <Phone size={20} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground">서비스 유형</p>
                    <p className="text-sm text-muted-foreground">{serviceInfo.serviceType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-primary/20">
                  <Clock size={20} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground">예약 시간</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(serviceInfo.scheduledDate)} {serviceInfo.scheduledTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-primary/20">
                  <MapPin size={20} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground">서비스 위치</p>
                    <p className="text-sm text-muted-foreground">{serviceInfo.location}</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleStartMonitoring}
                variant="safe"
                size="xl"
                className="w-full h-16 text-xl font-bold shadow-lg"
              >
                <Shield size={24} className="mr-3" />
                모니터링 시작하기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 모니터링 진행 중 - 카메라 페이지로 리다이렉트 */}
        {status === 'monitoring' && serviceInfo && (
          <Card className="bg-primary-light border-primary">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white animate-pulse" />
              </div>
              <h3 className="font-bold text-primary text-lg mb-2">모니터링 진행 중</h3>
              <p className="text-muted-foreground mb-4">
                카메라 화면에서 실시간 모니터링을 진행하세요
              </p>
              <Button 
                onClick={() => navigate(`/technician/camera/${currentRequest.id}`)}
                variant="safe"
                size="xl"
                className="w-full h-16 text-xl font-bold"
              >
                <Video size={24} className="mr-3" />
                카메라 화면으로 이동
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 서비스 완료 */}
        {status === 'completed' && (
          <Card className="bg-primary-light border-primary">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-primary text-lg mb-2">서비스 완료</h3>
              <p className="text-muted-foreground">
                서비스가 성공적으로 완료되었습니다
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Technician;