import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/MenuRegisterPage.css";

const MenuRegisterPage = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredientList, setIngredientList] = useState([]);

  const [menu, setMenu] = useState({
    menuName: "",
    category: "",
    price: 0,
    calories: 0,
    isDiet: false,
    imageUrl: "",
  });

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setMenu((prevMenu) => ({
      ...prevMenu,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIngredientAdd = () => {
    if (ingredientInput.trim()) {
      setIngredientList([...ingredientList, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const handleIngredientRemove = (index) => {
    setIngredientList(ingredientList.filter((_, i) => i !== index));
  };

  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("file", image);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      let imageUrl = "";

      if (image) {
        imageUrl = await uploadImage();
      }

      const payload = {
        ...menu,
        ingredients: ingredientList.join(", "),
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
      navigate(`/menu/${localStorage.getItem("posId")}`);
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
          value={menu.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="카테고리"
          value={menu.category}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="price"
          placeholder="가격"
          value={menu.price}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="calories"
          placeholder="칼로리"
          value={menu.calories}
          onChange={handleInputChange}
        />

        {/* ✅ 재료 입력 */}
        <div className="ingredient-input-group">
          <input
            type="text"
            placeholder="재료 입력 후 +"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
          />
          <button
            type="button"
            onClick={handleIngredientAdd}
            className="add-btn"
          >
            +
          </button>
        </div>

        {/* ✅ 재료 목록 */}
        <div className="ingredient-list">
          {ingredientList.map((item, index) => (
            <span key={index} className="ingredient-item">
              {item}
              <button
                type="button"
                onClick={() => handleIngredientRemove(index)}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <label className="checkbox">
          <input
            type="checkbox"
            name="isDiet"
            checked={menu.isDiet}
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
