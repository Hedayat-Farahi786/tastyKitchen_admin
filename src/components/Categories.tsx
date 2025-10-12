import React, { useEffect, useState } from "react";
import { Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { API_BASE_URL } from "../config/api";
import LoadingSpinner from "./LoadingSpinner";

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
    fetch(`${API_BASE_URL}/categories`)
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
    fetch(`${API_BASE_URL}/categories`, {
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
    fetch(`${API_BASE_URL}/categories/${currentCategory._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentCategory),
    })
      .then(() => {
        fetchCategories();
        toggleEditModal();
      })
      .catch((error) => console.error("Error editing category:", error));
  };

  const handleDeleteCategory = () => {
    setDeleting(true);
    fetch(`${API_BASE_URL}/categories/${categoryToDelete._id}`, {
      method: "DELETE",
    })
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
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-primary-200">
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 text-gray-900">
          {category.name}
        </h3>
        <p className="text-gray-600 mb-4 text-sm min-h-[40px]">
          {category.description || "Keine Beschreibung"}
        </p>

        {category.extras.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold text-gray-700 mb-2 text-sm">Extras:</p>
            <div className="space-y-2">
              {(expandedCategories[category._id]
                ? category.extras
                : category.extras.slice(0, 3)
              ).map((extra, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm bg-gray-50 p-2.5 rounded-lg border border-gray-100"
                >
                  <span className="text-gray-700">{extra.name}</span>
                  <span className="font-semibold text-primary-600">
                    €{extra.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            {category.extras.length > 3 && (
              <button
                className="mt-2 text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center transition-colors"
                onClick={() => toggleExtras(category._id)}
              >
                {expandedCategories[category._id] ? (
                  <>
                    <FiChevronUp className="mr-1" size={16} /> Weniger anzeigen
                  </>
                ) : (
                  <>
                    <FiChevronDown className="mr-1" size={16} /> Mehr anzeigen
                  </>
                )}
              </button>
            )}
          </div>
        )}
        {category.extras.length === 0 && (
          <p className="text-gray-400 text-sm italic mb-4">
            Keine Extras vorhanden
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
          <button
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 bg-white border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600 transition-all duration-200 font-medium text-sm"
            onClick={() => handleEditButtonClick(category)}
            title="Kategorie bearbeiten"
          >
            <FiEdit2 size={18} />
            <span>Bearbeiten</span>
          </button>
          <button
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 bg-primary-600 border-primary-600 text-white hover:bg-primary-700 transition-all duration-200 font-medium text-sm shadow-md"
            onClick={() => handleDeleteButtonClick(category)}
            title="Kategorie löschen"
          >
            <FiTrash2 size={18} />
            <span>Löschen</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Kategorien werden geladen..." />;
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
        {/* Header */}
        <div className="mb-6 pb-6 border-b-2 border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Kategorien verwalten
              </h2>
              <p className="text-gray-600 text-sm">
                Erstellen, bearbeiten und verwalten Sie Ihre Kategorien
              </p>
            </div>

            <button
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
              onClick={toggleModal}
            >
              <FiPlus size={18} />
              <span>Neue Kategorie</span>
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Keine Kategorien vorhanden</p>
            <p className="text-gray-400 text-sm mt-2">
              Erstellen Sie Ihre erste Kategorie
            </p>
          </div>
        )}
      </div>

      {/* Add New Modal */}
      <Modal isOpen={modal} toggle={toggleModal} size="lg">
        <ModalHeader toggle={toggleModal} className="border-b">
          <span className="text-xl font-bold text-gray-900">
            Neue Kategorie hinzufügen
          </span>
        </ModalHeader>
        <ModalBody className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Kategoriename *
              </label>
              <Input
                type="text"
                name="name"
                id="name"
                value={newCategory.name}
                onChange={(e) => handleInputChange(e)}
                placeholder="z.B. Pizza, Burger, Getränke"
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Beschreibung
              </label>
              <Input
                type="textarea"
                name="description"
                id="description"
                value={newCategory.description}
                onChange={(e) => handleInputChange(e)}
                placeholder="Beschreibung der Kategorie..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Extras
              </label>
              <div className="space-y-2">
                {newCategory.extras.map((extra, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="text"
                      name="name"
                      placeholder="Extra-Name"
                      value={extra.name}
                      onChange={(e) => handleExtraChange(e, index)}
                      className="flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5"
                    />
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        €
                      </span>
                      <Input
                        type="number"
                        name="price"
                        placeholder="Preis"
                        value={extra.price}
                        onChange={(e) => handleExtraChange(e, index)}
                        step="0.01"
                        className="w-full pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5"
                      />
                    </div>
                    <button
                      onClick={() => removeExtraField(index)}
                      className="p-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addExtraField()}
                  className="w-full mt-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <FiPlus size={18} />
                  <span>Extra hinzufügen</span>
                </button>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="border-t bg-gray-50 gap-2">
          <button
            onClick={toggleModal}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleAddCategory}
            disabled={!isFormValid(newCategory)}
            className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiPlus size={18} />
            <span>Hinzufügen</span>
          </button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} toggle={toggleEditModal} size="lg">
        <ModalHeader toggle={toggleEditModal} className="border-b">
          <span className="text-xl font-bold text-gray-900">
            Kategorie bearbeiten
          </span>
        </ModalHeader>
        <ModalBody className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="editName"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Kategoriename *
              </label>
              <Input
                type="text"
                name="name"
                id="editName"
                value={currentCategory.name}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="z.B. Pizza, Burger, Getränke"
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5"
                required
              />
            </div>

            <div>
              <label
                htmlFor="editDescription"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Beschreibung
              </label>
              <Input
                type="textarea"
                name="description"
                id="editDescription"
                value={currentCategory.description}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Beschreibung der Kategorie..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Extras
              </label>
              <div className="space-y-2">
                {currentCategory.extras.map((extra, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="text"
                      name="name"
                      placeholder="Extra-Name"
                      value={extra.name}
                      onChange={(e) => handleExtraChange(e, index, true)}
                      className="flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5"
                    />
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        €
                      </span>
                      <Input
                        type="number"
                        name="price"
                        placeholder="Preis"
                        value={extra.price}
                        onChange={(e) => handleExtraChange(e, index, true)}
                        step="0.01"
                        className="w-full pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5"
                      />
                    </div>
                    <button
                      onClick={() => removeExtraField(index, true)}
                      className="p-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addExtraField(true)}
                  className="w-full mt-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <FiPlus size={18} />
                  <span>Extra hinzufügen</span>
                </button>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="border-t bg-gray-50 gap-2">
          <button
            onClick={toggleEditModal}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleEditCategory}
            disabled={!isFormValid(currentCategory)}
            className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiEdit2 size={18} />
            <span>Aktualisieren</span>
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={toggleDeleteModal} size="md">
        <ModalHeader toggle={toggleDeleteModal} className="border-b">
          <span className="text-xl font-bold text-gray-900">
            Kategorie löschen
          </span>
        </ModalHeader>
        <ModalBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <FiTrash2 size={24} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium mb-2">Sind Sie sicher?</p>
              <p className="text-gray-600">
                Möchten Sie die Kategorie "
                <span className="font-semibold">{categoryToDelete?.name}</span>"
                wirklich löschen? Diese Aktion kann nicht rückgängig gemacht
                werden.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="border-t bg-gray-50 gap-2">
          <button
            onClick={toggleDeleteModal}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleDeleteCategory}
            disabled={deleting}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Löschen...</span>
              </>
            ) : (
              <>
                <FiTrash2 size={18} />
                <span>Ja, löschen</span>
              </>
            )}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Categories;
