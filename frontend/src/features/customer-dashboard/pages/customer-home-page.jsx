import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import api from "@/services/api/client";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  History,
  MapPin,
  Phone,
  Sparkles,
  Star,
  UtensilsCrossed,
  UserCircle2,
} from "lucide-react";

const FEATURED_DISHES = [
  {
    name: "Cơm tấm sườn non",
    price: 65000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Phở bò Hà Nội",
    price: 55000,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Gà nướng mật ong",
    price: 79000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bánh flan caramel",
    price: 35000,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  },
];

const QUICK_ACTIONS = [
  {
    title: "Đặt bàn",
    desc: "Chọn bàn phù hợp trong vài giây",
    to: "/customer/book-table",
    icon: CalendarDays,
  },
  {
    title: "Xem thực đơn",
    desc: "Khám phá món hot hôm nay",
    to: "/customer/menu",
    icon: UtensilsCrossed,
  },
  {
    title: "Lịch sử đơn hàng",
    desc: "Xem lại đơn đã đặt gần đây",
    to: "/customer/orders",
    icon: History,
  },
];

const CONTACT_INFO = [
  {
    icon: MapPin,
    title: "Địa chỉ",
    value: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
  },
  {
    icon: Clock3,
    title: "Giờ mở cửa",
    value: "11:00 - 22:00 mỗi ngày",
  },
  {
    icon: Phone,
    title: "Số điện thoại",
    value: "1900 1234",
  },
];

const BRAND_HIGHLIGHTS = [
  {
    title: "Đặt bàn nhanh",
    desc: "Giữ chỗ theo khung giờ bạn chọn chỉ trong vài bước.",
    icon: CalendarDays,
  },
  {
    title: "Thực đơn nổi bật",
    desc: "Gợi ý món hot, món theo mùa và combo bán chạy mỗi ngày.",
    icon: UtensilsCrossed,
  },
  {
    title: "Phục vụ chuyên nghiệp",
    desc: "Trải nghiệm đặt món, theo dõi đơn và hỗ trợ khách hàng xuyên suốt.",
    icon: UserCircle2,
  },
];

function formatVnd(price) {
  return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1 text-[hsl(var(--customer-primary))]">
      <Star className="w-4 h-4 fill-current" />
      <span className="text-sm font-medium text-foreground">{rating}</span>
    </div>
  );
}

