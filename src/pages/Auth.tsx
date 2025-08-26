import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useService, UserType } from "@/contexts/ServiceContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserType>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const { loginAs } = useService();

  // Check if form is complete for button activation
  const isFormComplete = email.trim() !== "" && password.trim() !== "" && selectedRole;

  const handleRoleSelect = (role: UserType) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast({
        title: "역할 선택 필요",
        description: "고객 또는 기술인 중 하나를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        // 실제 로그인
        const { error } = await signIn(email, password);
        
        if (error) {
          toast({
            title: "로그인 실패",
            description: "이메일 또는 비밀번호를 확인해주세요.",
            variant: "destructive",
          });
          return;
        }
        
        // 로그인 성공 - 실제 DB에서 역할을 조회하도록 /home으로 이동
        // (Home 컴포넌트에서 userType에 따라 자동으로 리디렉션됨)
        navigate('/home');
        
        toast({
          title: `${selectedRole === 'customer' ? '고객' : '기술인'}으로 로그인 완료`,
          description: "안심ON에 오신 것을 환영합니다!",
        });
        
      } else {
        // 회원가입
        const { error } = await signUp(email, password);
        
        if (error) {
          toast({
            title: "회원가입 실패",
            description: error.message || "회원가입 중 오류가 발생했습니다.",
            variant: "destructive",
          });
          return;
        }
        
        // 회원가입 후 PASS 인증 페이지로 이동
        const passAuthUrl = `/pass-auth?role=${selectedRole}`;
        navigate(passAuthUrl);
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col gradient-safe px-4">
      {/* 헤더 브랜딩 */}
      <div className="pt-12 pb-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="bg-primary rounded-full p-4 shadow-lg">
                <Shield size={40} className="text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-primary mb-6">안심ON</h1>
          
          <p className="text-foreground">안전한 기술인 매칭 서비스에 로그인하세요!</p>
        </div>
      </div>
      
      {/* 메인 로그인 카드 */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* 역할 선택 */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-center">어떤 분이신가요?</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  onClick={() => handleRoleSelect('customer')}
                  className={`flex flex-col gap-2 h-20 transition-all ${
                    selectedRole === 'customer' 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                  }`}
                >
                  <Users size={24} />
                  <span>고객</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => handleRoleSelect('technician')}
                  className={`flex flex-col gap-2 h-20 transition-all ${
                    selectedRole === 'technician' 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                  }`}
                >
                  <Wrench size={24} />
                  <span>기술인</span>
                </Button>
              </div>
              
              {/* 테스트 계정 정보 표시 */}
              {selectedRole && (
                <div className="text-center text-sm text-gray-600 mt-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium mb-1">테스트 계정</p>
                    {selectedRole === 'customer' ? (
                      <>
                        <p>이메일: customer2@mytestapp.com</p>
                        <p>비밀번호: customer2</p>
                      </>
                    ) : (
                      <>
                        <p>이메일: tech1@mytestapp.com</p>
                        <p>비밀번호: tech1</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="h-12 bg-white/80"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="h-12 bg-white/80"
                />
              </div>
              
              
              <Button
                type="submit"
                variant="safe"
                size="lg"
                disabled={!isFormComplete || loading}
                className={`w-full h-12 font-semibold transition-all ${
                  isFormComplete && !loading ? 'opacity-100' : 'opacity-70'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    처리 중...
                  </div>
                ) : (
                  selectedRole === 'customer' 
                    ? (isLogin ? "고객으로 로그인" : "고객으로 회원가입")
                    : selectedRole === 'technician'
                    ? (isLogin ? "기술인으로 로그인" : "기술인으로 회원가입")
                    : (isLogin ? "로그인" : "회원가입")
                )}
              </Button>
            </form>
            
            <div className="text-center mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline text-sm"
              >
                {isLogin 
                 ? "처음이신가요? 회원가입하기" 
                 : "이미 계정이 있으신가요? 로그인하기"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;