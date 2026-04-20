import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Bell, Camera, Lock, MapPin, User } from "lucide-react";
import { toast } from "sonner";

import api from "@/services/api/client";
import {
  clearCustomerSession,
  getCustomerAuthHeaders,
  getCustomerProfileCache,
  setCustomerProfileCache,
} from "@/services/customer-session";

const EMPTY_PROFILE = {
  name: "Khách hàng",
  email: "",
  phone: "",
  avatar: "/avatars/customer.jpg",
  avatarUrl: "",
  note: "",
  tier: "bronze",
  points: 0,
  notificationSettings: {
    orderUpdates: true,
    promotions: true,
    emailMarketing: false,
  },
};

const EMPTY_ADDRESS = {
  name: "",
  detail: "",
  phone: "",
  isDefault: false,
  type: "home",
};

const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const buildAuthConfig = () => ({
  headers: getCustomerAuthHeaders(),
});

export default function ProfilePage() {
  const cachedProfile = getCustomerProfileCache();
  const [profile, setProfile] = useState(cachedProfile || EMPTY_PROFILE);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: cachedProfile?.name || EMPTY_PROFILE.name,
    email: cachedProfile?.email || EMPTY_PROFILE.email,
    phone: cachedProfile?.phone || EMPTY_PROFILE.phone,
    avatar: cachedProfile?.avatar || EMPTY_PROFILE.avatar,
    note: cachedProfile?.note || EMPTY_PROFILE.note,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notificationForm, setNotificationForm] = useState(
    cachedProfile?.notificationSettings || EMPTY_PROFILE.notificationSettings,
  );
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressFormVisible, setAddressFormVisible] = useState(false);

  const isAuthenticated = Boolean(getCustomerAuthHeaders().Authorization);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const [profileResponse, addressesResponse] = await Promise.all([
        api.get("/client/profile", buildAuthConfig()),
        api.get("/client/addresses", buildAuthConfig()),
      ]);

      const nextProfile = profileResponse.data?.profile || EMPTY_PROFILE;
      const nextAddresses = addressesResponse.data?.addresses || [];

      const normalizedProfile = {
        name: nextProfile.name || EMPTY_PROFILE.name,
        email: nextProfile.email || "",
        phone: nextProfile.phone || "",
        avatar:
          nextProfile.avatar ||
          nextProfile.avatarUrl ||
          "/avatars/customer.jpg",
        avatarUrl: nextProfile.avatarUrl || nextProfile.avatar || "",
        note: nextProfile.note || "",
        tier: nextProfile.tier || "bronze",
        points: nextProfile.points || 0,
        notificationSettings: {
          orderUpdates: nextProfile.notificationSettings?.orderUpdates ?? true,
          promotions: nextProfile.notificationSettings?.promotions ?? true,
          emailMarketing:
            nextProfile.notificationSettings?.emailMarketing ?? false,
        },
      };

      setProfile(normalizedProfile);
      setEditForm({
        name: normalizedProfile.name,
        email: normalizedProfile.email,
        phone: normalizedProfile.phone,
        avatar: normalizedProfile.avatarUrl || normalizedProfile.avatar,
        note: normalizedProfile.note,
      });
      setNotificationForm(normalizedProfile.notificationSettings);
      setAddresses(nextAddresses);
      setCustomerProfileCache(normalizedProfile);
    } catch (error) {
      toast.error(
        extractErrorMessage(error, "Không thể tải thông tin khách hàng"),
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setEditForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    try {
      setSavingProfile(true);
      const response = await api.put(
        "/client/profile",
        {
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          avatar: editForm.avatar,
          note: editForm.note,
        },
        buildAuthConfig(),
      );

      const nextProfile = response.data?.profile;
      if (nextProfile) {
        const normalizedProfile = {
          name: nextProfile.name || EMPTY_PROFILE.name,
          email: nextProfile.email || "",
          phone: nextProfile.phone || "",
          avatar:
            nextProfile.avatar ||
            nextProfile.avatarUrl ||
            "/avatars/customer.jpg",
          avatarUrl: nextProfile.avatarUrl || nextProfile.avatar || "",
          note: nextProfile.note || "",
          tier: nextProfile.tier || profile.tier,
          points: nextProfile.points ?? profile.points,
          notificationSettings:
            nextProfile.notificationSettings || profile.notificationSettings,
        };

        setProfile(normalizedProfile);
        setEditForm({
          name: normalizedProfile.name,
          email: normalizedProfile.email,
          phone: normalizedProfile.phone,
          avatar: normalizedProfile.avatarUrl || normalizedProfile.avatar,
          note: normalizedProfile.note,
        });
        setCustomerProfileCache(normalizedProfile);
      }

      setEditMode(false);
      toast.success(response.data?.message || "Đã cập nhật thông tin cá nhân");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Không thể cập nhật hồ sơ"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    try {
      setSavingPassword(true);
      const response = await api.put(
        "/client/profile/password",
        passwordForm,
        buildAuthConfig(),
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success(response.data?.message || "Mật khẩu đã được thay đổi");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Không thể đổi mật khẩu"));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleNotificationToggle = (fieldName) => {
    setNotificationForm((previous) => ({
      ...previous,
      [fieldName]: !previous[fieldName],
    }));
  };

  const handleSaveNotificationSettings = async () => {
    try {
      setSavingNotifications(true);
      const response = await api.put(
        "/client/profile/notification-settings",
        notificationForm,
        buildAuthConfig(),
      );

      const nextProfile = response.data?.profile;
      if (nextProfile) {
        const normalizedProfile = {
          ...profile,
          notificationSettings:
            nextProfile.notificationSettings || notificationForm,
        };
        setProfile(normalizedProfile);
        setCustomerProfileCache(normalizedProfile);
      }

      toast.success(
        response.data?.message || "Cập nhật cài đặt thông báo thành công",
      );
    } catch (error) {
      toast.error(extractErrorMessage(error, "Không thể cập nhật thông báo"));
    } finally {
      setSavingNotifications(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm(EMPTY_ADDRESS);
    setEditingAddressId(null);
    setAddressFormVisible(false);
  };

  const startCreateAddress = () => {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS);
    setAddressFormVisible(true);
  };

  const startEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      name: address.name || "",
      detail: address.detail || "",
      phone: address.phone || "",
      isDefault: Boolean(address.isDefault),
      type: address.type || "home",
    });
    setAddressFormVisible(true);
  };

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAddressForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();

    try {
      setSavingAddress(true);
      const payload = {
        name: addressForm.name,
        detail: addressForm.detail,
        phone: addressForm.phone,
        isDefault: addressForm.isDefault,
        type: addressForm.type,
      };

      const response = editingAddressId
        ? await api.put(
            `/client/addresses/${editingAddressId}`,
            payload,
            buildAuthConfig(),
          )
        : await api.post("/client/addresses", payload, buildAuthConfig());

      const nextAddress = response.data?.address;
      if (nextAddress) {
        setAddresses((previous) => {
          const filtered = previous.filter(
            (address) => address.id !== nextAddress.id,
          );
          const nextList = [nextAddress, ...filtered];

          if (nextAddress.isDefault) {
            return nextList.map((address) => ({
              ...address,
              isDefault: address.id === nextAddress.id,
            }));
          }

          return nextList;
        });
      }

      toast.success(response.data?.message || "Đã lưu địa chỉ");
      resetAddressForm();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Không thể lưu địa chỉ"));
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await api.delete(`/client/addresses/${addressId}`, buildAuthConfig());
      setAddresses((previous) =>
        previous.filter((address) => address.id !== addressId),
      );
      toast.success("Đã xóa địa chỉ");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Không thể xóa địa chỉ"));
    }
  };

  const handleSetDefaultAddress = async (address) => {
    try {
      const response = await api.put(
        `/client/addresses/${address.id}`,
        { ...address, isDefault: true },
        buildAuthConfig(),
      );

      const nextAddress = response.data?.address;
      if (nextAddress) {
        setAddresses((previous) =>
          previous.map((item) => ({
            ...item,
            isDefault: item.id === nextAddress.id,
          })),
        );
      }

      toast.success(response.data?.message || "Đã cập nhật địa chỉ mặc định");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Không thể đặt địa chỉ mặc định"));
    }
  };

  if (!isAuthenticated && loading) {
    return (
      <div className="space-y-6">
        <Card className="border-[hsl(var(--customer-border))] bg-white shadow-sm">
          <CardContent className="p-6">
            <p className="font-medium">Vui lòng đăng nhập để xem hồ sơ.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-[hsl(var(--customer-border))] bg-white shadow-sm">
        <div className="bg-linear-to-r from-[hsl(var(--customer-primary))] to-[hsl(var(--customer-bg))] p-5 text-white md:p-6">
          <Badge className="text-white bg-white/20 hover:bg-white/20">
            Tài khoản khách hàng
          </Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Thông tin cá nhân
          </h1>
          <p className="mt-2 text-sm text-white/90 md:text-base">
            Quản lý hồ sơ, địa chỉ, và mật khẩu trong một khu vực tài khoản gọn
            gàng.
          </p>
        </div>
      </section>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-2xl bg-[hsl(var(--customer-surface-soft)/0.75)] p-2">
          <TabsTrigger
            value="profile"
            className="rounded-xl px-4 py-2 data-[state=active]:bg-[hsl(var(--customer-primary))] data-[state=active]:text-white"
          >
            <User className="mr-2 size-4" />
            Hồ sơ
          </TabsTrigger>
          <TabsTrigger
            value="addresses"
            className="rounded-xl px-4 py-2 data-[state=active]:bg-[hsl(var(--customer-primary))] data-[state=active]:text-white"
          >
            <MapPin className="mr-2 size-4" />
            Địa chỉ
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-xl px-4 py-2 data-[state=active]:bg-[hsl(var(--customer-primary))] data-[state=active]:text-white"
          >
            <Lock className="mr-2 size-4" />
            Cài đặt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-[hsl(var(--customer-border))] bg-white shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle>Thông tin hồ sơ</CardTitle>
              <CardDescription>
                Cập nhật người liên hệ và thông tin cá nhân
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24 ring-4 ring-[hsl(var(--customer-surface-soft))] ring-offset-2 ring-offset-white">
                  <AvatarImage
                    src={profile.avatarUrl || profile.avatar}
                    alt={profile.name}
                  />
                  <AvatarFallback>
                    {profile.name?.charAt(0) || "K"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-[hsl(var(--customer-border))] text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))]"
                  >
                    <Camera className="size-4" />
                    Đổi ảnh đại diện
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Ảnh đại diện hiện được lưu trong hồ sơ backend.
                  </p>
                </div>
              </div>

              <Separator />

              {editMode ? (
                <form className="space-y-4" onSubmit={handleSaveProfile}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên đầy đủ</Label>
                    <Input
                      id="name"
                      name="name"
                      value={editForm.name}
                      onChange={handleProfileChange}
                    />
                  </div>

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

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">Đường dẫn ảnh đại diện</Label>
                    <Input
                      id="avatar"
                      name="avatar"
                      value={editForm.avatar}
                      onChange={handleProfileChange}
                      placeholder="/avatars/customer.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Input
                      id="note"
                      name="note"
                      value={editForm.note}
                      onChange={handleProfileChange}
                      placeholder="Ví dụ: Không ăn cay"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-[hsl(var(--customer-primary))] text-white hover:bg-[hsl(var(--customer-primary-hover))]"
                    >
                      {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[hsl(var(--customer-border))] text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))]"
                      onClick={() => {
                        setEditMode(false);
                        setEditForm({
                          name: profile.name,
                          email: profile.email,
                          phone: profile.phone,
                          avatar: profile.avatarUrl || profile.avatar,
                          note: profile.note || "",
                        });
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">
                        Tên đầy đủ
                      </Label>
                      <p className="font-medium">{profile.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">
                        {profile.email || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Số điện thoại
                      </Label>
                      <p className="font-medium">
                        {profile.phone || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Hạng thành viên
                      </Label>
                      <p className="font-medium capitalize">{profile.tier}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Điểm tích lũy
                      </Label>
                      <p className="font-medium">{profile.points}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Ghi chú</Label>
                      <p className="font-medium">
                        {profile.note || "Không có"}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setEditMode(true)}
                    className="bg-[hsl(var(--customer-primary))] text-white hover:bg-[hsl(var(--customer-primary-hover))]"
                  >
                    Chỉnh sửa thông tin
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card className="border-[hsl(var(--customer-border))] bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Địa chỉ của bạn</CardTitle>
                <CardDescription>Quản lý các địa chỉ giao hàng</CardDescription>
              </div>
              <Button
                onClick={startCreateAddress}
                className="bg-[hsl(var(--customer-primary))] text-white hover:bg-[hsl(var(--customer-primary-hover))]"
              >
                Thêm địa chỉ mới
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressFormVisible ? (
                <form
                  className="space-y-4 rounded-2xl border border-[hsl(var(--customer-border))] bg-[hsl(var(--customer-surface-soft)/0.45)] p-4"
                  onSubmit={handleSaveAddress}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address-name">Tên địa chỉ</Label>
                      <Input
                        id="address-name"
                        name="name"
                        value={addressForm.name}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-phone">Số điện thoại</Label>
                      <Input
                        id="address-phone"
                        name="phone"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address-detail">Địa chỉ chi tiết</Label>
                    <Input
                      id="address-detail"
                      name="detail"
                      value={addressForm.detail}
                      onChange={handleAddressChange}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address-type">Loại địa chỉ</Label>
                      <Input
                        id="address-type"
                        name="type"
                        value={addressForm.type}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <label className="flex items-center gap-3 pt-7">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleAddressChange}
                      />
                      <span className="text-sm">Đặt làm mặc định</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={savingAddress}
                      className="bg-[hsl(var(--customer-primary))] text-white hover:bg-[hsl(var(--customer-primary-hover))]"
                    >
                      {savingAddress
                        ? "Đang lưu..."
                        : editingAddressId
                          ? "Cập nhật"
                          : "Thêm mới"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[hsl(var(--customer-border))] text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))]"
                      onClick={resetAddressForm}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : null}

              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Đang tải địa chỉ...
                </p>
              ) : addresses.length > 0 ? (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className="space-y-3 rounded-2xl border border-[hsl(var(--customer-border))] bg-white p-4 transition-colors hover:bg-[hsl(var(--customer-surface-soft)/0.35)]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{address.name}</h3>
                          {address.isDefault ? (
                            <span className="rounded bg-[hsl(var(--customer-primary))] px-2 py-1 text-xs text-[hsl(var(--customer-primary-foreground))]">
                              Mặc định
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.detail}
                        </p>
                        {address.phone ? (
                          <p className="text-sm text-muted-foreground">
                            {address.phone}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {!address.isDefault ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[hsl(var(--customer-border))] text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))]"
                          onClick={() => handleSetDefaultAddress(address)}
                        >
                          Đặt làm mặc định
                        </Button>
                      ) : null}
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[hsl(var(--customer-border))] text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))]"
                        onClick={() => startEditAddress(address)}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có địa chỉ nào.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-4">
            <Card className="border-[hsl(var(--customer-border))] bg-white shadow-sm">
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
                <form className="space-y-4" onSubmit={handleChangePassword}>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.currentPassword}
                      onChange={(event) =>
                        setPasswordForm((previous) => ({
                          ...previous,
                          currentPassword: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        setPasswordForm((previous) => ({
                          ...previous,
                          newPassword: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        setPasswordForm((previous) => ({
                          ...previous,
                          confirmPassword: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={savingPassword}
                    className="w-full bg-[hsl(var(--customer-primary))] text-white hover:bg-[hsl(var(--customer-primary-hover))] sm:w-auto"
                  >
                    {savingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-[hsl(var(--customer-border))] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="size-5" />
                  Cài đặt thông báo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--customer-border))] p-3 cursor-pointer hover:bg-[hsl(var(--customer-surface-soft)/0.35)]">
                  <input
                    type="checkbox"
                    checked={notificationForm.orderUpdates}
                    onChange={() => handleNotificationToggle("orderUpdates")}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium">Thông báo đơn hàng</p>
                    <p className="text-xs text-muted-foreground">
                      Nhận thông báo về trạng thái đơn hàng
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--customer-border))] p-3 cursor-pointer hover:bg-[hsl(var(--customer-surface-soft)/0.35)]">
                  <input
                    type="checkbox"
                    checked={notificationForm.promotions}
                    onChange={() => handleNotificationToggle("promotions")}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium">Khuyến mãi & Ưu đãi</p>
                    <p className="text-xs text-muted-foreground">
                      Nhận thông tin về các khuyến mãi mới
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--customer-border))] p-3 cursor-pointer hover:bg-[hsl(var(--customer-surface-soft)/0.35)]">
                  <input
                    type="checkbox"
                    checked={notificationForm.emailMarketing}
                    onChange={() => handleNotificationToggle("emailMarketing")}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium">Email tiếp thị</p>
                    <p className="text-xs text-muted-foreground">
                      Nhận email về các bản tin hàng tuần
                    </p>
                  </div>
                </label>

                <Button
                  onClick={handleSaveNotificationSettings}
                  disabled={savingNotifications}
                  className="bg-[hsl(var(--customer-primary))] text-white hover:bg-[hsl(var(--customer-primary-hover))]"
                >
                  {savingNotifications
                    ? "Đang lưu..."
                    : "Lưu cài đặt thông báo"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Đăng xuất</CardTitle>
                <CardDescription>Đăng xuất khỏi tài khoản này</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await api.post(
                        "/auth/logout",
                        {
                          refreshToken:
                            localStorage.getItem("customerRefreshToken") || "",
                        },
                        buildAuthConfig(),
                      );
                    } catch {
                      // Clear local session even if logout endpoint fails.
                    } finally {
                      clearCustomerSession();
                      toast.success("Đã đăng xuất");
                    }
                  }}
                >
                  Đăng xuất
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
