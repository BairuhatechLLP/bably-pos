const API: any = {
  // Blaby Westfield POS server endpoint.
  // Set this to your deployed Blaby server URL once it is live, e.g.
  //   'https://blaby-westfield-api.yourdomain.com/v1/'
  // Local development options:
  //   iOS simulator:      http://localhost:8101/v1/
  //   Android emulator:   http://10.0.2.2:8101/v1/
  //   Physical device:    http://<your-LAN-IP>:8101/v1/
  // BASE_URL: 'http://192.168.220.57:8101/v1/',
  BASE_URL: 'https://bably-pos-api.bairuhatech.com/v1/',

  STAFF_EMAIL_LOGIN:"auth/staff/email-login",
  UPDATE_PROFILE: 'ContactMaster/update/',
  UPDATE_COMPANY: 'company_master/',

  POST_USER_OPEN_SHIFT:"counter_details/add/openshift",
  POST_USER_CLOSE_SHIFT:"counter_details/add/closeshift",
  GET__USER_SHIFT_REPORT: 'StaffTransactions/shift-report',

  GET_COUNTER_LIST: 'billing_counter/list',
  GET_PRODUCT_LIST: 'ProductMaster/lists/',
  GET_CATEGOTY_LIST: 'ProductCategory/user/',
  GET_TABLE_LIST: 'dining-tables/lists/',
  SYNC_ORDERS:"pos_app/sync_order",

  GET_ORDER_LIST:"pos_app/orders",
  CREATE_ORDER:"pos_app/create_order",
  UPDATE_ORDER: 'pos_app/update_order',
  STATUS_ORDER:"pos_app/order_status",
  UPDATE_PAYMENT_METHOD:"pos_app/update_payment_method",
  STATICS_ORDER:"pos_app/order_statics",

  // Reports
  GET_CATEGORY_SALES_REPORT: 'report/categorySales',
};
export default API;
