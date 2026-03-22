const vi = {
  // ── Banner Slides ─────────────────────────────────────────────────────────
  banner: {
    slide1: {
      badge: 'Sản phẩm mới 2026',
      title: 'Laptop Gaming',
      highlight: 'Chinh phục mọi giới hạn',
      description: 'Hiệu năng thế hệ tiếp theo với RTX 4080, màn hình QHD 144Hz và SSD PCIe 5.0. Được tạo ra cho những nhà vô địch.',
      primaryCta: 'Mua ngay',
      secondaryCta: 'Xem cấu hình',
    },
    slide2: {
      badge: 'Dòng doanh nhân',
      title: 'Siêu mỏng nhẹ',
      highlight: 'Làm việc mọi nơi',
      description: 'Chỉ 1kg, pin lên đến 20 giờ. Người bạn đồng hành hoàn hảo cho các chuyên gia năng động.',
      primaryCta: 'Xem dòng Business',
      secondaryCta: 'So sánh',
    },
    slide3: {
      badge: 'Giá trị tốt nhất',
      title: 'Gaming RGB',
      highlight: 'Phù hợp mọi ngân sách',
      description: 'Màn hình 165Hz, đèn phím RGB từng phím và âm thanh mạnh mẽ — gaming cao cấp với mức giá hợp lý.',
      primaryCta: 'Mua ngay',
      secondaryCta: 'Tìm hiểu thêm',
    },
  },

  // ── Auth Pages ────────────────────────────────────────────────────────────
  auth: {
    login: {
      title: 'Đăng nhập tài khoản',
      subtitle: 'Theo dõi đơn hàng và mua sắm dễ dàng hơn',
      emailLabel: 'Email',
      passwordLabel: 'Mật khẩu',
      rememberMe: 'Ghi nhớ đăng nhập',
      forgotPassword: 'Quên mật khẩu?',
      submitButton: 'Đăng nhập',
      submitting: 'Đang đăng nhập...',
      noAccount: 'Chưa có tài khoản?',
      createAccount: 'Tạo tài khoản',
      continueGoogle: 'Tiếp tục với Google',
      orSignInWith: 'hoặc đăng nhập bằng Email',
    },
    register: {
      title: 'Tạo tài khoản',
      subtitle: 'Bắt đầu hành trình với hàng nghìn sản phẩm công nghệ',
      fullNameLabel: 'Họ và tên',
      emailLabel: 'Email',
      passwordLabel: 'Mật khẩu',
      confirmPasswordLabel: 'Xác nhận mật khẩu',
      phoneLabel: 'Số điện thoại',
      submitButton: 'Tạo tài khoản',
      submitting: 'Đang đăng ký...',
      hasAccount: 'Đã có tài khoản?',
      loginLink: 'Đăng nhập',
      continueGoogle: 'Tiếp tục với Google',
      orRegisterWith: 'hoặc đăng ký bằng Email',
      agreePrefix: 'Tôi đồng ý với',
      termsOfService: 'Điều khoản dịch vụ',
      and: 'và',
      privacyPolicy: 'Chính sách bảo mật',
      panelHeading: 'Tham gia cùng hàng nghìn người mua sắm.',
      panelSubtitle: 'Tạo tài khoản và khám phá những ưu đãi công nghệ tốt nhất',
      fastDelivery: 'Giao hàng nhanh',
      warranty: 'Bảo hành',
    },
    loginPanel: {
      heading: 'Biến ý tưởng thành hiện thực.',
      subtitle: 'Bắt đầu miễn phí và nhận những ưu đãi hấp dẫn từ cộng đồng',
      fastDelivery: 'Giao hàng nhanh',
      warranty: 'Bảo hành',
    },
  },

  // ── User Menu ─────────────────────────────────────────────────────────────
  userMenu: {
    viewProfile: 'Xem hồ sơ',
    logout: 'Đăng xuất',
  },

  // ── Toast notifications ───────────────────────────────────────────────────
  toast: {
    loginSuccess: 'Đăng nhập thành công',
    loginSuccessDesc: 'Chào mừng trở lại, {{name}}!',
    loginFailed: 'Đăng nhập thất bại',
    registerSuccess: 'Tạo tài khoản thành công',
    registerSuccessDesc: 'Chào mừng {{name}} đến với Tapo! 🎉',
    registerFailed: 'Đăng ký thất bại',
    logoutSuccess: 'Đã đăng xuất',
    logoutSuccessDesc: 'Bạn đã thoát khỏi tài khoản thành công.',
    validationError: 'Thông tin không hợp lệ',
    defaultError: 'Vui lòng kiểm tra lại thông tin',
  },

  // ── Common ────────────────────────────────────────────────────────────────
  common: {
    save: 'Lưu thay đổi',
    cancel: 'Hủy',
    delete: 'Xóa',
    edit: 'Chỉnh sửa',
    confirm: 'Xác nhận',
  },

  // ── Profile Page ──────────────────────────────────────────────────────────
  profile: {
    pageTitle: 'Tài khoản của tôi',
    pageSubtitle: 'Quản lý thông tin cá nhân và bảo mật tài khoản',
    tabProfile: 'Thông tin cá nhân',
    tabSecurity: 'Bảo mật',
    infoTitle: 'Thông tin cá nhân',
    securityTitle: 'Đổi mật khẩu',
    fullName: 'Họ và tên',
    email: 'Email',
    phone: 'Số điện thoại',
    currentPassword: 'Mật khẩu hiện tại',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu mới',
    saveButton: 'Lưu thay đổi',
    editButton: 'Chỉnh sửa',
    changePasswordButton: 'Đổi mật khẩu',
    updateSuccess: 'Cập nhật thành công!',
    updateFailed: 'Cập nhật thất bại',
    passwordSuccess: 'Đổi mật khẩu thành công!',
    passwordFailed: 'Đổi mật khẩu thất bại',
  },

  // ── Address Page ──────────────────────────────────────────────────────────
  address: {
    pageTitle: 'Địa chỉ nhận hàng',
    pageSubtitle: 'Quản lý các địa chỉ giao hàng của bạn',
    addButton: 'Thêm địa chỉ',
    addTitle: 'Thêm địa chỉ mới',
    editTitle: 'Chỉnh sửa địa chỉ',
    empty: 'Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ đầu tiên!',
    default: 'Mặc định',
    setDefault: 'Đặt mặc định',
    recipientName: 'Tên người nhận',
    phone: 'Số điện thoại',
    street: 'Địa chỉ cụ thể',
    district: 'Quận / Huyện',
    city: 'Tỉnh / Thành phố',
    deleteConfirm: 'Bạn có chắc muốn xóa địa chỉ này?',
    addSuccess: 'Thêm địa chỉ thành công!',
    addFailed: 'Thêm địa chỉ thất bại',
    updateSuccess: 'Cập nhật địa chỉ thành công!',
    updateFailed: 'Cập nhật địa chỉ thất bại',
    deleteSuccess: 'Đã xóa địa chỉ',
    deleteFailed: 'Xóa địa chỉ thất bại',
    defaultSuccess: 'Đã đặt làm địa chỉ mặc định',
    defaultFailed: 'Cập nhật thất bại',
  },

  // ── Admin Users Page ──────────────────────────────────────────────────────
  adminUsers: {
    pageTitle: 'Quản lý người dùng',
    total: 'người dùng',
    page: 'Trang',
    noResult: 'Không tìm thấy người dùng nào',
    searchPlaceholder: 'Tìm tên hoặc email...',
    colName: 'Họ tên',
    colEmail: 'Email',
    colRole: 'Vai trò',
    colStatus: 'Trạng thái',
    colActions: 'Thao tác',
    active: 'Hoạt động',
    locked: 'Đã khóa',
    lock: 'Khóa',
    unlock: 'Mở khóa',
    lockSuccess: 'Đã khóa tài khoản',
    lockFailed: 'Khóa tài khoản thất bại',
    unlockSuccess: 'Đã mở khóa tài khoản',
    unlockFailed: 'Mở khóa thất bại',
    filter: {
      all: 'Tất cả',
      customer: 'Khách hàng',
      sales: 'Bán hàng',
      warehouse: 'Kho',
      admin: 'Quản trị viên',
    },
  },

  // ── Admin Sidebar ──────────────────────────────────────────────────────────
  admin: {
    goToShop: 'Về trang shop',
    logout: 'Đăng xuất',
    viewProfile: 'Xem hồ sơ',
    switchLight: 'Chuyển sang sáng',
    switchDark: 'Chuyển sang tối',
    collapseSidebar: 'Thu gọn menu',
    expandSidebar: 'Mở rộng menu',
    nav: {
      management: 'Quản lý',
      dashboard: 'Tổng quan',
      users: 'Người dùng',
      orders: 'Đơn hàng',
      products: 'Sản phẩm',
    },
    dashboard: {
      morning: 'Chào buổi sáng',
      afternoon: 'Chào buổi chiều',
      evening: 'Chào buổi tối',
      welcomeDesc: 'Quản lý hệ thống TAPO — kiểm tra tình trạng và hoạt động hôm nay.',
      totalUsers: 'Tổng người dùng',
      activeUsers: 'Ang hoạt động',
      lockedUsers: 'Đã khóa',
      orders: 'Đơn hàng',
      quickAccess: 'Truy cập nhanh',
      recentActivity: 'Hoạt động gần đây',
      activity1: 'Người dùng mới đăng ký',
      activity2: 'Đơn hàng mới được tạo',
      activity3: 'Cập nhật hệ thống',
    },
  },

  error: {
    SUCCESS: 'Thành công',
    CREATED: 'Tạo mới thành công',
    UPDATED: 'Cập nhật thành công',
    DELETED: 'Xóa thành công',
    NO_CONTENT: 'Không có nội dung',
    BAD_REQUEST: 'Yêu cầu không hợp lệ',
    UNAUTHORIZED: 'Bạn chưa đăng nhập',
    FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
    NOT_FOUND: 'Không tìm thấy',
    VALIDATION_FAILED: 'Dữ liệu nhập không hợp lệ',
    CREDENTIALS_INVALID: 'Email hoặc mật khẩu không đúng',
    EMAIL_ALREADY_EXISTS: 'Email này đã được sử dụng',
    USER_NOT_FOUND: 'Không tìm thấy người dùng',
    ACCOUNT_LOCKED: 'Tài khoản của bạn đã bị khóa',
    INVALID_REFRESH_TOKEN: 'Token không hợp lệ, vui lòng đăng nhập lại',
    EXPIRED_REFRESH_TOKEN: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
    INTERNAL_SERVER_ERROR: 'Hệ thống gặp sự cố, vui lòng thử lại sau',
    UNKNOWN: 'Đã có lỗi xảy ra',
    NETWORK: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
  },

  // ── Header / Nav ──────────────────────────────────────────────────────────
  nav: {
    home: 'Trang chủ',
    shop: 'Sản phẩm',
    blog: 'Blog',
    contact: 'Liên hệ',
  },

  // ── Home Page ─────────────────────────────────────────────────────────────
  home: {
    service: {
      shipping: { title: 'Miễn phí vận chuyển', desc: 'Đơn hàng từ 1.000.000₫ trở lên' },
      support: { title: 'Hỗ trợ 24/7', desc: 'Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ' },
      returns: { title: 'Đổi trả 30 ngày', desc: 'Hoàn tiền 100% nếu không hài lòng' },
      warranty: { title: 'Bảo hành chính hãng', desc: 'Bảo hành 12–24 tháng từ nhà sản xuất' },
    },
    promo: {
      p1: { tag: 'Vừa ra mắt', title: 'Lenovo Legion S7', subtitle: 'Giá từ 29.990.000₫', cta: 'Mua ngay' },
      p2: { tag: 'Phụ kiện', title: 'Đồng hồ thông minh', subtitle: 'Giá từ 2.990.000₫', cta: 'Khám phá' },
      p3: { tag: 'Bán chạy nhất', title: 'Dell XPS 2026', subtitle: 'Hiệu năng vượt trội, thiết kế siêu mỏng', cta: 'Xem ngay' },
      p4: { tag: 'Flash Sale', title: 'Tiết kiệm đến 30%', subtitle: 'Hàng nghìn sản phẩm đang giảm giá', cta: 'Xem ưu đãi' },
    },
    featured: {
      title: 'Bộ sưu tập nổi bật',
      subtitle: 'Tuyển chọn những sản phẩm công nghệ hàng đầu',
      viewAll: 'Xem toàn bộ bộ sưu tập',
      tabs: {
        all: 'Tất cả',
        laptop: 'Laptop',
        accessories: 'Phụ kiện',
        cameras: 'Máy ảnh',
        audio: 'Âm thanh',
      },
    },
    bestSelling: {
      title: 'Bán chạy nhất',
      subtitle: 'Những sản phẩm được khách hàng tin tùng và yêu thích nhất',
      viewAll: 'Xem tất cả sản phẩm',
    },
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    tagline: 'Điểm đến lý tưởng cho laptop, máy tính gaming và phụ kiện công nghệ cao cấp với giá tốt nhất.',
    contact: {
      title: 'Liên hệ',
      address: '123 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
      phone: '1800 6789 (miễn phí)',
    },
    info: {
      title: 'Thông tin',
      links: ['Về chúng tôi', 'Chính sách bảo mật', 'Chính sách đổi trả', 'Câu hỏi thường gặp'],
    },
    quickLinks: {
      title: 'Liên kết nhanh',
      links: ['Tài khoản của tôi', 'Trạng thái đơn hàng', 'Danh sách yêu thích', 'So sánh'],
    },
    newsletter: {
      title: 'Nhận tin khuyến mãi',
      placeholder: 'Địa chỉ email của bạn...',
      button: 'Gửi',
    },
    bottom: {
      copyright: '© 2026 Tapo. Tất cả quyền được bảo lưu.',
      weAccept: 'Chúng tôi chấp nhận:',
    },
  },
} as const

export default vi
export type ViTranslation = typeof vi
