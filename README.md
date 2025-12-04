miniapp-restaurant-booking/
│
├── 📂 src/                     # Mã nguồn backend (ExpressJS)
│   ├── app.js                  # File khởi động app Express
│   ├── routes/                 # Định nghĩa route (REST API)
│   │   ├── customer.routes.js
│   │   ├── restaurant.routes.js
│   │   └── booking.routes.js
│   ├── controllers/            # Xử lý request, gọi service
│   │   ├── customer.controller.js
│   │   ├── restaurant.controller.js
│   │   └── booking.controller.js
│   ├── services/               # Logic nghiệp vụ
│   │   ├── customer.service.js
│   │   ├── restaurant.service.js
│   │   └── booking.service.js
│   ├── models/                 # Kết nối DB (ORM hoặc query thô)
│   │   ├── db.js               # Kết nối MySQL
│   │   ├── customer.model.js
│   │   ├── restaurant.model.js
│   │   └── booking.model.js
│   ├── middlewares/            # Middleware (auth, validate, log)
│   └── utils/                  # Helper, format, common functions
│
├── 📂 public/                   # Frontend tĩnh (SPA với jQuery/AJAX)
│   ├── index.html              # Entry point (SPA)
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js              # Router client (hash routing)
│   │   ├── api.js              # AJAX call tới backend API
│   │   ├── templates.js        # Handlebars compile & render
│   │   └── views/              # JS xử lý từng "page"
│   │       ├── home.js
│   │       ├── search.js
│   │       └── booking.js
│   ├── templates/              # Client-side Handlebars templates
│   │   ├── restaurant-list.hbs
│   │   ├── booking-form.hbs
│   │   └── booking-success.hbs
│   └── assets/                 # Ảnh, icon, font
│
├── 📂 views/                    # Server-side Handlebars (chỉ dùng cho admin UI)
│   ├── layouts/
│   │   └── main.hbs
│   ├── admin/
│   │   ├── dashboard.hbs
│   │   └── login.hbs
│   └── partials/
│       └── navbar.hbs
│
├── 📂 db/
│   ├── schema.sql              # Tạo bảng (restaurants, customers, bookings,…)
│   └── seed.sql                # Dữ liệu mẫu
│
├── 📂 tests/
│   ├── unit/                   # Unit test với Jest
│   │   ├── booking.service.test.js
│   │   └── restaurant.service.test.js
│   ├── integration/            # Integration test với Supertest
│   │   └── booking.api.test.js
│   └── e2e/                    # End-to-end test với Selenium
│       └── login.e2e.test.js
│
├── 📂 docs/                     # Tài liệu UML, ERD, báo cáo
│   ├── usecase-diagram.png
│   ├── erd.png
│   ├── sequence-diagram.png
│   └── final-report.md
│
├── .env.example                # Mẫu config môi trường
├── package.json
├── README.md
└── server.js                   # File chạy chính (import app.js)
