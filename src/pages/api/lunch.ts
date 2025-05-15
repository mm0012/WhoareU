import { NextApiRequest, NextApiResponse } from "next";

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY!;
const x_company = 126.836806;
const y_company = 37.569203;

const categoryCodes = {
  식당: "FD6",
  카페: "CE7",
};

async function fetchKakaoCategory(code: string) {
  const url = new URL("https://dapi.kakao.com/v2/local/search/category.json");
  url.searchParams.set("x", x_company.toString());
  url.searchParams.set("y", y_company.toString());
  url.searchParams.set("radius", "1000");
  url.searchParams.set("size", "15");
  url.searchParams.set("sort", "distance");
  url.searchParams.set("category_group_code", code);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
  });
  const data = await response.json();
  return data.documents || [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { category = "전체" } = req.query;

  try {
    let combined: any[] = [];

    if (category === "전체") {
      const [restaurants, cafes] = await Promise.all([
        fetchKakaoCategory(categoryCodes["식당"]),
        fetchKakaoCategory(categoryCodes["카페"]),
      ]);
      combined = [...restaurants, ...cafes];
    } else {
      const code = categoryCodes[category as keyof typeof categoryCodes];
      combined = await fetchKakaoCategory(code);
    }

    const filtered = combined.filter((r: any) => parseInt(r.distance) <= 1000);
    const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 3);

    res.status(200).json({ results: shuffled });
  } catch (error) {
    console.error("Kakao API error:", error);
    res.status(500).json({ error: "카카오 API 호출 실패" });
  }
}
