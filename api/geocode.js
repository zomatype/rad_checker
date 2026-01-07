// Yahoo APIをサーバーサイドで呼び出すプロキシ
export default async function handler(req, res) {
  const { address } = req.query;
  const APP_ID = process.env.YAHOO_APP_ID; // Vercelの環境変数に設定

  if (!address) return res.status(400).json({ error: "Address is required" });

  try {
    const url = `https://map.yahooapis.jp/geocode/V1/geoCoder?appid=${APP_ID}&query=${encodeURIComponent(
      address
    )}&output=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Feature && data.Feature.length > 0) {
      // 座標は "経度,緯度" の文字列で返ってくるので分割
      const [lng, lat] = data.Feature[0].Geometry.Coordinates.split(",");
      res.status(200).json({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        name: data.Feature[0].Name,
      });
    } else {
      res.status(404).json({ error: "住所が見つかりませんでした" });
    }
  } catch (error) {
    res.status(500).json({ error: "Yahoo APIとの通信に失敗しました" });
  }
}
