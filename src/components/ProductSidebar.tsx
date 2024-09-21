import React, { useState, useEffect } from "react";
import { Button, Input, Label, FormGroup, Spinner } from "reactstrap";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";

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
    fetch("https://tastykitchen-backend.vercel.app/categories")
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
      ? `https://tastykitchen-backend.vercel.app/products/${editProduct._id}`
      : "https://tastykitchen-backend.vercel.app/products";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editProduct ? "Edit Product" : "Add New Product"}
          </h2>
          <Button
            color="light"
            onClick={closeSidebar}
            className="hover:bg-gray-100 rounded-full p-2"
          >
            <FiX size={24} />
          </Button>
        </div>

        <FormGroup className="mb-4">
          <Label
            for="productName"
            className="text-sm font-medium text-gray-700"
          >
            Product Name
          </Label>
          <Input
            id="productName"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            invalid={!!errors.name}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          />
          {errors.name && (
            <span className="text-red-500 text-sm mt-1">{errors.name}</span>
          )}
        </FormGroup>

        <FormGroup className="mb-4">
          <Label
            for="productDescription"
            className="text-sm font-medium text-gray-700"
          >
            Description
          </Label>
          <Input
            type="textarea"
            id="productDescription"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          />
        </FormGroup>

        <FormGroup className="mb-4">
          <Label
            for="productImage"
            className="text-sm font-medium text-gray-700"
          >
            Image URL
          </Label>
          <Input
            id="productImage"
            value={form.image}
            onChange={(e) => handleChange("image", e.target.value)}
            invalid={!!errors.image}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          />
          {errors.image && (
            <span className="text-red-500 text-sm mt-1">{errors.image}</span>
          )}
        </FormGroup>

        <FormGroup className="mb-4">
          <Label
            for="optionsTitle"
            className="text-sm font-medium text-gray-700"
          >
            Options Title
          </Label>
          <Input
            id="optionsTitle"
            value={form.optionsTitle}
            onChange={(e) => handleChange("optionsTitle", e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          />
        </FormGroup>

        <FormGroup className="mb-4">
          <Label className="text-sm font-medium text-gray-700 flex flex-col">Options</Label>
          {form.options.map((option, index) => (
            <div key={index} className="flex mb-2 space-x-2">
              <Input
                placeholder="Size"
                value={option.size}
                onChange={(e) =>
                  handleOptionChange(index, "size", e.target.value)
                }
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              />
              <Input
                type="number"
                placeholder="Price"
                value={option.price}
                onChange={(e) =>
                  handleOptionChange(index, "price", e.target.value)
                }
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              />
              <Button
                color="danger"
                onClick={() => removeOption(index)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
              >
                <FiTrash2 />
              </Button>
            </div>
          ))}
          <Button
            color="secondary"
            onClick={addOption}
            className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            <span className="flex items-center">
              <FiPlus className="mr-2" /> Add Option
            </span>
          </Button>
        </FormGroup>

        <FormGroup className="mb-6">
          <Label
            for="productCategory"
            className="text-sm font-medium text-gray-700"
          >
            Category
          </Label>
          <Input
            type="select"
            id="productCategory"
            value={form.menuId}
            onChange={(e) => handleChange("menuId", e.target.value)}
            invalid={!!errors.menuId}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </Input>
          {errors.menuId && (
            <span className="text-red-500 text-sm mt-1">{errors.menuId}</span>
          )}
        </FormGroup>

        <Button
          color="danger"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" className="mr-2" /> : null}
          {editProduct ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </div>
  );
};

export default ProductSidebar;
