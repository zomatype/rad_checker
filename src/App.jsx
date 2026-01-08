import React, { useState } from "react";

// 新宿駅の座標（起点）
const SHINJUKU_STATION = { lat: 35.68918323345258, , lng: 139.70190472729143 };
const RADIUS_LIMIT_KM = 3.0;

const App = () => {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ハバーサイン公式による距離計算
  const calculateDistance = (coords1, coords2) => {
    const R = 6371; // 地球の半径 (km)
    const dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
    const dLng = (coords2.lng - coords1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coords1.lat * (Math.PI / 180)) *
        Math.cos(coords2.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCheck = async () => {
    if (!address) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 自作のAPIエンドポイントを呼び出す
      const response = await fetch(
        `/api/geocode?address=${encodeURIComponent(address)}`
      );
      console.log(response);
      const data = await response.json();

      if (response.ok) {
        // console.log(data);
        const targetCoords = { lat: data.lat, lng: data.lng };
        const distance = calculateDistance(SHINJUKU_STATION, targetCoords);
        setResult({
          address: data.name,
          distance: distance.toFixed(2),
          isSuccess: distance <= RADIUS_LIMIT_KM,
        });
      } else {
        setError(data.error || "エラーが発生しました");
      }
    } catch (err) {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "500px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2>新宿3km圏内判定ツール</h2>
      <p style={{ fontSize: "0.9em", color: "#666" }}>
        新宿駅から3km以内（2万円補助対象）か判定します。
      </p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="例: 東京都新宿区北新宿1丁目"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "判定中..." : "判定"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            border: `2px solid ${result.isSuccess ? "#4caf50" : "#f44336"}`,
            backgroundColor: result.isSuccess ? "#e8f5e9" : "#ffebee",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            結果: {result.isSuccess ? "✅ 対象内" : "❌ 対象外"}
          </h3>
          <p>
            <strong>判定距離:</strong> {result.distance} km
          </p>
          <p style={{ fontSize: "0.8em" }}>
            <strong>取得住所:</strong> {result.address}
          </p>
          {result.isSuccess ? (
            <p>この物件は家賃補助の対象（3km圏内）です！</p>
          ) : (
            <p>残念ながら、補助の対象外である可能性が高いです。</p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
