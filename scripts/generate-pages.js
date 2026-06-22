const fs = require('fs');
const path = require('path');

const appBase = path.join(__dirname, '..', 'src', 'app');

const pages = [
  ['(store)/page.tsx', 'StoreRootPage', 'Redirect to default locale'],
  ['(store)/layout.tsx', 'StoreGroupLayout', 'Store route group layout'],
  ['(store)/[locale]/layout.tsx', 'StoreLocaleLayout', 'Store locale layout'],
  ['(store)/[locale]/page.tsx', 'HomePage', 'Homepage'],
  ['(store)/[locale]/category/[slug]/page.tsx', 'CategoryPage', 'Category listing'],
  ['(store)/[locale]/brand/[slug]/page.tsx', 'BrandPage', 'Brand listing'],
  ['(store)/[locale]/products/[slug]/page.tsx', 'ProductPage', 'Product detail'],
  ['(store)/[locale]/search/page.tsx', 'SearchPage', 'Search results'],
  ['(store)/[locale]/deals/page.tsx', 'DealsPage', 'Deals listing'],
  ['(store)/[locale]/preorders/page.tsx', 'PreordersPage', 'Preorders listing'],
  ['(store)/[locale]/coming-soon/page.tsx', 'ComingSoonPage', 'Coming soon listing'],
  ['(store)/[locale]/best-sellers/page.tsx', 'BestSellersPage', 'Best sellers listing'],
  ['(store)/[locale]/new-arrivals/page.tsx', 'NewArrivalsPage', 'New arrivals listing'],
  ['(store)/[locale]/cart/page.tsx', 'CartPage', 'Shopping cart'],
  ['(store)/[locale]/checkout/page.tsx', 'CheckoutPage', 'Checkout flow'],
  ['(store)/[locale]/order-success/page.tsx', 'OrderSuccessPage', 'Order confirmation'],
  ['(store)/[locale]/track-order/page.tsx', 'TrackOrderPage', 'Track order'],
  ['(store)/[locale]/blog/[slug]/page.tsx', 'BlogPostPage', 'Blog post detail'],
  ['(store)/[locale]/store-locator/page.tsx', 'StoreLocatorPage', 'Store locator'],
  ['(store)/[locale]/about/page.tsx', 'AboutPage', 'About us'],
  ['(store)/[locale]/contact/page.tsx', 'ContactPage', 'Contact us'],
  ['(store)/[locale]/faq/page.tsx', 'FaqPage', 'FAQ'],
  ['(store)/[locale]/terms/page.tsx', 'TermsPage', 'Terms and conditions'],
  ['(store)/[locale]/privacy/page.tsx', 'PrivacyPage', 'Privacy policy'],
  ['(auth)/layout.tsx', 'AuthLayout', 'Auth layout'],
  ['(auth)/login/page.tsx', 'LoginPage', 'Login'],
  ['(auth)/register/page.tsx', 'RegisterPage', 'Register'],
  ['(auth)/forgot-password/page.tsx', 'ForgotPasswordPage', 'Forgot password'],
  ['(customer)/layout.tsx', 'CustomerLayout', 'Customer dashboard layout'],
  ['(customer)/dashboard/page.tsx', 'CustomerDashboardPage', 'Customer dashboard'],
  ['(customer)/orders/page.tsx', 'CustomerOrdersPage', 'Customer orders'],
  ['(customer)/wishlist/page.tsx', 'CustomerWishlistPage', 'Customer wishlist'],
  ['(customer)/compare/page.tsx', 'CustomerComparePage', 'Customer compare'],
  ['(customer)/addresses/page.tsx', 'CustomerAddressesPage', 'Customer addresses'],
  ['(customer)/notifications/page.tsx', 'CustomerNotificationsPage', 'Customer notifications'],
  ['(customer)/loyalty/page.tsx', 'CustomerLoyaltyPage', 'Customer loyalty'],
  ['(customer)/store-credit/page.tsx', 'CustomerStoreCreditPage', 'Customer store credit'],
  ['admin/layout.tsx', 'AdminLayout', 'Admin panel layout'],
  ['admin/page.tsx', 'AdminDashboardPage', 'Admin dashboard'],
  ['admin/orders/page.tsx', 'AdminOrdersPage', 'Admin orders'],
  ['admin/customers/page.tsx', 'AdminCustomersPage', 'Admin customers'],
  ['admin/products/page.tsx', 'AdminProductsPage', 'Admin products'],
  ['admin/categories/page.tsx', 'AdminCategoriesPage', 'Admin categories'],
  ['admin/brands/page.tsx', 'AdminBrandsPage', 'Admin brands'],
  ['admin/attributes/page.tsx', 'AdminAttributesPage', 'Admin attributes'],
  ['admin/inventory/page.tsx', 'AdminInventoryPage', 'Admin inventory'],
  ['admin/warehouses/page.tsx', 'AdminWarehousesPage', 'Admin warehouses'],
  ['admin/suppliers/page.tsx', 'AdminSuppliersPage', 'Admin suppliers'],
  ['admin/purchase-orders/page.tsx', 'AdminPurchaseOrdersPage', 'Admin purchase orders'],
  ['admin/marketing/coupons/page.tsx', 'AdminCouponsPage', 'Admin coupons'],
  ['admin/marketing/flash-sales/page.tsx', 'AdminFlashSalesPage', 'Admin flash sales'],
  ['admin/marketing/loyalty/page.tsx', 'AdminLoyaltyPage', 'Admin loyalty'],
  ['admin/marketing/gift-cards/page.tsx', 'AdminGiftCardsPage', 'Admin gift cards'],
  ['admin/blog/page.tsx', 'AdminBlogPage', 'Admin blog'],
  ['admin/cms-pages/page.tsx', 'AdminCmsPagesPage', 'Admin CMS pages'],
  ['admin/reviews/page.tsx', 'AdminReviewsPage', 'Admin reviews'],
  ['admin/support/page.tsx', 'AdminSupportPage', 'Admin support'],
  ['admin/returns/page.tsx', 'AdminReturnsPage', 'Admin returns'],
  ['admin/finance/page.tsx', 'AdminFinancePage', 'Admin finance'],
  ['admin/reports/page.tsx', 'AdminReportsPage', 'Admin reports'],
  ['admin/analytics/page.tsx', 'AdminAnalyticsPage', 'Admin analytics'],
  ['admin/users/page.tsx', 'AdminUsersPage', 'Admin users'],
  ['admin/roles/page.tsx', 'AdminRolesPage', 'Admin roles'],
  ['admin/notifications/page.tsx', 'AdminNotificationsPage', 'Admin notifications'],
  ['admin/settings/page.tsx', 'AdminSettingsPage', 'Admin settings'],
];

function layoutContent(name, title) {
  return `export default function ${name}({\n  children,\n}: {\n  children: React.ReactNode;\n}) {\n  return (\n    <div data-layout="${title.toLowerCase().replace(/\\s+/g, '-')}">\n      {children}\n    </div>\n  );\n}\n`;
}

function pageContent(name, title) {
  return `export default function ${name}() {\n  return (\n    <main className="container mx-auto px-4 py-8">\n      <h1 className="text-2xl font-bold">${title}</h1>\n      <p className="mt-2 text-muted-foreground">Phase 1 scaffold — content coming in later phases.</p>\n    </main>\n  );\n}\n`;
}

function storeRootPage() {
  return `import { redirect } from 'next/navigation';\n\nexport default function StoreRootPage() {\n  redirect('/en');\n}\n`;
}

for (const [filePath, componentName, title] of pages) {
  const fullPath = path.join(appBase, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  let content;
  if (filePath === '(store)/page.tsx') {
    content = storeRootPage();
  } else if (filePath.endsWith('layout.tsx')) {
    content = layoutContent(componentName, title);
  } else {
    content = pageContent(componentName, title);
  }

  fs.writeFileSync(fullPath, content);
}

console.log('Frontend pages generated');
