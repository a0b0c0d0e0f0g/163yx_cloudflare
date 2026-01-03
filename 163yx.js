export default {
  async fetch(request, env, ctx) {
    console.log("D1绑定是否存在：", !!env.DB163YX);
    const db = env.DB163YX;

    async function getRandomData() {
      try {
        if (!db) throw new Error("D1数据库绑定DB163YX不存在");
        const res = await db.prepare("SELECT * FROM `163yx` ORDER BY RANDOM() LIMIT 1").run();
        const data = res.results[0];
        console.log("抽取的单条数据：", data);
        return data || { msg: "表中暂无数据，请先插入测试数据" };
      } catch (err) {
        console.error("数据库查询错误：", err.message);
        return { error: "数据库读取失败：" + err.message };
      }
    }

    // 【关键修复】把formatData移到服务端，作为独立函数
    function formatData(data) {
      if (!data || typeof data !== 'object') {
        return '<div class="error">数据格式异常</div>';
      }
      if (data.error) {
        return `<div class="error">${data.error}</div>`;
      }
      if (Object.keys(data).length === 0) {
        return '<div>表中暂无数据</div>';
      }
      let html = '';
      for (const key in data) {
        if (Object.hasOwn(data, key)) {
          const value = data[key] ?? '空值';
          html += `
          <div class="row">
            <div class="key">${key}：</div>
            <div class="value" id="val-${key}">${value}</div>
            <button class="copy-btn" onclick="copyText('val-${key}', this)">复制</button>
          </div>`;
        }
      }
      return html;
    }

    if (request.url.includes("?getRandom")) {
      const data = await getRandomData();
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    try {
      const initData = await getRandomData();
      const initHtml = formatData(initData); // 服务端调用函数
      return new Response(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>163yx随机抽取</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f5f7fa;padding:20px;font-family:Arial;}
    .container{background:#fff;padding:40px 30px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-width:500px;width:100%;text-align:center;}
    h2{color:#2c3e50;margin-bottom:30px;font-size:24px;}
    .result{padding:25px;background:#f8f9fa;border-radius:8px;margin:20px 0;text-align:left;}
    .row{display:flex;align-items:center;margin:12px 0;padding:8px;border-radius:4px;background:#fff;}
    .key{width:120px;font-weight:bold;color:#2563eb;padding-right:15px;}
    .value{flex:1;font-size:16px;color:#333;word-break:break-all;}
    .copy-btn{padding:6px 12px;background:#1d4ed8;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;margin-left:10px;transition:all 0.2s;}
    .copy-btn:hover{background:#1e40af;}
    .copy-btn:active{transform:scale(0.98);}
    .refresh-btn{padding:12px 36px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer;transition:all 0.3s;}
    .refresh-btn:hover{background:#1d4ed8;transform:translateY(-2px);}
    .refresh-btn:active{transform:translateY(0);}
    .error{color:#ef4444;background:#fef2f2;padding:10px;border-radius:4px;}
    .success{color:#16a34a;}
  </style>
</head>
<body>
  <div class="container">
    <h2>163yx 随机抽取</h2>
    <div class="result" id="result">${initHtml}</div>
    <button class="refresh-btn" onclick="refreshData()">刷新随机内容</button>
  </div>
  <script>
    // 前端复用的格式化函数（供刷新时使用）
    function formatData(data) {
      if (!data || typeof data !== 'object') {
        return '<div class="error">数据格式异常</div>';
      }
      if (data.error) {
        return \`<div class="error">\${data.error}</div>\`;
      }
      if (Object.keys(data).length === 0) {
        return '<div>表中暂无数据</div>';
      }
      let html = '';
      for (const key in data) {
        if (Object.hasOwn(data, key)) {
          const value = data[key] ?? '空值';
          html += \`
          <div class="row">
            <div class="key">\${key}：</div>
            <div class="value" id="val-\${key}">\${value}</div>
            <button class="copy-btn" onclick="copyText('val-\${key}', this)">复制</button>
          </div>\`;
        }
      }
      return html;
    }

    function copyText(id, btn) {
      try {
        const text = document.getElementById(id).innerText;
        navigator.clipboard.writeText(text).then(() => {
          const oldText = btn.innerText;
          btn.innerText = "已复制";
          btn.style.background = "#16a34a";
          setTimeout(() => {
            btn.innerText = oldText;
            btn.style.background = "#1d4ed8";
          }, 1500);
        });
      } catch (err) {
        alert("复制失败：" + err.message);
      }
    }

    async function refreshData() {
      const resultDom = document.getElementById('result');
      resultDom.innerHTML = '<div style="text-align:center;">加载中...</div>';
      try {
        const res = await fetch(window.location.href + "?getRandom");
        const data = await res.json();
        resultDom.innerHTML = formatData(data);
      } catch (err) {
        resultDom.innerHTML = '<div class="error">刷新失败，请重试</div>';
      }
    }
  </script>
</body>
</html>
      `, {
        headers: { "Content-Type": "text/html;charset=utf-8" }
      });
    } catch (pageErr) {
      console.error("页面渲染错误：", pageErr.message);
      return new Response(`页面加载失败：${pageErr.message}`, {
        status: 500,
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      });
    }
  },
};
