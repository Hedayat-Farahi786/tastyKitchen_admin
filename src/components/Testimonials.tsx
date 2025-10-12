import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import { API_BASE_URL } from "../config/api";
import LoadingSpinner from "./LoadingSpinner";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    content: "",
  });
  const [newTestimonial, setNewTestimonial] = useState({
    firstName: "",
    lastName: "",
    content: "",
  });
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/testimonials`)
      .then((response) => response.json())
      .then((data) => {
        setTestimonials(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching testimonials:", error));
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredTestimonials = testimonials.filter((testimonial) =>
    testimonial.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleModal = () => setModal(!modal);
  const toggleEditModal = () => setEditModal(!editModal);
  const toggleDeleteModal = () => setDeleteModal(!deleteModal);

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setCurrentTestimonial((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewTestimonial((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTestimonial = () => {
    const newAuthor = `${newTestimonial.firstName} ${newTestimonial.lastName}`;
    const newTestimonialData = {
      author: newAuthor,
      content: newTestimonial.content,
    };

    fetch(`${API_BASE_URL}/testimonials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTestimonialData),
    })
      .then(() => {
        fetchTestimonials();
        toggleModal();
        setNewTestimonial({ firstName: "", lastName: "", content: "" });
      })
      .catch((error) => console.error("Error adding testimonial:", error));
  };

  const handleEditTestimonial = () => {
    const updatedAuthor = `${currentTestimonial.firstName} ${currentTestimonial.lastName}`;
    const updatedTestimonialData = {
      ...currentTestimonial,
      author: updatedAuthor,
    };

    fetch(`${API_BASE_URL}/testimonials/${currentTestimonial._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTestimonialData),
    })
      .then(() => {
        fetchTestimonials();
        toggleEditModal();
      })
      .catch((error) => console.error("Error editing testimonial:", error));
  };

  const handleDeleteTestimonial = () => {
    fetch(`${API_BASE_URL}/testimonials/${testimonialToDelete._id}`, {
      method: "DELETE",
    })
      .then(() => {
        fetchTestimonials();
        toggleDeleteModal();
      })
      .catch((error) => console.error("Error deleting testimonial:", error));
  };

  const handleEditButtonClick = (testimonial) => {
    const [firstName, lastName] = testimonial.author.split(" ");
    setCurrentTestimonial({ ...testimonial, firstName, lastName });
    toggleEditModal();
  };

  const handleDeleteButtonClick = (testimonial) => {
    setTestimonialToDelete(testimonial);
    toggleDeleteModal();
  };

  const isFormValid = (form) => form.firstName && form.lastName && form.content;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  };

  const TestimonialCard = ({ testimonial }) => (
    <div className="bg-white rounded-lg border border-gray-300 p-5 hover:border-primary-300 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary-50 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-primary-600">
            {testimonial.author
              .split(" ")
              .map((name) => name.charAt(0).toUpperCase())
              .join("")}
          </span>
        </div>
        <div className="flex flex-col flex-grow">
          <h3 className="font-semibold text-lg text-gray-900">
            {testimonial.author}
          </h3>
          <span className="text-sm text-gray-500">
            {formatDate(testimonial.createdAt)}
          </span>
        </div>
      </div>
      <p className="text-gray-600 mb-4 flex-grow line-clamp-4">
        {testimonial.content}
      </p>
      <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={() => handleEditButtonClick(testimonial)}
          className="p-2 hover:bg-gray-100 text-gray-600 hover:text-primary-600 rounded-lg transition-all"
          title="Bearbeiten"
        >
          <FiEdit2 size={18} />
        </button>
        <button
          onClick={() => handleDeleteButtonClick(testimonial)}
          className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-all"
          title="Löschen"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <LoadingSpinner fullScreen message="Bewertungen werden geladen..." />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bewertungen</h1>
        <p className="text-gray-600">Kundenmeinungen verwalten</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg border border-gray-300 p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Nach Autor suchen..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>
          <button
            onClick={toggleModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <FiPlus size={18} />
            <span>Neue Bewertung</span>
          </button>
        </div>
      </div>

      {/* Testimonials Grid */}
      {filteredTestimonials.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-300 p-12 text-center">
          <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
            <FiSearch className="text-gray-400 text-5xl" />
          </div>
          <p className="text-gray-900 font-semibold text-lg mb-2">
            Keine Bewertungen gefunden
          </p>
          <p className="text-gray-500 text-sm">
            {searchTerm
              ? "Versuchen Sie einen anderen Suchbegriff"
              : "Fügen Sie die erste Bewertung hinzu"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial._id} testimonial={testimonial} />
          ))}
        </div>
      )}

      {/* Add New Modal */}
      <Modal isOpen={modal} toggle={toggleModal} size="lg">
        <ModalHeader toggle={toggleModal} className="border-b">
          <span className="text-xl font-bold text-gray-900">
            Neue Bewertung hinzufügen
          </span>
        </ModalHeader>
        <ModalBody className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Vorname *
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={newTestimonial.firstName}
                onChange={(e) => handleInputChange(e)}
                placeholder="z.B. Max"
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5 px-3"
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Nachname *
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={newTestimonial.lastName}
                onChange={(e) => handleInputChange(e)}
                placeholder="z.B. Mustermann"
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5 px-3"
                required
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Bewertungstext *
              </label>
              <textarea
                name="content"
                id="content"
                value={newTestimonial.content}
                onChange={(e) => handleInputChange(e)}
                placeholder="Bewertungstext hier eingeben..."
                rows={5}
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5 px-3 resize-none"
                required
              />
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
            onClick={handleAddTestimonial}
            disabled={!isFormValid(newTestimonial)}
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
            Bewertung bearbeiten
          </span>
        </ModalHeader>
        <ModalBody className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="editFirstName"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Vorname *
              </label>
              <input
                type="text"
                name="firstName"
                id="editFirstName"
                value={currentTestimonial.firstName}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="z.B. Max"
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5 px-3"
                required
              />
            </div>
            <div>
              <label
                htmlFor="editLastName"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Nachname *
              </label>
              <input
                type="text"
                name="lastName"
                id="editLastName"
                value={currentTestimonial.lastName}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="z.B. Mustermann"
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5 px-3"
                required
              />
            </div>
            <div>
              <label
                htmlFor="editContent"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Bewertungstext *
              </label>
              <textarea
                name="content"
                id="editContent"
                value={currentTestimonial.content}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Bewertungstext hier eingeben..."
                rows={5}
                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all py-2.5 px-3 resize-none"
                required
              />
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
            onClick={handleEditTestimonial}
            disabled={!isFormValid(currentTestimonial)}
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
            Bewertung löschen
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
                Möchten Sie die Bewertung von "
                <span className="font-semibold">
                  {testimonialToDelete?.author}
                </span>
                " wirklich löschen? Diese Aktion kann nicht rückgängig gemacht
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
            onClick={handleDeleteTestimonial}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <FiTrash2 size={18} />
            <span>Ja, löschen</span>
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Testimonials;
