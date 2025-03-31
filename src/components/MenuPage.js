import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MenuPage = () => {
  const { posId } = useParams();
  const [menus, setMenus] = useState([]);
  const navigate = useNavigate();

  const businessType = localStorage.getItem("businessType");
  const businessId = localStorage.getItem("businessId");

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/menu/list/${posId}`
        );
        if (!response.ok) {
          throw new Error("서버 응답 실패");
        }
        const data = await response.json();
        setMenus(data);
      } catch (error) {
        console.error("메뉴 가져오기 실패:", error);
      }
    };
    console.log(businessType);
    fetchMenus();
  }, [posId]);

  const handleMenuRegister = () => {
    navigate(`/menu/register/${businessId}`);
  };

  return (
    <div>
      <h2>POS ID {posId} 의 메뉴</h2>

      {(businessType === "본점" || businessType === "개인") && (
        <button onClick={handleMenuRegister}>메뉴 등록</button>
      )}

      <ul>
        {menus.map((menu) => (
          <li key={menu.menuId}>
            {menu.imageUrl && (
              <img
                src={menu.imageUrl}
                alt={menu.menuName}
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            )}
            <div>
              {menu.menuName} - {menu.price}원
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuPage;