export default function CustomerHome() {
  const [featuredDishes, setFeaturedDishes] = useState(FEATURED_DISHES);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const response = await api.get("/client/menus");
        const menus = response.data?.menus || [];
        if (menus.length > 0) {
          setFeaturedDishes(
            menus.slice(0, 4).map((menu) => ({
              name: menu.name,
              price: menu.price,
              rating: menu.soldCount
                ? Math.min(5, 4 + Math.min(menu.soldCount / 100, 1))
                : 4.5,
              image: menu.imageUrl || menu.image || FEATURED_DISHES[0].image,
            })),
          );
        }
      } catch {
        // Keep fallback content if backend is unavailable.
      }
    };

    loadMenus();
  }, []);

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Announcement strip */}
      <section className="rounded-3xl border border-[hsl(var(--customer-border))] bg-white px-4 py-3 shadow-sm md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--customer-primary))] text-white shadow-lg shadow-[hsl(var(--customer-primary)/0.18)]">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                NATAVU Restaurant
              </p>
              <p className="text-xs text-muted-foreground">
                Trải nghiệm đặt bàn, gọi món và theo dõi đơn hàng theo phong
                cách storefront hiện đại.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-[hsl(var(--customer-surface-soft))] text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))]">
              Palette #10302C / #D69C52
            </Badge>
            <Badge className="bg-white text-[hsl(var(--customer-primary))] border border-[hsl(var(--customer-border))] hover:bg-white">
              Giao diện responsive
            </Badge>
          </div>
        </div>
      </section>

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-4xl border border-[hsl(var(--customer-border))] bg-linear-to-br from-[hsl(var(--customer-primary))] via-[hsl(var(--customer-primary-hover))] to-[hsl(var(--customer-bg))] text-white shadow-[0_24px_70px_hsl(var(--customer-primary)/0.26)]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
            alt="Không gian nhà hàng ABC"
            className="object-cover w-full h-full opacity-25"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[hsl(var(--customer-primary-hover))/0.92] via-[hsl(var(--customer-primary))/0.8] to-[hsl(var(--customer-bg))/0.76]" />
          <div className="absolute w-40 h-40 rounded-full -left-16 top-10 bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 rounded-full -right-8 h-52 w-52 bg-white/10 blur-3xl" />
        </div>

        <div className="relative grid gap-8 px-6 py-10 md:px-10 md:py-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge className="text-white w-fit border-white/20 bg-white/15 hover:bg-white/20">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Không gian ẩm thực hiện đại, sạch và chuyên nghiệp
            </Badge>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                Chào mừng bạn đến với Nhà hàng NATAVU
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/90 md:text-lg">
                Món ngon - Dịch vụ chuyên nghiệp - Trải nghiệm đặt món nhanh
                chóng
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-full bg-white px-6 text-base font-semibold text-[hsl(var(--customer-text-accent))] shadow-lg shadow-[hsl(var(--customer-primary)/0.15)] hover:bg-[hsl(var(--customer-surface-soft))]"
              >
                <Link to="/customer/book-table">
                  Đặt bàn ngay
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-12 px-6 text-base font-semibold text-white rounded-full border-white/40 bg-white/10 backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <Link to="/customer/menu">Xem thực đơn</Link>
              </Button>
            </div>
          </div>

          <Card className="text-white border-white/20 bg-white/15 backdrop-blur-xl">
            <CardContent className="p-5 space-y-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Hôm nay có gì ngon?</p>
                  <p className="text-2xl font-bold">Set trưa đặc biệt</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 text-center rounded-2xl bg-white/10">
                  <div className="text-lg font-bold">20%</div>
                  <div className="text-white/80">giảm suất set</div>
                </div>
                <div className="p-3 text-center rounded-2xl bg-white/10">
                  <div className="text-lg font-bold">15'</div>
                  <div className="text-white/80">phục vụ nhanh</div>
                </div>
                <div className="p-3 text-center rounded-2xl bg-white/10">
                  <div className="text-lg font-bold">4.9</div>
                  <div className="text-white/80">điểm đánh giá</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Brand highlights */}
      <section className="grid gap-4 lg:grid-cols-3">
        {BRAND_HIGHLIGHTS.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="group border-[hsl(var(--customer-border))] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[hsl(var(--customer-primary)/0.14)]"
            >
              <CardContent className="flex items-start gap-4 p-5">
                <div className="rounded-2xl bg-[hsl(var(--customer-surface-soft))] p-3 text-[hsl(var(--customer-primary))] transition-colors group-hover:bg-[hsl(var(--customer-primary))] group-hover:text-white">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Thông tin nhà hàng */}
      <section className="grid gap-4 md:grid-cols-3">
        {CONTACT_INFO.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="group border-[hsl(var(--customer-border))] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[hsl(var(--customer-primary)/0.14)]"
            >
              <CardContent className="flex items-start gap-4 p-5">
                <div className="rounded-2xl bg-[hsl(var(--customer-surface-soft))] p-3 text-[hsl(var(--customer-primary))] transition-colors group-hover:bg-[hsl(var(--customer-primary))] group-hover:text-white">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </p>
                  <p className="text-sm font-semibold leading-6 text-foreground">
                    {item.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Món bán chạy hôm nay */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Món bán chạy hôm nay 🔥
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Những món được khách yêu thích nhất trong ngày.
            </p>
          </div>

          <Button
            asChild
            variant="ghost"
            className="hidden text-[hsl(var(--customer-text-accent))] hover:bg-[hsl(var(--customer-surface-soft))] hover:text-[hsl(var(--customer-primary-hover))] md:inline-flex"
          >
            <Link to="/customer/menu">
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featuredDishes.map((dish) => (
            <Card
              key={dish.name}
              className="group overflow-hidden border-[hsl(var(--customer-border))] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[hsl(var(--customer-primary)/0.14)]"
            >
              <div className="relative overflow-hidden h-36 md:h-44">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/0 to-black/0" />
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold line-clamp-1 text-foreground md:text-base">
                    {dish.name}
                  </h3>
                  <p className="text-base font-bold text-[hsl(var(--customer-text-accent))] md:text-lg">
                    {formatVnd(dish.price)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <StarRating rating={dish.rating} />
                  <Button
                    size="sm"
                    className="h-8 rounded-full bg-[hsl(var(--customer-primary))] px-3 text-xs text-white hover:bg-[hsl(var(--customer-primary-hover))]"
                  >
                    Thêm vào giỏ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Nút hành động nhanh */}
      <section className="grid gap-4 md:grid-cols-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;

          return (
            <Card
              key={action.title}
              className="group border-[hsl(var(--customer-border))] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[hsl(var(--customer-primary)/0.14)]"
            >
              <CardContent className="p-5">
                <Link to={action.to} className="block">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--customer-surface-soft))] text-[hsl(var(--customer-primary))] transition-colors group-hover:bg-[hsl(var(--customer-primary))] group-hover:text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">
                        {action.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {action.desc}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 transition-transform text-sky-400 group-hover:translate-x-1" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* About */}
      <section></section>
    </div>
  );
}
