// Cloudflare Workers 代码：163yx表随机抽取
export default {
  async fetch(request, env) {
    try {
      // 绑定的D1数据库变量名（和Cloudflare后台填的DB163YX一致）
      const db = env.DB163YX;
      if (!db) {
        return Response.json(
          { error: "数据库绑定失败，请检查变量名是否正确" },
          { status: 500 }
        );
      }

      // 随机抽取163yx表中的一条数据
      const sql = "SELECT * FROM 163yx ORDER BY RANDOM() LIMIT 1";
      const { results } = await db.prepare(sql).all();

      // 返回结果，无数据时提示
      if (results.length === 0) {
        return Response.json({ message: "163yx表中暂无数据" });
      }
      return Response.json({ data: results[0] });

    } catch (e) {
      // 捕获错误并返回
      return Response.json(
        { error: "数据库读取失败：" + e.message },
        { status: 500 }
      );
    }
  }
};
