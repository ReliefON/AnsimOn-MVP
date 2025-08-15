import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, Trash2, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useProfile, useSafetyPartners } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
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

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { partners, loading: partnersLoading, addPartner, removePartner } = useSafetyPartners();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerPhone, setNewPartnerPhone] = useState("");
  const [newPartnerRelationship, setNewPartnerRelationship] = useState("");
  
  const { toast } = useToast();

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setName(profile.display_name || user?.email?.split('@')[0] || "");
      setPhone(profile.phone_number || "");
    }
  }, [profile, user]);

  const handleProfileSave = async () => {
    const { error } = await updateProfile({
      display_name: name,
      phone_number: phone,
    });

    if (error) {
      toast({
        title: "프로필 저장 실패",
        description: "프로필 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "프로필 저장 완료",
        description: "개인정보가 안전하게 업데이트되었습니다.",
      });
    }
  };

  const handleAddPartner = async () => {
    if (!newPartnerPhone.trim() || !newPartnerName.trim()) return;
    
    const { error } = await addPartner({
      name: newPartnerName,
      phone_number: newPartnerPhone,
      relationship: newPartnerRelationship || null,
      is_primary: partners.length === 0,
    });

    if (error) {
      toast({
        title: "파트너 등록 실패",
        description: "안심 파트너 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } else {
      setNewPartnerName("");
      setNewPartnerPhone("");
      setNewPartnerRelationship("");
      
      toast({
        title: "안심 파트너 등록 완료 ✓",
        description: "안심 파트너 등록이 완료되었습니다.",
      });
    }
  };

  const handleRemovePartner = async (id: string) => {
    const { error } = await removePartner(id);
    
    if (error) {
      toast({
        title: "파트너 삭제 실패",
        description: "안심 파트너 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "파트너 삭제 완료",
        description: "안심 파트너가 삭제되었습니다.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <div className="gradient-safe px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary rounded-full p-2">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">안심ON</h1>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-center text-foreground font-medium">
            안전한 서비스를 위한 개인정보 관리
          </p>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* 프로필 편집 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              프로필 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12"
              />
            </div>
            
            <Button
              onClick={handleProfileSave}
              variant="safe"
              className="w-full"
            >
              프로필 저장
            </Button>
          </CardContent>
        </Card>

        {/* 안심 파트너 관리 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} className="text-primary" />
              안심 파트너 관리
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 파트너 추가 */}
            <div className="space-y-3">
              <Label>새 안심 파트너 추가</Label>
              <div className="space-y-2">
                <Input
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="이름 (예: 어머니)"
                  className="h-12"
                />
                <Input
                  value={newPartnerPhone}
                  onChange={(e) => setNewPartnerPhone(e.target.value)}
                  placeholder="휴대폰 번호"
                  className="h-12"
                />
                <Input
                  value={newPartnerRelationship}
                  onChange={(e) => setNewPartnerRelationship(e.target.value)}
                  placeholder="관계 (선택사항)"
                  className="h-12"
                />
                <Button
                  onClick={handleAddPartner}
                  variant="safe"
                  className="w-full"
                  disabled={!newPartnerName.trim() || !newPartnerPhone.trim()}
                >
                  <Plus size={20} className="mr-2" />
                  파트너 추가
                </Button>
              </div>
            </div>

            <Separator />

            {/* 파트너 목록 */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">등록된 안심 파트너</h4>
              {partners.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  등록된 안심 파트너가 없습니다
                </p>
              ) : (
                <div className="space-y-2">
                  {partners.map((partner) => (
                    <div
                      key={partner.id}
                      className="flex items-center justify-between p-3 bg-primary-light rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{partner.name}</p>
                        <p className="text-sm text-muted-foreground">{partner.phone_number}</p>
                        {partner.relationship && (
                          <p className="text-xs text-muted-foreground">{partner.relationship}</p>
                        )}
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>파트너 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              {partner.name} ({partner.phone_number})을(를) 안심 파트너에서 삭제하시겠습니까?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemovePartner(partner.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-accent p-3 rounded-lg">
              <p className="text-xs text-muted-foreground leading-relaxed">
                안심 파트너는 서비스 이용 시 실시간 알림을 받고, 
                긴급 상황 발생 시 즉시 연락받을 수 있는 분입니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 기타 메뉴 (MVP에서는 메뉴명만) */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground py-2 border-b">
                서비스 이용 내역 (준비 중)
              </div>
              <div className="text-sm text-muted-foreground py-2 border-b">
                알림 설정 (준비 중)
              </div>
              <div className="text-sm text-muted-foreground py-2 border-b">
                고객센터 (준비 중)
              </div>
              <div className="text-sm text-muted-foreground py-2">
                앱 정보 (준비 중)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default Profile;