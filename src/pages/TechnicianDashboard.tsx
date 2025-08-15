import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useService } from '@/contexts/ServiceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, CheckCircle, XCircle, Eye, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TechnicianDashboard = () => {
  const { serviceRequests, acceptServiceRequest, rejectServiceRequest } = useService();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAcceptService = async (requestId: string) => {
    await acceptServiceRequest(requestId);
    toast({
      title: "서비스 수락됨",
      description: "고객에게 수락 알림이 전송되었습니다.",
    });
    // Navigate to service detail page after accepting
    navigate(`/technician/service/${requestId}`);
  };

  const handleRejectService = async (requestId: string) => {
    await rejectServiceRequest(requestId);
    toast({
      title: "서비스 거절됨",
      description: "고객에게 거절 알림이 전송되었습니다.",
    });
  };

  const handleViewDetails = (requestId: string) => {
    navigate(`/technician/service/${requestId}`);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '수락 대기', variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: '수락됨', variant: 'outline' as const, className: 'bg-green-100 text-green-800' },
      rejected: { label: '거절됨', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' },
      monitoring: { label: '모니터링 중', variant: 'default' as const, className: 'bg-primary text-white' },
      completed: { label: '완료됨', variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const pendingRequests = serviceRequests.filter(req => req.status === 'pending');
  const acceptedRequests = serviceRequests.filter(req => req.status === 'accepted' || req.status === 'monitoring');
  const otherRequests = serviceRequests.filter(req => ['rejected', 'completed'].includes(req.status));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <div className="gradient-technician px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full p-2">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">기술인 대시보드</h1>
              <p className="text-sm text-muted-foreground">
                서비스 요청 관리 및 현황을 확인하세요
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              signOut();
              navigate('/auth');
            }}
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* 수락 대기 중인 요청들 */}
        {pendingRequests.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">새로운 서비스 요청</h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-yellow-800">{request.service_type}</h3>
                          <p className="text-sm text-yellow-600">고객: {request.customer_name}</p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-yellow-600" />
                        <span>{formatDate(request.scheduled_date)} {request.scheduled_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-yellow-600" />
                        <span>{request.location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => handleAcceptService(request.id)}
                        variant="safe"
                        className="font-bold"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        수락하기
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleRejectService(request.id)}
                        className="font-bold"
                      >
                        <XCircle size={16} className="mr-2" />
                        거절하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 수락된 요청들 */}
        {acceptedRequests.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">진행 중인 서비스</h2>
            <div className="space-y-4">
              {acceptedRequests.map((request) => (
                <Card key={request.id} className="bg-primary-light border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-primary">{request.service_type}</h3>
                          <p className="text-sm text-muted-foreground">고객: {request.customer_name}</p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-primary" />
                        <span>{formatDate(request.scheduled_date)} {request.scheduled_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-primary" />
                        <span>{request.location}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleViewDetails(request.id)}
                      variant="outline"
                      className="w-full font-bold"
                    >
                      <Eye size={16} className="mr-2" />
                      상세 보기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 기타 요청들 (완료됨, 거절됨 등) */}
        {otherRequests.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">이전 서비스</h2>
            <div className="space-y-4">
              {otherRequests.map((request) => (
                <Card key={request.id} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{request.service_type}</h3>
                          <p className="text-sm text-muted-foreground">고객: {request.customer_name}</p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 요청이 없을 때 */}
        {serviceRequests.length === 0 && (
          <Card className="bg-primary-light border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-primary text-lg mb-2">대기 중</h3>
              <p className="text-muted-foreground">
                새로운 서비스 요청을 기다리고 있어요
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;