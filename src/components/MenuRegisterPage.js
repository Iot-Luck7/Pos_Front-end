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
    calorie: 0,
    isDiet: false,
    imageUrl: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    menuName: "",
    category: "",
    price: "",
    calorie: "",
    description: "",
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

  const validate = () => {
    const newErrors = {
      menuName: menu.menuName.trim() ? "" : "메뉴 이름은 필수입니다.",
      category: menu.category.trim() ? "" : "카테고리는 필수입니다.",
      price: menu.price > 0 ? "" : "가격은 0보다 커야 합니다.",
      calorie: menu.calorie > 0 ? "" : "칼로리는 0보다 커야 합니다.",
      description: menu.description.trim() ? "" : "설명은 필수입니다.",
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      let imageUrl = "";
      if (image) imageUrl = await uploadImage();

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
          value={menu.menuName}
          onChange={handleInputChange}
        />
        {errors.menuName && <p className="error">{errors.menuName}</p>}

        <input
          type="text"
          name="category"
          placeholder="카테고리"
          value={menu.category}
          onChange={handleInputChange}
        />
        {errors.category && <p className="error">{errors.category}</p>}

        <input
          type="number"
          name="price"
          placeholder="가격"
          value={menu.price}
          onChange={handleInputChange}
        />
        {errors.price && <p className="error">{errors.price}</p>}

        <input
          type="number"
          name="calorie"
          placeholder="칼로리"
          value={menu.calorie}
          onChange={handleInputChange}
        />
        {errors.calorie && <p className="error">{errors.calorie}</p>}

        <input
          type="text"
          name="description"
          placeholder="설명"
          value={menu.description}
          onChange={handleInputChange}
        />
        {errors.description && <p className="error">{errors.description}</p>}

        {/* 재료 입력 */}
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

        {/* 재료 목록 */}
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
