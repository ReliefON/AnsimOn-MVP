import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useService } from "@/contexts/ServiceContext";

const PassAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginAs } = useService();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') as 'customer' | 'technician') || 'customer';

  const handleSendCode = () => {
    if (!phoneNumber) {
      toast({
        title: "휴대폰 번호를 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    setIsCodeSent(true);
    toast({
      title: "인증번호가 발송되었습니다",
      description: "SMS로 받은 6자리 인증번호를 입력해주세요.",
    });
  };

  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "인증번호 6자리를 모두 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    setIsCodeVerified(true);
    toast({
      title: "✅ 휴대폰 인증이 완료되었습니다",
      description: "이제 본인정보를 입력해주세요.",
    });
  };

  const handleSignUp = () => {
    if (!name || !birthdate || !phoneNumber || !isCodeVerified) {
      toast({
        title: "모든 정보를 입력하고 인증을 완료해주세요",
        variant: "destructive",
      });
      return;
    }
    if (birthdate.length !== 7) {
      toast({
        title: "주민등록번호 7자리를 정확히 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    // 회원가입 완료 처리
    loginAs(role);
    toast({
      title: "🎉 회원가입이 완료되었습니다!",
      description: `${role === 'customer' ? '고객' : '기술인'} 계정이 생성되었습니다.`,
      duration: 3000,
    });

    setTimeout(() => {
      const destination = role === 'customer' ? '/home' : '/technician';
      navigate(destination);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col gradient-safe px-4">
      {/* 헤더 */}
      <div className="pt-8 pb-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/auth")}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold text-primary">PASS 인증</h1>
        </div>
        
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary rounded-full p-3 shadow-lg">
              <Shield size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">안심ON</h2>
          <p className="text-primary font-semibold">안전ON, 안심ON</p>
        </div>
      </div>

      {/* 메인 카드 */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">
              {role === 'customer' ? '고객' : '기술인'} 회원가입
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                role === 'customer' 
                  ? 'bg-pink-50 border-pink-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-sm font-medium ${
                  role === 'customer' ? 'text-pink-800' : 'text-blue-800'
                }`}>
                  {role === 'customer' 
                    ? '🌸 여성 고객 안전을 위한 PASS 인증'
                    : '🔧 기술인 신원 확인을 위한 PASS 인증'
                  }
                </p>
                <p className={`text-xs mt-1 ${
                  role === 'customer' ? 'text-pink-600' : 'text-blue-600'
                }`}>
                  본인 인증을 통해 더욱 안전한 서비스를 이용하세요
                </p>
              </div>

              {/* 이름 입력 */}
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="h-12"
                />
              </div>

              {/* 주민번호 입력 */}
              <div className="space-y-2">
                <Label htmlFor="birthdate">주민등록번호 앞 7자리</Label>
                <Input
                  id="birthdate"
                  type="text"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  placeholder="9001011"
                  maxLength={7}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  생년월일 6자리 + 성별구분 1자리를 입력해주세요
                </p>
              </div>

              {/* 휴대폰 번호 및 인증 */}
              <div className="space-y-2">
                <Label htmlFor="phone">휴대폰 번호</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="010-0000-0000"
                    className="h-12 flex-1"
                    disabled={isCodeSent}
                  />
                  <Button 
                    onClick={handleSendCode}
                    variant="outline"
                    size="sm"
                    className="h-12 px-4"
                    disabled={!phoneNumber || isCodeSent}
                  >
                    {isCodeSent ? "발송완료" : "인증받기"}
                  </Button>
                </div>
              </div>

              {/* 인증번호 입력 */}
              {isCodeSent && (
                <div className="space-y-2">
                  <Label htmlFor="code">인증번호 (6자리)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="h-12 text-center text-lg flex-1"
                      disabled={isCodeVerified}
                    />
                    <Button 
                      onClick={handleVerifyCode}
                      variant="outline"
                      size="sm"
                      className="h-12 px-4"
                      disabled={verificationCode.length !== 6 || isCodeVerified}
                    >
                      {isCodeVerified ? "인증완료" : "확인"}
                    </Button>
                  </div>
                  {isCodeVerified && (
                    <p className="text-xs text-green-600 font-medium">
                      ✅ 휴대폰 인증이 완료되었습니다
                    </p>
                  )}
                </div>
              )}
              
              <Button 
                onClick={handleSignUp}
                variant="safe"
                size="lg"
                className="w-full h-12 mt-6"
                disabled={!name || !birthdate || !phoneNumber || !isCodeVerified}
              >
                {role === 'customer' ? '고객으로 회원가입' : '기술인으로 회원가입'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PassAuth;