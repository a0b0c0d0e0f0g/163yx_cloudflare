// Cloudflare Workers 代码：163yx表随机抽取（可指定数量）
export default {
  async fetch(request, env) {
    try {
      // 绑定的D1数据库变量名（和Cloudflare后台一致）
      const db = env.DB163YX;
      if (!db) {
        return Response.json(
          { error: "数据库绑定失败，请检查变量名是否正确" },
          { status: 500 }
        );
      }

      // 自定义抽取数量，这里设为3条，可改成1、5等任意数字
      const limit = 3;
      // 随机抽取指定数量的数据，如需指定字段，把*换成字段名（如id,name）
      const sql = `SELECT * FROM 163yx ORDER BY RANDOM() LIMIT ?`;
      const { results } = await db.prepare(sql).bind(limit).all();

      // 返回结果判断
      if (results.length === 0) {
        return Response.json({ message: "163yx表中暂无数据" });
      }
      return Response.json({
        count: results.length,
        data: results
      });

    } catch (e) {
      return Response.json(
        { error: "数据库读取失败：" + e.message },
        { status: 500 }
      );
    }
  }
};
