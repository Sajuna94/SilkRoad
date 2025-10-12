"""
Test Package: 
如果你想實際測試
你需要在app.py取消註解測試項的blueprint註冊
並且在terminal呼叫
eg. 
    curl -X POST http://localhost:5000/api/test/add \                                                                                              ✔ 
    -H "Content-Type: application/json" \
    -d '{"data1": "some string", "data2": "another string"}'

    curl http://localhost:5000/api/test/list
etc.
"""

from .API_test import test_routes