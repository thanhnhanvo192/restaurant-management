import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "sonner";

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
import api from "@/services/api/client";
import {
  isAdminAuthenticated,
  setAdminSession,
} from "@/services/admin-session";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedIdentifier = identifier.trim().toLowerCase();

    if (!normalizedIdentifier || !password) {
      toast.error("Vui long nhap day du email va mat khau");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post("/auth/admin/login", {
        identifier: normalizedIdentifier,
        password,
      });

      setAdminSession({
        accessToken: response.data?.accessToken,
        refreshToken: response.data?.refreshToken,
        admin: response.data?.admin,
      });

      toast.success(response.data?.message || "Dang nhap thanh cong");
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Dang nhap that bai",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Dang nhap quan tri</CardTitle>
          <CardDescription>
            Su dung tai khoan nhan vien de truy cap he thong admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Mat khau</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Dang dang nhap..." : "Dang nhap"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                disabled={isSubmitting}
              >
                Ve trang chu
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
