/**
 * ProfilePage - Trang thông tin cá nhân
 * Khách hàng có thể xem và chỉnh sửa thông tin cá nhân, quản lý địa chỉ, mật khẩu
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Lock, MapPin, Bell, Camera } from "lucide-react";

export default function ProfilePage() {
  // State thông tin cá nhân
  const [profile, setProfile] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    phone: "0901234567",
    avatar: "/avatars/customer.jpg",
  });

  // State địa chỉ
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "Nhà riêng",
      detail: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      isDefault: true,
    },
    {
      id: 2,
      name: "Công ty",
      detail: "456 Đường Lê Lợi, Quận 1, TP.HCM",
      isDefault: false,
    },
  ]);

  // State form chỉnh sửa
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setProfile(editForm);
    setEditMode(false);
    toast.success("Đã cập nhật thông tin cá nhân");
  };

  const handleChangePassword = () => {
    toast.success("Mật khẩu đã được thay đổi");
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
    toast.success("Đã cập nhật địa chỉ mặc định");
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thông tin cá nhân</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý hồ sơ, địa chỉ, và mật khẩu
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="size-4" />
            <span className="hidden sm:inline">Hồ sơ</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="size-4" />
            <span className="hidden sm:inline">Địa chỉ</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Lock className="size-4" />
            <span className="hidden sm:inline">Bảo mật</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Hồ sơ */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hồ sơ</CardTitle>
              <CardDescription>
                Cập nhật người liên hệ và thông tin cá nhân
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="flex items-center gap-2">
                  <Camera className="size-4" />
                  Đổi ảnh đại diện
                </Button>
              </div>

              <Separator />

              {/* Form chỉnh sửa */}
              {editMode ? (
                <form className="space-y-4">
                  {/* Tên */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên đầy đủ</Label>
                    <Input
                      id="name"
                      name="name"
                      value={editForm.name}
                      onChange={handleProfileChange}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={editForm.email}
                      onChange={handleProfileChange}
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleProfileChange}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveProfile}>Lưu thay đổi</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditMode(false);
                        setEditForm(profile);
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Display mode */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">
                        Tên đầy đủ
                      </Label>
                      <p className="font-medium">{profile.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Số điện thoại
                      </Label>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>

                  <Button onClick={() => setEditMode(true)}>
                    Chỉnh sửa thông tin
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Địa chỉ */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Địa chỉ của bạn</CardTitle>
                <CardDescription>Quản lý các địa chỉ giao hàng</CardDescription>
              </div>
              <Button>Thêm địa chỉ mới</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{address.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {address.detail}
                      </p>
                    </div>
                    {address.isDefault && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Mặc định
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefaultAddress(address.id)}
                      >
                        Đặt làm mặc định
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Chỉnh sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Bảo mật */}
        <TabsContent value="settings">
          <div className="space-y-4">
            {/* Đổi mật khẩu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="size-5" />
                  Đổi mật khẩu
                </CardTitle>
                <CardDescription>
                  Cập nhật mật khẩu của bạn định kỳ để bảo vệ tài khoản
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  className="w-full sm:w-auto"
                >
                  Cập nhật mật khẩu
                </Button>
              </CardContent>
            </Card>

            {/* Thông báo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="size-5" />
                  Cài đặt thông báo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-accent">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <div>
                    <p className="font-medium text-sm">Thông báo đơn hàng</p>
                    <p className="text-xs text-muted-foreground">
                      Nhận thông báo về trạng thái đơn hàng
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-accent">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <div>
                    <p className="font-medium text-sm">Khuyến mãi & Ưu đãi</p>
                    <p className="text-xs text-muted-foreground">
                      Nhận thông tin về các khuyến mãi mới
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-accent">
                  <input type="checkbox" className="w-4 h-4" />
                  <div>
                    <p className="font-medium text-sm">Email tiếp thị</p>
                    <p className="text-xs text-muted-foreground">
                      Nhận email về các bản tin hàng tuần
                    </p>
                  </div>
                </label>
              </CardContent>
            </Card>

            {/* Đăng xuất */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Đăng xuất</CardTitle>
                <CardDescription>Đăng xuất khỏi tài khoản này</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">Đăng xuất</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
