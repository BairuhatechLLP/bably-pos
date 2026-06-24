const API: any = {
  // Blaby Westfield report server. Point this at your deployed report server once live.
  //   iOS simulator:    http://localhost:8104/
  //   Android emulator: http://10.0.2.2:8104/
  //   Physical device:  http://<your-LAN-IP>:8104/
  BASE_URL: 'http://192.168.220.57:8104/',
  // BASE_URL: 'https://nfreport-api.bairuhatech.com/',

  LOGIN:"auth/staff/email-login",

  HOME_DATA:"report_app/v2/home", //GET

  REPORT_LIST:"report_app/v2/reports", //GET

  BRANCHES_PICKER:"report_app/v2/branch_picker", //GET - Returns basic info: {id, bname}
  BRANCHES_LIST:"report_app/v2/branch", //GET - Returns all branches with full details when no companyId param
  DATABASE_BRANCHES:"report_app/v2/database_branches", //GET - Returns branches with companyId, adminId
  BRANCH_DETAILD:"report_app/v2/branch_details/", //GET pass id

  PRODUCTS_LIST:"report_app/v2/products", //GET - sold products report
  PRODUCTS_CATEGORY_WISE:"report_app/v2/products/category-wise", //GET - products grouped by category with totals
  PRODUCT_DETAILD:"report_app/v2/product_details/", //GET pass id - product details report

  // Product Management Endpoints
  PRODUCT_MASTER_LIST:"product-management/products", //GET - all products master list
  PRODUCT_CREATE:"product-management/products", //POST - create product
  PRODUCT_UPDATE:"product-management/products/", //PUT pass id - update product
  PRODUCT_DELETE:"product-management/products/", //DELETE pass id - delete product
  PRODUCT_BULK_DELETE:"product-management/products/bulk-delete", //POST - soft-delete multiple products in one branch (body: { ids:number[] })
  PRODUCT_MULTI_BRANCH_CREATE:"product-management/products/multi-branch", //POST ?adminid=X - create same product in every branch
  PRODUCT_MULTI_BRANCH_UPDATE:"product-management/products/multi-branch", //PUT - update product in every branch matched by name
  PRODUCT_MULTI_BRANCH_DELETE:"product-management/products/multi-branch-delete", //POST - soft-delete product in every branch matched by name
  PRODUCT_MULTI_BRANCH_DELETE_BULK:"product-management/products/multi-branch-delete-bulk", //POST - bulk multi-branch delete in ONE round-trip (body: { names:string[] })

  // Category Management Endpoints
  CATEGORIES_LIST:"product-management/categories", //GET - all categories
  CATEGORY_CREATE:"product-management/categories", //POST - create category
  CATEGORY_UPDATE:"product-management/categories/", //PUT pass id - update category
  CATEGORY_DELETE:"product-management/categories/", //DELETE pass id - delete category
  KITCHEN_DISPLAYS:"product-management/categories/kitchen-displays", //GET - kitchen displays for branch
  CATEGORY_MULTI_BRANCH_CREATE:"product-management/categories/multi-branch", //POST - create category in every branch
  CATEGORY_MULTI_BRANCH_UPDATE:"product-management/categories/multi-branch", //PUT - update category in every branch matched by name
  CATEGORY_MULTI_BRANCH_DELETE:"product-management/categories/multi-branch-delete", //POST - soft-delete category in every branch matched by name
  CATEGORY_MULTI_BRANCH_DELETE_BULK:"product-management/categories/multi-branch-delete-bulk", //POST - bulk multi-branch delete in ONE round-trip (body: { names:string[] })
  CATEGORY_BULK_DELETE:"product-management/categories/bulk-delete", //POST - soft-delete multiple categories in one branch (body: { ids:number[] })

  // Staff Performance Endpoints
  STAFF_LIST:"report_app/v2/staff/list", //GET - get staff list by companyId
  STAFF_PERFORMANCE:"report_app/v2/staff/performance", //GET - detailed staff performance stats
  STAFF_PRODUCTS:"report_app/v2/staff/products", //GET - all products ordered by staff with details
  STAFF_DIAGNOSTIC:"report_app/v2/staff/diagnostic", //GET - staff table diagnostic

  // ========== NEW: CROSS-BRANCH STAFF PERFORMANCE ==========
  STAFF_PERFORMANCE_ALL_BRANCHES:"report_app/v2/staff/performance-all-branches", //GET - staff performance across all branches
  STAFF_MONTHLY_SUMMARY:"report_app/v2/staff/monthly-summary", //GET - consolidated monthly summary across all branches

  // ========== NEW: USER MANAGEMENT ==========
  USER_CREATE:"users/create", //POST - create user in all 7 databases
  USER_LIST:"users/list", //GET - get users by branch companyId

  // ========== Order Management (from report app) ==========
  ORDER_CREATE:"report_app/v2/orders", //POST ?branchId=X (body: full order)
  ORDER_UPDATE:"report_app/v2/orders/", //PUT pass id, ?branchId=X
  ORDER_LIST:"report_app/v2/orders", //GET ?branchId=X&days=3 (last N days)
  ORDER_GET:"report_app/v2/orders/", //GET pass id, ?branchId=X
  ORDER_CANCEL:"report_app/v2/orders/", //POST pass id then /cancel suffix, ?branchId=X

};

// Kitchen display URLs per branch (keyed by branch companyId).
// Add a row per branch as you configure their kitchen display web app.
// Used by src/screens/kitchenDisplays/index.tsx to open the live display in the
// device's default browser via Linking.openURL.
export const KITCHEN_URLS: Record<number, string> = {
  158: 'https://nfpmna.bairuhatech.com', // Perinthalmanna
  159: 'https://nfpulamanthole.bairuhatech.com' ,  // Perinthalmanna
 160: 'https://nfkoppam.bairuhatech.com/',        // Koppam
   180: 'https://nf55.bairuhatech.com/',      // 55 Branch
 179: 'https://nfekm.bairuhatech.com/',     // Ernakulam
};

// Kitchen display login credentials per branch (keyed by branch companyId).
// SECURITY NOTE: these are hardcoded in the app bundle. Anyone with the APK
// can extract them. Use a dedicated "kitchen display viewer" account with
// the narrowest possible permissions — NEVER an admin password.
// Plan: replace this with a backend-issued one-time token when time permits.
export const KITCHEN_CREDENTIALS: Record<
  number,
  {email: string; password: string}
> = {
  158: {email: 'manager@nalkath.com', password: 'manager@2022'}, // Perinthalmanna
   159: {email: 'pulamanthol@nalakath.com', password: 'nalakath@0303'},  // Pulamanthole
  160: {email: 'managerkoppam@nalakath.com', password: 'nalakath@0505'},  // Koppam
  180: {email: 'manager55@nalakath.com', password: 'nalakath@0808'},  // 55 Branch
  179: {email: 'managerekk@nalakath.com', password: 'nalakath@1011'},  // Ernakulam
};

export default API;


