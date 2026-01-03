export default {
  async fetch(request, env, ctx) {
    const db = env.DB;
    async function getRandomData() {
      try {
        // 关键修正：数字开头表名加反引号`
        const res = await db.prepare("SELECT * FROM `163yx` ORDER BY RANDOM() LIMIT 1").run();
        return res.results[0] || {msg: "表中暂无数据"};
      } catch (err) {
        return {error: "数据库读取失败：" + err.message};
      }
    }
    if (request.url.includes("?getRandom")) {
      const data = await getRandomData();
      return new Response(JSON.stringify(data), {
        headers: {"Content-Type": "application/json;charset=utf-8", "Access-Control-Allow-Origin": "*"}
      });
    }
    const initData = await getRandomData();
    return new Response(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>随机抽取数据</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f5f7fa;padding:20px;}
    .container{background:#fff;padding:40px 30px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-width:500px;width:100%;text-align:center;}
    h2{color:#2c3e50;margin-bottom:30px;font-size:24px;}
    .result{padding:25px;background:#f8f9fa;border-radius:8px;margin:20px 0;font-size:18px;color:#333;min-height:80px;display:flex;align-items:center;justify-content:center;word-break:break-all;}
    button{padding:12px 36px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer;transition:all 0.3s;}
    button:hover{background:#1d4ed8;transform:translateY(-2px);}
    button:active{transform:translateY(0);}
    .error{color:#ef4444;}
  </style>
</head>
<body>
  <div class="container">
    <h2>163yx表随机抽取</h2>
    <div class="result" id="result">${JSON.stringify(initData, null, 2)}</div>
    <button onclick="refreshData()">点击刷新随机内容</button>
  </div>
  <script>
    async function refreshData() {
      const resultDom = document.getElementById('result');
      resultDom.innerHTML = "加载中...";
      try {
        const res = await fetch(window.location.href + "?getRandom");
        const data = await res.json();
        resultDom.innerHTML = JSON.stringify(data, null, 2);
        resultDom.classList.remove('error');
      } catch (err) {
        resultDom.innerHTML = "刷新失败，请重试";
        resultDom.classList.add('error');
      }
    }
  </script>
</body>
</html>
    `, {headers: {"Content-Type": "text/html;charset=utf-8"}});
  },
};
