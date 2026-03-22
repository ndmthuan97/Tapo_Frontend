const en = {
  // ── Banner Slides ─────────────────────────────────────────────────────────
  banner: {
    slide1: {
      badge: 'New Arrival 2026',
      title: 'Gaming Laptop',
      highlight: 'Built to Dominate',
      description: 'Next-gen performance with RTX 4080, 144Hz QHD display, and PCIe 5.0 SSD. Engineered for champions.',
      primaryCta: 'Shop Gaming',
      secondaryCta: 'View Specs',
    },
    slide2: {
      badge: 'Business Series',
      title: 'Ultra-Thin',
      highlight: 'Work Anywhere',
      description: 'Feather-light at just 1kg, all-day battery up to 20 hours. The perfect companion for professionals on the move.',
      primaryCta: 'Shop Business',
      secondaryCta: 'Compare',
    },
    slide3: {
      badge: 'Best Value',
      title: 'RGB Gaming',
      highlight: 'At Every Budget',
      description: 'Stunning 165Hz display, RGB per-key backlight, and thunderous audio — premium gaming without the premium price.',
      primaryCta: 'Shop Now',
      secondaryCta: 'Learn More',
    },
  },

  // ── Auth Pages ────────────────────────────────────────────────────────────
  auth: {
    login: {
      title: 'Login to your Account',
      subtitle: 'See what is going on with your shopping',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      rememberMe: 'Remember Me',
      forgotPassword: 'Forgot Password?',
      submitButton: 'Login',
      submitting: 'Signing in...',
      noAccount: 'Not Registered Yet?',
      createAccount: 'Create an account',
      continueGoogle: 'Continue with Google',
      orSignInWith: 'or Sign in with Email',
    },
    register: {
      title: 'Create an Account',
      subtitle: 'Start your journey with thousands of tech products',
      fullNameLabel: 'Full Name',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm Password',
      phoneLabel: 'Phone Number',
      submitButton: 'Create Account',
      submitting: 'Creating account...',
      hasAccount: 'Already have an account?',
      loginLink: 'Login',
      continueGoogle: 'Continue with Google',
      orRegisterWith: 'or Register with Email',
      agreePrefix: 'I agree to the',
      termsOfService: 'Terms of Service',
      and: 'and',
      privacyPolicy: 'Privacy Policy',
      panelHeading: 'Join thousands of shoppers.',
      panelSubtitle: 'Create your account and start exploring the best tech deals',
      fastDelivery: 'Fast Delivery',
      warranty: 'Warranty',
    },
    loginPanel: {
      heading: 'Turn your ideas into reality.',
      subtitle: 'Start for free and get attractive offers from the community',
      fastDelivery: 'Fast Delivery',
      warranty: 'Warranty',
    },
  },

  // ── User Menu ─────────────────────────────────────────────────────────────
  userMenu: {
    viewProfile: 'View Profile',
    logout: 'Logout',
  },

  // ── Toast notifications ───────────────────────────────────────────────────
  toast: {
    loginSuccess: 'Login successful',
    loginSuccessDesc: 'Welcome back, {{name}}!',
    loginFailed: 'Login failed',
    registerSuccess: 'Account created successfully',
    registerSuccessDesc: 'Welcome to Tapo, {{name}}! 🎉',
    registerFailed: 'Registration failed',
    logoutSuccess: 'Logged out',
    logoutSuccessDesc: 'You have been logged out successfully.',
    validationError: 'Invalid information',
    defaultError: 'Please check your information and try again',
  },

  // ── API Error codes ───────────────────────────────────────────────────────
  error: {
    SUCCESS: 'Success',
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    NO_CONTENT: 'No content',
    BAD_REQUEST: 'Bad request',
    UNAUTHORIZED: 'You are not logged in',
    FORBIDDEN: 'You do not have permission to perform this action',
    NOT_FOUND: 'Not found',
    VALIDATION_FAILED: 'Validation failed',
    CREDENTIALS_INVALID: 'Incorrect email or password',
    EMAIL_ALREADY_EXISTS: 'This email is already in use',
    USER_NOT_FOUND: 'User not found',
    ACCOUNT_LOCKED: 'Your account has been locked',
    INVALID_REFRESH_TOKEN: 'Invalid token, please login again',
    EXPIRED_REFRESH_TOKEN: 'Session expired, please login again',
    INTERNAL_SERVER_ERROR: 'Server error, please try again later',
    UNKNOWN: 'An error occurred',
    NETWORK: 'Cannot connect to server. Please check your connection.',
  },

  // ── Header / Nav ──────────────────────────────────────────────────────────
  nav: {
    home: 'Home',
    shop: 'Shop',
    blog: 'Blog',
    contact: 'Contact',
  },

  // ── Home Page ─────────────────────────────────────────────────────────────
  home: {
    service: {
      shipping: { title: 'Free Shipping',       desc: 'On orders over 1,000,000₫' },
      support:  { title: '24/7 Support',         desc: 'Our team is always ready to help' },
      returns:  { title: '30-Day Returns',       desc: 'Full refund if not satisfied' },
      warranty: { title: 'Official Warranty',    desc: '12–24 month manufacturer warranty' },
    },
    promo: {
      p1: { tag: 'Just Launched',  title: 'Lenovo Legion S7',    subtitle: 'Starting from 29,990,000₫',                       cta: 'Buy Now'    },
      p2: { tag: 'Accessories',    title: 'New Smart Watch',     subtitle: 'Starting from 2,990,000₫',                        cta: 'Explore'    },
      p3: { tag: 'Best Seller',    title: 'Dell XPS 2026',       subtitle: 'Outstanding performance, ultra-thin design',      cta: 'View Now'   },
      p4: { tag: 'Flash Sale',     title: 'Save up to 30%',      subtitle: 'Thousands of products on sale',                   cta: 'View Deals' },
    },
    featured: {
      title:    'Featured Collection',
      subtitle: 'A curated selection of top-tier tech products',
      viewAll:  'View full collection',
      tabs: {
        all:         'All',
        laptop:      'Laptop',
        accessories: 'Accessories',
        cameras:     'Cameras',
        audio:       'Audio',
      },
    },
    bestSelling: {
      title:    'Best Selling',
      subtitle: 'Products our customers trust and love the most',
      viewAll:  'View all products',
    },
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    tagline: 'Your go-to destination for laptops, gaming rigs, and premium tech accessories at unbeatable prices.',
    contact: {
      title:   'Contact',
      address: '123 Le Loi St, District 1, Ho Chi Minh City',
      phone:   '1800 6789 (toll-free)',
    },
    info: {
      title: 'Information',
      links: ['About Us', 'Privacy Policy', 'Return Policy', 'FAQs'],
    },
    quickLinks: {
      title: 'Quick Links',
      links: ['My Account', 'Order Status', 'Wishlist', 'Compare'],
    },
    newsletter: {
      title:       'Stay in the loop',
      placeholder: 'Your email address...',
      button:      'Send',
    },
    bottom: {
      copyright: '© 2026 Tapo. All rights reserved.',
      weAccept:  'We accept:',
    },
  },
} as const

export default en
