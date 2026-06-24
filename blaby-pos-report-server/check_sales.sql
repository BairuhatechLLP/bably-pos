-- Check what's in order_master.total for today
SELECT 
  id,
  total,
  createdAt,
  orderStatus,
  companyId
FROM order_master 
WHERE DATE(createdAt) = CURDATE()
  AND orderStatus != 'cancelled'
LIMIT 10;

-- Check if order_master.total matches sum of order_items
SELECT 
  om.id as order_id,
  om.total as order_master_total,
  SUM(oi.sp_price * oi.quantity) as calculated_from_items,
  (om.total - SUM(oi.sp_price * oi.quantity)) as difference
FROM order_master om
LEFT JOIN order_items oi ON om.id = oi.orderId
WHERE DATE(om.createdAt) = CURDATE()
  AND om.orderStatus != 'cancelled'
GROUP BY om.id
HAVING ABS(difference) > 0.01
LIMIT 10;
