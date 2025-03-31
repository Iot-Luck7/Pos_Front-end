import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/MenuRegisterPage.css"; // ✅ 스타일 분리

const MenuRegisterPage = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);

  const [menuData, setMenuData] = useState({
    menuName: "",
    category: "",
    price: 0,
    calorie: 0,
    ingredients: "",
    dietYn: false,
    imageUrl: "",
  });

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMenuData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const uploadImageToCloudinary = async () => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "menu_image");
    formData.append("cloud_name", "dfb4meubq");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dfb4meubq/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await uploadImageToCloudinary();
      }

      const payload = {
        ...menuData,
        imageUrl,
      };

      const response = await fetch(
        `http://localhost:8080/api/menu/register/${businessId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error(await response.text());

      const { message } = await response.json();
      alert(message);
      navigate(`/menu/pos/${localStorage.getItem("posId")}`);
    } catch (error) {
      alert(`에러 발생: ${error.message}`);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>메뉴 등록</h2>

        <input
          type="text"
          name="menuName"
          placeholder="메뉴 이름"
          value={menuData.menuName}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="카테고리"
          value={menuData.category}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="price"
          placeholder="가격"
          value={menuData.price}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="calorie"
          placeholder="칼로리"
          value={menuData.calorie}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="ingredients"
          placeholder="재료"
          value={menuData.ingredients}
          onChange={handleInputChange}
        />
        <label className="checkbox">
          <input
            type="checkbox"
            name="dietYn"
            checked={menuData.dietYn}
            onChange={handleInputChange}
          />
          다이어트용
        </label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit">등록</button>
      </form>
    </div>
  );
};

export default MenuRegisterPage;
