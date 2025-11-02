## db.Column(type, [options])
|  參數   | 功能  |
|  ----  | ----  |
| type  | 欄位型態（db.Integer, db.String(50), db.DateTime 等） |
| primary_key=True  | 設為主鍵 |
| unique=True | 唯一值 |
| nullable=False	               | 不允許 NULL|
| default=value	                | 預設值|
| db.ForeignKey('table.column') | 外鍵參照|
| index=True	                   | 建立索引|
| autoincrement=True	           | 自動遞增（通常主鍵會自動啟用）|


## db.type
| 型別                          | 說明           | 常用參數                 | 對應 SQL                   |
| --------------------------- | ------------ | -------------------- | ------------------------ |
| `db.Integer`                | 整數           | —                    | `INTEGER`                |
| `db.SmallInteger`           | 小範圍整數        | —                    | `SMALLINT`               |
| `db.BigInteger`             | 大範圍整數        | —                    | `BIGINT`                 |
| `db.Float`                  | 浮點數          | —                    | `FLOAT`                  |
| `db.Numeric` / `db.DECIMAL` | 精確小數         | `precision`, `scale` | `NUMERIC(10,2)`          |
| `db.String(length)`         | 可變長度字串       | `length`（上限）         | `VARCHAR(n)`             |
| `db.Text`                   | 大量文字         | —                    | `TEXT`                   |
| `db.Boolean`                | 布林值          | —                    | `BOOLEAN`                |
| `db.Date`                   | 日期           | —                    | `DATE`                   |
| `db.Time`                   | 時間           | —                    | `TIME`                   |
| `db.DateTime`               | 日期+時間        | —                    | `DATETIME` / `TIMESTAMP` |
| `db.Interval`               | 時間區間         | —                    | `INTERVAL`               |
| `db.LargeBinary(length)`    | 二進位資料（圖片、檔案） | —                    | `BLOB` / `BYTEA`         |
