import React, { useState, useEffect } from "react";
import "../css/UserRegister.css";

const UserRegister = () => {
  const [businessType, setBusinessType] = useState("본점");
  const [businessName, setBusinessName] = useState("");
  const [sponsorshipYn] = useState("N");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [posLoginId, setPosLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [addressResults, setAddressResults] = useState([]);

  // 📌 네이버 API를 이용한 주소 검색
  const searchAddress = async (query) => {
    if (!query.trim()) {
      setAddressResults([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/search-address?query=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error(`API 오류 발생: ${response.status}`);
      }

      const data = await response.json();

      if (data.addresses.length > 0) {
        setAddressResults(
          data.addresses.map((item) => ({
            address_name: item.roadAddress || item.jibunAddress,
            lat: item.y,
            lng: item.x,
          }))
        );
      } else {
        console.warn("🔍 검색 결과 없음");
        setAddressResults([]);
      }
    } catch (error) {
      console.error("❌ 주소 검색 실패:", error);
    }
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() !== "") {
      searchAddress(value);
    } else {
      setAddressResults([]);
    }
  };

  const handleSelectAddress = (address, locationData) => {
    console.log("📍 선택한 주소:", address);
    setLocation(address);
    setLatitude(locationData.lat);
    setLongitude(locationData.lng);
    setQuery("");
    setAddressResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setMessage("비밀번호를 입력하세요.");
      return;
    }

    const data = {
      business: {
        businessType,
        businessName,
        sponsorshipYn,
      },
      pos: {
        location,
        latitude: parseFloat(latitude).toFixed(6),
        longitude: parseFloat(longitude).toFixed(6),
        posLoginId,
        posPassword: password,
      },
    };

    try {
      const response = await fetch("http://localhost:8080/api/pos/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "등록 실패");
      }

      const result = await response.json();
      setMessage(result.message);
      console.log("✅ 서버 응답:", result);
    } catch (error) {
      console.error("❌ 유저 등록 실패:", error);
      setMessage("유저 등록 실패: " + error.message);
    }
  };

  return (
    <div className="register-container">
      <form className="amazon-form" onSubmit={handleSubmit}>
        <h2 className="form-title">계정 생성</h2>

        <label>사업자 유형</label>
        <select
          className="form-input"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
        >
          <option value="본점">본점</option>
          <option value="가맹점">가맹점</option>
          <option value="개인">개인</option>
        </select>

        <label>사업장 이름</label>
        <input
          className="form-input"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />

        <label>주소 (도로명)</label>
        <input
          className="form-input"
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="도로명 주소를 입력하세요"
        />
        <ul className="address-results">
          {addressResults.map((item, index) => (
            <li
              key={index}
              onClick={() =>
                handleSelectAddress(item.address_name, {
                  lat: item.lat,
                  lng: item.lng,
                })
              }
            >
              {item.address_name}
            </li>
          ))}
        </ul>
        <input
          className="form-input"
          type="text"
          value={location}
          readOnly
          placeholder="선택한 주소"
        />

        <label>이메일 (로그인 ID)</label>
        <input
          className="form-input"
          type="email"
          value={posLoginId}
          onChange={(e) => setPosLoginId(e.target.value)}
          required
        />

        <label>비밀번호</label>
        <input
          className="form-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="amazon-btn">
          계정 생성
        </button>

        <p className="terms">
          계속 진행하면 Amazon의 <a href="#">이용약관</a> 및{" "}
          <a href="#">개인정보 보호정책</a>에 동의하는 것으로 간주됩니다.
        </p>

        {message && <p className="message">{message}</p>}

        <button
          type="button"
          className="amazon-btn"
          onClick={() => (window.location.href = "/login")}
        >
          로그인 화면으로 이동
        </button>
      </form>
    </div>
  );
};

export default UserRegister;
