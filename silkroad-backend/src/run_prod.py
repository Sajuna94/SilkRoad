import os
from app import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render 提供的 PORT
    app.run(host="0.0.0.0", port=port, debug=False)  # 對外開放，關閉 debug
