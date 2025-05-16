'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";


const seniors = ["김과장", "박차장", "이부장", "최이사", "정상무"];
const juniors = ["민영", "유진", "지훈", "수진", "태호", "현우", "지은"];

const categoryOptions = ["전체", "식당", "카페"] as const;
type Category = typeof categoryOptions[number];

interface Place {
  place_name: string;
  distance: string;
  address_name: string;
  phone?: string;
  place_url: string;
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [category, setCategory] = useState<Category>("전체");
  const [team, setTeam] = useState<{ seniors: string[]; juniors: string[] } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);

  // ✅ 초기화 함수
  const resetAll = () => {
    setTeam(null);
    setPlaces([]);
    window.scrollTo({ top: 0, behavior: "smooth" }); // 부드럽게 맨 위로
  };

  const pickTeam = () => {
    const shuffle = (arr: string[]) => arr.sort(() => 0.5 - Math.random());
    setTeam({
      seniors: shuffle([...seniors]).slice(0, 2),
      juniors: shuffle([...juniors]).slice(0, 2),
    });
  };

  const fetchPlaces = async () => {
    const res = await fetch(`/api/lunch?category=${category}`);
    const data = await res.json();
    setPlaces(data.results || []);
  };

  const handleTeamPick = () => {
    pickTeam();
    fetchPlaces();
    setStarted(true); // 애니메이션용 플래그
  };

  const handleTeamOnlyPick = () => {
    pickTeam();
  };


  return (
    <div className="min-h-screen bg-gray-50 flex justify-center overflow-y-scroll">
      {/* 흰색 박스 */}
      <div className="w-[750px] min-h-screen bg-white flex flex-col justify-center px-6 py-10">
      <motion.div
        layout
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="flex flex-col items-center"
        >
          <motion.div
           initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2,ease: "easeInOut" }}
          >
            {/* ✅ 로고 클릭 시 초기화 */}
            <div className="mb-5 cursor-pointer" onClick={() => window.location.reload()}>
              <Image src="/logo.png" alt="Who Are You? Logo" width={280} height={35} />
            </div>
    
            <p className="text-center text-gray-600 text-base leading-relaxed mb-6">
              오늘은 누구랑 점심 먹을까요? <br />
              점심시간에 새로운 조합, 새로운 수다! <br />
              팀 랜덤 돌렸습니다~ 😎
            </p>
    
            {/* 카테고리 버튼 */}
            <div className="flex w-[280px] gap-2 mb-5">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-2 rounded-xl border text-base font-semibold transition
                    ${category === cat
                      ? "bg-orange-50 text-orange-500 border-orange-400"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
    
            {/* 메인 버튼 */}
            <button
              onClick={handleTeamPick}
              className="w-72 py-3 bg-orange-500 text-white rounded-xl font-bold text-lg mb-8 transition hover:bg-orange-600"
            >
              누가 나올까?
            </button>
          </motion.div>

        </motion.div>
          {started && (
          <motion.div
            key="team-block"
            initial={{ opacity: 0, y: 120 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: "easeInOut" }}
            className="mt-0 w-full"
          >
            {/* 이후 콘텐츠 */}
            {team && (
              <div className="mt-8 w-full max-w-md mx-auto">
                {/* 팀 멤버 */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
                      <img src="/members.png" alt="팀 아이콘" className="w-5 h-5" />
                      오늘의 멤버
                    </div>
                    <button
                      onClick={handleTeamOnlyPick}
                      className="text-sm text-orange-500 flex items-center gap-1 hover:underline"
                    >
                      <img src="/refresh.png" alt="새로고침" className="w-4 h-4" />
                      새로운 멤버
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex justify-center gap-4 flex-wrap">
                    {[...team.seniors, ...team.juniors].map((name, idx) => (
                      <div key={idx} className="text-gray-800 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
      
                {/* 장소 추천 */}
                {places.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
                        <img src="/food.png" alt="식당 아이콘" className="w-5 h-5" />
                        근처 맛집 추천
                        <span className="ml-1 text-sm text-gray-400 font-normal">1km 이내</span>
                      </div>
                      <button
                        onClick={fetchPlaces}
                        className="text-sm text-orange-500 flex items-center gap-1 hover:underline"
                      >
                        <img src="/refresh.png" alt="새로고침" className="w-4 h-4" />
                        새로운 장소
                      </button>
                    </div>
                    <div className="space-y-4">
                      {places.map((place, idx) => {
                        const distance = parseInt(place.distance);
                        const time = Math.round(distance / 67);
                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-gray-100 bg-white px-4 py-5 shadow-sm"
                          >
                            <h3 className="text-gray-800 font-semibold text-base mb-2">
                              {place.place_name}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>🚶 도보 {time}분 ({distance}m)</p>
                              <p>📍 {place.address_name}</p>
                              {place.phone && <p>📞 {place.phone}</p>}
                            </div>
                            <a
                              href={place.place_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block mt-4 text-center bg-orange-50 text-orange-500 font-semibold py-2 rounded-lg text-sm hover:bg-orange-100 transition"
                            >
                              카카오 맵에서 보기
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
  
  
}
