# Mongo Import Sample Data

## 1) Du lieu mau da co

- addresses.sample.json
- authsessions.sample.json
- bookings.sample.json
- users.sample.json
- staffs.sample.json
- customers.sample.json
- tables.sample.json
- categories.sample.json
- menus.sample.json
- orders.sample.json
- inventories.sample.json
- inventorymovements.sample.json

## 2) Thu tu import de tranh loi tham chieu

1. users
2. staffs
3. customers
4. tables
5. categories
6. menus
7. orders
8. addresses
9. bookings
10. inventories
11. inventorymovements
12. authsessions

## 3) Lenh import mau (PowerShell)

Thay `<DB_NAME>` thanh ten DB cua ban, vi du: `restaurant_management`.

```powershell
$DB = "<DB_NAME>"
$SEED = "./backend/seeds/mongoimport"

mongoimport --db $DB --collection users --file "$SEED/users.sample.json" --jsonArray --drop
mongoimport --db $DB --collection staffs --file "$SEED/staffs.sample.json" --jsonArray --drop
mongoimport --db $DB --collection customers --file "$SEED/customers.sample.json" --jsonArray --drop
mongoimport --db $DB --collection tables --file "$SEED/tables.sample.json" --jsonArray --drop
mongoimport --db $DB --collection categories --file "$SEED/categories.sample.json" --jsonArray --drop
mongoimport --db $DB --collection menus --file "$SEED/menus.sample.json" --jsonArray --drop
mongoimport --db $DB --collection orders --file "$SEED/orders.sample.json" --jsonArray --drop
mongoimport --db $DB --collection addresses --file "$SEED/addresses.sample.json" --jsonArray --drop
mongoimport --db $DB --collection bookings --file "$SEED/bookings.sample.json" --jsonArray --drop
mongoimport --db $DB --collection inventories --file "$SEED/inventories.sample.json" --jsonArray --drop
mongoimport --db $DB --collection inventorymovements --file "$SEED/inventorymovements.sample.json" --jsonArray --drop
mongoimport --db $DB --collection authsessions --file "$SEED/authsessions.sample.json" --jsonArray --drop
```

## 4) Tai khoan dang nhap mau

- Admin: `admin@natavu.local` / `admin123`
- Inventory manager: `inventory@natavu.local` / `admin123`
- Customer: `a.customer@example.com` / `customer123`

## 5) Ghi chu

- `inventory@natavu.local` dang dung `users.vaiTro = admin` de di qua luong `adminLogin`; phan quyen chuc nang kho duoc ap dung bang `staff.role = inventory-manager`.
- Neu da co du lieu that, khong dung `--drop`.
