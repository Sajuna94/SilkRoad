UPDATE auth.customers c
JOIN (
    SELECT
        o.user_id,
        SUM(CASE WHEN o.is_completed = true THEN 1 ELSE 0 END) AS completed_order_count
    FROM `order`.orders o
    GROUP BY o.user_id
) t ON t.user_id = c.user_id
SET c.membership_level =
    CASE
        WHEN t.completed_order_count >= 100 THEN 4
        WHEN t.completed_order_count >= 50  THEN 3
        WHEN t.completed_order_count >= 20  THEN 2
        WHEN t.completed_order_count >= 10  THEN 1
        ELSE 0
    END;
CREATE VIEW v_會員 AS
SELECT
    u.id AS user_id,
    u.name AS 名字,
    COUNT(o.id) AS 訂單總數,
    SUM(CASE WHEN o.is_completed = true THEN 1 ELSE 0 END) AS 完成訂單,
    c.stored_balance AS 存款,
    c.membership_level AS 會員等級
FROM auth.users u
JOIN auth.customers c ON c.user_id = u.id
LEFT JOIN `order`.orders o ON o.user_id = u.id
GROUP BY u.id, u.name, c.stored_balance, c.membership_level;