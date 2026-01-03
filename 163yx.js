export default {
  async fetch(request, env, ctx) {
    const db = env.DB163YX;
    async function getRandomData() {
      try {
        const res = await db.prepare("SELECT * FROM `163yx` ORDER BY RANDOM() LIMIT 1").run();
        return res.results[0] || {msg: "表中暂无数据"};
      } catch (err) {
        return {error: "数据库错误：" + err.message};
      }
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

    const initData = await getRandomData();
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
    .error{color:#ef4444;background:#fef2f2;}
    .success{color:#16a34a;}
    .tip{font-size:14px;color:#64748b;margin-top:5px;}
  </style>
</head>
<body>
  <div class="container">
    <h2>163yx 随机抽取</h2>
    <div class="result" id="result">${formatData(initData)}</div>
    <button class="refresh-btn" onclick="refreshData()">刷新随机内容</button>
  </div>

  <script>
    // 格式化数据：按列分行，每行加复制按钮
    function formatData(data) {
      if(data.error) return \`<div class="error">${JSON.stringify(data.error)}</div>\`;
      let html = '';
      for(let key in data) {
        html += \`
        <div class="row">
          <div class="key">\${key}：</div>
          <div class="value" id="val-\${key}">\${data[key]}</div>
          <button class="copy-btn" onclick="copyText('val-\${key}', this)">复制</button>
        </div>\`;
      }
      return html;
    }

    // 复制功能+成功提示
    function copyText(id, btn) {
      const text = document.getElementById(id).innerText;
      navigator.clipboard.writeText(text).then(() => {
        const oldTxt = btn.innerText;
        btn.innerText = "已复制！";
        btn.style.background = "#16a34a";
        setTimeout(() => {
          btn.innerText = oldTxt;
          btn.style.background = "#1d4ed8";
        }, 1500);
      }).catch(() => {
        alert("复制失败，请手动复制");
      });
    }

    // 刷新功能
    async function refreshData() {
      const resultDom = document.getElementById('result');
      resultDom.innerHTML = "<div style='text-align:center;padding:20px;'>加载中...</div>";
      try {
        const res = await fetch(window.location.href + "?getRandom");
        const data = await res.json();
        resultDom.innerHTML = formatData(data);
        if(data.error) resultDom.classList.add('error');
        else resultDom.classList.remove('error');
      } catch (err) {
        resultDom.innerHTML = "<div class='error'>刷新失败，请重试</div>";
      }
    }
  </script>
</body>
</html>
    `, {headers: {"Content-Type": "text/html;charset=utf-8"}});
  },
};
