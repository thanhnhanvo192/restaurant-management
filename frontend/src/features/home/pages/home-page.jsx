import { Link } from "react-router";
import { Button } from "@/shared/components/ui/button";

const HomePage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/20">
      <div className="w-full max-w-xl p-6 border shadow-sm rounded-xl bg-background">
        <h1 className="text-2xl font-semibold">Restaurant Management</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chon khu vuc ban muon truy cap.
        </p>
        <div className="flex gap-3 mt-6">
          <Button asChild variant="secondary">
            <Link to="/login">Đăng nhập khách hàng</Link>
          </Button>
          <Button asChild>
            <Link to="/admin/login">Dang nhap quan tri</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/customer">Khu vuc khach hang</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
