import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/MenuPage.css";

const MenuPage = () => {
  const { posId } = useParams();
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null); // ✅ 모달용 상태
  const [newImageFile, setNewImageFile] = useState(null);
  const navigate = useNavigate();

  const businessType = localStorage.getItem("businessType");
  const businessId = localStorage.getItem("businessId");

  useEffect(() => {
    fetchMenus();
  }, [posId]);

  const uploadImageToCloudinary = async () => {
    if (!newImageFile) return selectedMenu.imageUrl;

    const formData = new FormData();
    formData.append("file", newImageFile);
    formData.append("upload_preset", "menu_image");
    formData.append("cloud_name", "dfb4meubq");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dfb4meubq/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const fetchMenus = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/menu/list/${posId}`
      );
      if (!response.ok) throw new Error("서버 응답 실패");
      const data = await response.json();
      setMenus(data);
    } catch (error) {
      console.error("메뉴 가져오기 실패:", error);
    }
  };

  const handleMenuRegister = () => {
    navigate(`/menu/register/${businessId}`);
  };

  const handleDelete = async (menuId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/menu/delete/${menuId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("삭제 실패");
      alert("삭제 완료");
      fetchMenus();
    } catch (error) {
      alert("삭제 중 오류 발생");
    }
  };

  return (
    <div className="menu-container">
      <h2>POS ID {posId}의 메뉴 목록</h2>

      {(businessType === "본점" || businessType === "개인") && (
        <button className="register-btn" onClick={handleMenuRegister}>
          메뉴 등록
        </button>
      )}

      <div className="menu-list">
        {menus.map((menu) => (
          <div
            className="menu-card"
            key={menu.menuId}
            onClick={() => setSelectedMenu(menu)} // ✅ 클릭 시 모달 열기
          >
            {menu.imageUrl && (
              <img
                className="menu-img"
                src={menu.imageUrl}
                alt={menu.menuName}
              />
            )}
            <div className="menu-info">
              <strong>{menu.menuName}</strong>
              <p>{menu.price.toLocaleString()}원</p>
              {(businessType === "본점" || businessType === "개인") && (
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ 모달 안 뜨게 막음
                    handleDelete(menu.menuId);
                  }}
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ 상세 정보 모달 */}
      {selectedMenu && (
        <div className="modal-overlay" onClick={() => setSelectedMenu(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>메뉴 수정</h3>
            {selectedMenu.imageUrl && (
              <img
                src={selectedMenu.imageUrl}
                alt={selectedMenu.menuName}
                className="modal-img"
              />
            )}

            {/* ✅ 수정 form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const uploadedUrl = await uploadImageToCloudinary();

                  const response = await fetch(
                    `http://localhost:8080/api/menu/update/${selectedMenu.menuId}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        menuName: selectedMenu.menuName,
                        category: selectedMenu.category,
                        price: selectedMenu.price,
                        calorie: selectedMenu.calorie,
                        ingredients: selectedMenu.ingredients,
                        dietYn: selectedMenu.dietYn === "Y",
                        imageUrl: uploadedUrl, // ✅ 새 이미지 URL
                      }),
                    }
                  );

                  if (!response.ok) throw new Error("수정 실패");
                  alert("수정 완료");
                  setSelectedMenu(null);
                  fetchMenus();
                } catch (err) {
                  alert("수정 중 오류 발생");
                }
              }}
            >
              <label>
                메뉴 이름:
                <input
                  type="text"
                  value={selectedMenu.menuName}
                  onChange={(e) =>
                    setSelectedMenu({
                      ...selectedMenu,
                      menuName: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                카테고리:
                <input
                  type="text"
                  value={selectedMenu.category || ""}
                  onChange={(e) =>
                    setSelectedMenu({
                      ...selectedMenu,
                      category: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                가격:
                <input
                  type="number"
                  value={selectedMenu.price}
                  onChange={(e) =>
                    setSelectedMenu({
                      ...selectedMenu,
                      price: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                칼로리:
                <input
                  type="number"
                  value={selectedMenu.calorie || 0}
                  onChange={(e) =>
                    setSelectedMenu({
                      ...selectedMenu,
                      calorie: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                재료:
                <input
                  type="text"
                  value={selectedMenu.ingredients || ""}
                  onChange={(e) =>
                    setSelectedMenu({
                      ...selectedMenu,
                      ingredients: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                다이어트용:
                <input
                  type="checkbox"
                  checked={selectedMenu.dietYn === "Y"}
                  onChange={(e) =>
                    setSelectedMenu({
                      ...selectedMenu,
                      dietYn: e.target.checked ? "Y" : "N",
                    })
                  }
                />
              </label>
              <label>
                이미지 수정:
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImageFile(e.target.files[0])}
                />
              </label>
              <div style={{ marginTop: "1rem" }}>
                <button type="submit" className="close-btn">
                  수정 저장
                </button>
                <button
                  type="button"
                  className="close-btn"
                  style={{ marginLeft: "10px", background: "#999" }}
                  onClick={() => setSelectedMenu(null)}
                >
                  닫기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
