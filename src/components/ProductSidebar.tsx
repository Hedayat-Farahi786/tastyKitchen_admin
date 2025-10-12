import React, { useState, useEffect } from "react";
import { Input, Label, FormGroup, Spinner } from "reactstrap";
import { FiX, FiPlus, FiTrash2, FiAlertCircle, FiCheck } from "react-icons/fi";
import { API_BASE_URL } from "../config/api";

const ProductSidebar = ({ closeSidebar, editProduct }) => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    optionsTitle: "Select a size",
    options: [],
    menuId: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories`)
      .then((response) => response.json())
      .then((data) => setCategories(data));

    if (editProduct) {
      setForm({
        name: editProduct.name,
        description: editProduct.description,
        image: editProduct.image,
        optionsTitle: editProduct.optionsTitle,
        options: editProduct.options,
        menuId: editProduct.menuId._id,
      });
    }
  }, [editProduct]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const addOption = () => {
    setForm({
      ...form,
      options: [...form.options, { size: "", price: "" }],
    });
  };

  const removeOption = (index) => {
    const newOptions = form.options.filter((_, i) => i !== index);
    setForm({ ...form, options: newOptions });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...form.options];
    newOptions[index][field] = value;
    setForm({ ...form, options: newOptions });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!form.name) formErrors.name = "Name is required";
    if (!form.image) formErrors.image = "Image URL is required";
    if (!form.menuId) formErrors.menuId = "Category is required";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setLoading(true);
    const method = editProduct ? "PUT" : "POST";
    const url = editProduct
      ? `${API_BASE_URL}/products/${editProduct._id}`
      : `${API_BASE_URL}/products`;

    if (!editProduct) {
      form.visible = true;
    }

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((response) => response.json())
      .then(() => {
        setLoading(false);
        closeSidebar();
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error:", error);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50 animate-fade-in">
      <div className="bg-white w-full max-w-3xl h-full overflow-y-auto shadow-2xl">
        {/* Header - Clean and Minimal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editProduct ? "Produkt bearbeiten" : "Neues Produkt"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Füllen Sie die erforderlichen Felder aus
              </p>
            </div>
            <button
              onClick={closeSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FiX size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Form Content - Clean and Minimal */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <FormGroup>
              <Label
                for="productName"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Produktname *
              </Label>
              <Input
                id="productName"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                invalid={!!errors.name}
                placeholder="z.B. Margherita Pizza"
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5 text-base"
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle size={12} />
                  {errors.name}
                </span>
              )}
            </FormGroup>

            <FormGroup>
              <Label
                for="productDescription"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Beschreibung
              </Label>
              <Input
                type="textarea"
                id="productDescription"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Beschreiben Sie Ihr Produkt..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none text-base"
              />
            </FormGroup>
          </div>

          {/* Image Section */}
          <div className="space-y-4">
            <FormGroup>
              <Label
                for="productImage"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Bild-URL *
              </Label>
              <Input
                id="productImage"
                value={form.image}
                onChange={(e) => handleChange("image", e.target.value)}
                invalid={!!errors.image}
                placeholder="https://example.com/bild.jpg"
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5 text-base"
              />
              {errors.image && (
                <span className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle size={12} />
                  {errors.image}
                </span>
              )}
            </FormGroup>

            {/* Image Preview Below */}
            {form.image && (
              <div className="mt-3">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Vorschau
                </Label>
                <div className="relative border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src={form.image}
                    alt="Vorschau"
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const placeholder = parent.querySelector(
                          ".image-placeholder"
                        ) as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = "flex";
                        }
                      }
                    }}
                  />
                  {/* Placeholder for broken/unavailable images */}
                  <div className="image-placeholder hidden w-full h-64 flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <svg
                      className="w-20 h-20 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="text-center px-4">
                      <p className="text-red-600 font-semibold mb-1">
                        ❌ Bild nicht verfügbar
                      </p>
                      <p className="text-xs text-gray-500">
                        Bitte überprüfen Sie die URL
                      </p>
                    </div>
                  </div>
                  {/* Success indicator */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
                    <span className="text-xs font-medium text-gray-700">
                      ✓ Bild geladen
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Options Section */}
          <div className="space-y-4">
            <FormGroup>
              <Label
                for="optionsTitle"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Optionen-Titel (optional)
              </Label>
              <Input
                id="optionsTitle"
                value={form.optionsTitle}
                onChange={(e) => handleChange("optionsTitle", e.target.value)}
                placeholder="z.B. Größe wählen"
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5 text-base"
              />
            </FormGroup>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 block">
                Größen & Preise
              </Label>
              {form.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Größe"
                    value={option.size}
                    onChange={(e) =>
                      handleOptionChange(index, "size", e.target.value)
                    }
                    className="flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5 text-base"
                  />
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      €
                    </span>
                    <Input
                      type="number"
                      placeholder="Preis"
                      value={option.price}
                      onChange={(e) =>
                        handleOptionChange(index, "price", e.target.value)
                      }
                      step="0.01"
                      className="w-full pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5 text-base"
                    />
                  </div>
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 rounded-lg transition-colors"
                    title="Löschen"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="w-full mt-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <FiPlus size={18} />
                <span>Option hinzufügen</span>
              </button>
            </div>
          </div>

          {/* Category Section */}
          <div className="space-y-4">
            <FormGroup>
              <Label
                for="productCategory"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Kategorie *
              </Label>
              <Input
                type="select"
                id="productCategory"
                value={form.menuId}
                onChange={(e) => handleChange("menuId", e.target.value)}
                invalid={!!errors.menuId}
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5 text-base"
              >
                <option value="">Kategorie auswählen</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Input>
              {errors.menuId && (
                <span className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle size={12} />
                  {errors.menuId}
                </span>
              )}
            </FormGroup>
          </div>
        </div>

        {/* Submit Button - Sticky at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 shadow-lg">
          <button
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Wird gespeichert...</span>
              </>
            ) : (
              <>
                {editProduct ? (
                  <>
                    <FiCheck size={20} />
                    <span>Änderungen speichern</span>
                  </>
                ) : (
                  <>
                    <FiPlus size={20} />
                    <span>Produkt hinzufügen</span>
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSidebar;
