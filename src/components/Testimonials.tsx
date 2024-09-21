import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Form, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState({ _id: "", firstName: "", lastName: "", content: "" });
  const [newTestimonial, setNewTestimonial] = useState({ firstName: "", lastName: "", content: "" });
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = () => {
    setLoading(true);
    fetch("https://tastykitchen-backend.vercel.app/testimonials")
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
      setCurrentTestimonial(prev => ({ ...prev, [name]: value }));
    } else {
      setNewTestimonial(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTestimonial = () => {
    const newAuthor = `${newTestimonial.firstName} ${newTestimonial.lastName}`;
    const newTestimonialData = { author: newAuthor, content: newTestimonial.content };

    fetch("https://tastykitchen-backend.vercel.app/testimonials", {
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
    const updatedTestimonialData = { ...currentTestimonial, author: updatedAuthor };

    fetch(`https://tastykitchen-backend.vercel.app/testimonials/${currentTestimonial._id}`, {
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
    fetch(`https://tastykitchen-backend.vercel.app/testimonials/${testimonialToDelete._id}`, {
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
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  };

  const TestimonialCard = ({ testimonial }) => (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300 border-0">
      <CardBody className="flex flex-col">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-red-50 rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-sm font-semibold text-red-600">
              {testimonial.author.split(" ").map((name) => name.charAt(0).toUpperCase()).join("")}
            </span>
          </div>
          <div className='flex flex-col'>
            <h3 className="font-semibold text-lg text-gray-800">{testimonial.author}</h3>
            <span className="text-sm text-gray-500">{formatDate(testimonial.createdAt)}</span>
          </div>
        </div>
        <p className="text-gray-600 mb-4 flex-grow">{testimonial.content}</p>
        <div className="flex justify-end space-x-2">
          <Button color="light" className="p-2" onClick={() => handleEditButtonClick(testimonial)}>
            <FiEdit2 size={18} />
          </Button>
          <Button color="danger" className="p-2" onClick={() => handleDeleteButtonClick(testimonial)}>
            <FiTrash2 size={18} />
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Card className="mb-4 shadow-sm border-0">
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Testimonials</h2>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div className="relative flex items-center">
                <Input
                  type="text"
                  placeholder="Search by author..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Button 
                color="danger" 
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
                onClick={toggleModal}
              >
               <span className="flex items-center justify-center">
               <FiPlus className="mr-2" /> Add Testimonial
               </span>
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTestimonials.map((testimonial) => (
                <TestimonialCard key={testimonial._id} testimonial={testimonial} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add New Modal */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal} className="border-b-0">Add New Testimonial</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="firstName" className="text-gray-700">First Name</Label>
              <Input
                type="text"
                name="firstName"
                id="firstName"
                value={newTestimonial.firstName}
                onChange={(e) => handleInputChange(e)}
                placeholder="Enter first name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="lastName" className="text-gray-700">Last Name</Label>
              <Input
                type="text"
                name="lastName"
                id="lastName"
                value={newTestimonial.lastName}
                onChange={(e) => handleInputChange(e)}
                placeholder="Enter last name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="content" className="text-gray-700">Content</Label>
              <Input
                type="textarea"
                name="content"
                id="content"
                value={newTestimonial.content}
                onChange={(e) => handleInputChange(e)}
                placeholder="Enter testimonial content"
                rows="5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                required
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter className="border-t-0">
          <Button color="secondary" onClick={toggleModal} className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0">Cancel</Button>
          <Button color="danger" onClick={handleAddTestimonial} disabled={!isFormValid(newTestimonial)} className="bg-red-600 hover:bg-red-700 border-0">Add</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} toggle={toggleEditModal}>
        <ModalHeader toggle={toggleEditModal} className="border-b-0">Edit Testimonial</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="firstName" className="text-gray-700">First Name</Label>
              <Input
                type="text"
                name="firstName"
                id="firstName"
                value={currentTestimonial.firstName}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter first name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="lastName" className="text-gray-700">Last Name</Label>
              <Input
                type="text"
                name="lastName"
                id="lastName"
                value={currentTestimonial.lastName}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter last name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="content" className="text-gray-700">Content</Label>
              <Input
                type="textarea"
                name="content"
                id="content"
                value={currentTestimonial.content}
                onChange={(e) => handleInputChange(e, true)}
                placeholder="Enter testimonial content"
                rows="5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                required
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter className="border-t-0">
          <Button color="secondary" onClick={toggleEditModal} className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0">Cancel</Button>
          <Button color="danger" onClick={handleEditTestimonial} disabled={!isFormValid(currentTestimonial)} className="bg-red-600 hover:bg-red-700 border-0">Save</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={toggleDeleteModal}>
        <ModalHeader toggle={toggleDeleteModal} className="border-b-0">Delete Testimonial</ModalHeader>
        <ModalBody>
          <p className="text-gray-700">
            Are you sure you want to delete the testimonial from "{testimonialToDelete?.author}"?
          </p>
        </ModalBody>
        <ModalFooter className="border-t-0">
          <Button color="secondary" onClick={toggleDeleteModal} className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0">Cancel</Button>
          <Button color="danger" onClick={handleDeleteTestimonial} className="bg-red-600 hover:bg-red-700 border-0">Delete</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Testimonials;