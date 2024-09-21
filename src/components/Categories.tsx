import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "reactstrap";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [currentCategory, setCurrentCategory] = useState({
    _id: "",
    name: "",
    description: "",
    extras: [],
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    extras: [],
  });
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    fetch("https://tastykitchen-backend.vercel.app/categories")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  };

  const toggleModal = () => setModal(!modal);
  const toggleEditModal = () => setEditModal(!editModal);
  const toggleDeleteModal = () => setDeleteModal(!deleteModal);

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setCurrentCategory((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewCategory((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleExtraChange = (e, index, isEditing = false) => {
    const { name, value } = e.target;
    const updatedExtras = isEditing
      ? [...currentCategory.extras]
      : [...newCategory.extras];
    updatedExtras[index] = { ...updatedExtras[index], [name]: value };

    if (isEditing) {
      setCurrentCategory((prev) => ({ ...prev, extras: updatedExtras }));
    } else {
      setNewCategory((prev) => ({ ...prev, extras: updatedExtras }));
    }
  };

  const addExtraField = (isEditing = false) => {
    const newExtra = { name: "", price: "" };
    if (isEditing) {
      setCurrentCategory((prev) => ({
        ...prev,
        extras: [...prev.extras, newExtra],
      }));
    } else {
      setNewCategory((prev) => ({
        ...prev,
        extras: [...prev.extras, newExtra],
      }));
    }
  };

  const removeExtraField = (index, isEditing = false) => {
    if (isEditing) {
      setCurrentCategory((prev) => ({
        ...prev,
        extras: prev.extras.filter((_, i) => i !== index),
      }));
    } else {
      setNewCategory((prev) => ({
        ...prev,
        extras: prev.extras.filter((_, i) => i !== index),
      }));
    }
  };

  const handleAddCategory = () => {
    fetch("https://tastykitchen-backend.vercel.app/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory),
    })
      .then(() => {
        fetchCategories();
        toggleModal();
        setNewCategory({ name: "", description: "", extras: [] });
      })
      .catch((error) => console.error("Error adding category:", error));
  };

  const handleEditCategory = () => {
    fetch(
      `https://tastykitchen-backend.vercel.app/categories/${currentCategory._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentCategory),
      }
    )
      .then(() => {
        fetchCategories();
        toggleEditModal();
      })
      .catch((error) => console.error("Error editing category:", error));
  };

  const handleDeleteCategory = () => {
    setDeleting(true);
    fetch(
      `https://tastykitchen-backend.vercel.app/categories/${categoryToDelete._id}`,
      {
        method: "DELETE",
      }
    )
      .then(() => {
        fetchCategories();
        setDeleting(false);
        toggleDeleteModal();
      })
      .catch((error) => {
        console.error("Error deleting category:", error);
        setDeleting(false);
      });
  };

  const handleEditButtonClick = (category) => {
    setCurrentCategory({ ...category });
    toggleEditModal();
  };

  const handleDeleteButtonClick = (category) => {
    setCategoryToDelete(category);
    toggleDeleteModal();
  };

  const toggleExtras = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const isFormValid = (form) => form.name.trim() !== "";

  const CategoryCard = ({ category }) => (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300 border-0">
      <CardBody className="flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-gray-800">
          {category.name}
        </h3>
        <p className="text-gray-600 mb-4 text-sm flex-grow">
          {category.description}
        </p>
        {category.extras.length > 0 && (
          <div className="mb-4">
            <p className="font-medium text-main mb-2">Extras:</p>
            <div className="space-y-2">
              {(expandedCategories[category._id]
                ? category.extras
                : category.extras.slice(0, 3)
              ).map((extra, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                >
                  <span>{extra.name}</span>
                  <span className="font-semibold text-red-600">
                    {extra.price.toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
            {category.extras.length > 3 && (
              <div
                className="mt-2 p-0 text-main cursor-pointer"
                onClick={() => toggleExtras(category._id)}
              >
                {expandedCategories[category._id] ? (
                  <span className="flex items-center text-sm text-main">
                    <FiChevronUp className="mr-1" /> Show Less
                  </span>
                ) : (
                  <span className="flex items-center text-sm text-main">
                    <FiChevronDown className="mr-1" /> Show More
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        {
          category.extras.length === 0 && (
            <p>No Extras!</p>
          )
        }
        <div className="flex space-x-2 mt-auto">
          <Button
          color="secondary"
            className="flex-1 flex items-center justify-center"
            onClick={() => handleEditButtonClick(category)}
          >
            <span className="flex items-center w-full justify-center">
            <FiEdit2 className="mr-2" /> Edit
            </span>
          </Button>
          <Button
            color="danger"
            className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
            onClick={() => handleDeleteButtonClick(category)}
          >
            <FiTrash2 />
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Card className="mb-4 shadow-sm border-0">
        <CardBody>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
            <Button
              color="danger"
              className="bg-red-600 hover:bg-red-700 border-0"
              onClick={toggleModal}
            >
              <span className="flex items-center justify-center">
              <FiPlus className="mr-2" /> Add Category
              </span>
            </Button>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add New Modal */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal} className="border-b-0">
          Add New Category
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="name" className="text-gray-700">
                Category Name
              </Label>
              <Input
                type="text"
                name="name"
                id="name"
                value={newCategory.name}
                onChange={(e) => handleInputChange(e)}
                placeholder="Enter category name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="description" className="text-gray-700">
                Description
              </Label>
              <Input
                type="textarea"
                name="description"
                id="description"
                value={newCategory.description}
                onChange={(e) => handleInputChange(e)}
                placeholder="Enter category description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
              />
            </FormGroup>
            <FormGroup>
              <Label className="text-gray-700">Extras</Label><br />
              {newCategory.extras.map((extra, index) => (
                <div key={index} className="flex mb-2 space-x-2">
                  <Input
                    type="text"
                    name="name"
                    placeholder="Extra name"
                    value={extra.name}
                    onChange={(e) => handleExtraChange(e, index)}
                    className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                  />
                  <Input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={extra.price}
                    onChange={(e) => handleExtraChange(e, index)}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                  />
                  <Button
                    color="danger"
                    onClick={() => removeExtraField(index)}
                    className="bg-red-500 hover:bg-red-600 border-0"
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              ))}
              <Button
                color="secondary"
                onClick={() => addExtraField()}
                className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
              >
               <span className="flex items-center">
               <FiPlus className="mr-2" /> Add Extra
               </span>
              </Button>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter className="border-t-0">
          <Button
            color="secondary"
            onClick={toggleModal}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
          >
            Cancel
          </Button>
          <Button
            color="danger"
            onClick={handleAddCategory}
            disabled={!isFormValid(newCategory)}
            className="bg-red-600 hover:bg-red-700 border-0"
          >
            Add
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} toggle={toggleEditModal}>
        <ModalHeader toggle={toggleEditModal} className="border-b-0">
          Edit Category
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="name" className="text-gray-700">
                Category Name
              </Label>
              <Input
                type="text"
                name="name"
                id="name"
                value={currentCategory.name}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter category name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="description" className="text-gray-700">
                Description
              </Label>
              <Input
                type="textarea"
                name="description"
                id="description"
                value={currentCategory.description}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter category description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
              />
            </FormGroup>
            <FormGroup>
              <Label className="text-gray-700">Extras</Label><br />
              {currentCategory.extras.map((extra, index) => (
                <div key={index} className="flex mb-2 space-x-2">
                  <Input
                    type="text"
                    name="name"
                    placeholder="Extra name"
                    value={extra.name}
                    onChange={(e) => handleExtraChange(e, index, true)}
                    className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                  />
                  <Input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={extra.price}
                    onChange={(e) => handleExtraChange(e, index, true)}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                  />
                  <Button
                    color="danger"
                    onClick={() => removeExtraField(index, true)}
                    className="bg-red-500 hover:bg-red-600 border-0"
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              ))}
              <Button
                color="secondary"
                onClick={() => addExtraField(true)}
                className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
              >
                <span className="flex items-center">
                <FiPlus className="mr-2" /> Add Extra
                </span>
              </Button>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter className="border-t-0">
          <Button
            color="secondary"
            onClick={toggleEditModal}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
          >
            Cancel
          </Button>
          <Button
            color="danger"
            onClick={handleEditCategory}
            disabled={!isFormValid(currentCategory)}
            className="bg-red-600 hover:bg-red-700 border-0"
          >
            Update
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={toggleDeleteModal}>
        <ModalHeader toggle={toggleDeleteModal} className="border-b-0">
          Delete Category
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-700">
            Are you sure you want to delete the category "
            {categoryToDelete?.name}"?
          </p>
        </ModalBody>
        <ModalFooter className="border-t-0">
          <Button
            color="danger"
            onClick={handleDeleteCategory}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 border-0"
          >
            {deleting ? <Spinner size="sm" /> : "Yes, Delete"}
          </Button>
          <Button
            color="secondary"
            onClick={toggleDeleteModal}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Categories;
