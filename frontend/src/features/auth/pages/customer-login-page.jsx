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
  getCustomerAccessToken,
  setCustomerSession,
} from "@/services/customer-session";

export default function CustomerLoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (getCustomerAccessToken()) {
    return <Navigate to="/customer" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedIdentifier = identifier.trim().toLowerCase();

    if (!normalizedIdentifier || !password) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post("/auth/login", {
        identifier: normalizedIdentifier,
        password,
      });

      setCustomerSession({
        accessToken: response.data?.accessToken,
        refreshToken: response.data?.refreshToken,
        customer: response.data?.customer,
      });

      toast.success(response.data?.message || "Đăng nhập thành công");
      navigate("/customer", { replace: true });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Đăng nhập thất bại",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fffaf5] p-4">
      <Card className="w-full max-w-md border-orange-100 shadow-lg shadow-orange-100/40">
        <CardHeader>
          <CardTitle>Đăng nhập khách hàng</CardTitle>
          <CardDescription>
            Sử dụng email đã đăng ký để tiếp tục.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="customer-identifier">Email</Label>
              <Input
                id="customer-identifier"
                type="email"
                autoComplete="username"
                placeholder="email@example.com"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-password">Mật khẩu</Label>
              <Input
                id="customer-password"
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
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                disabled={isSubmitting}
              >
                Về trang chủ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
