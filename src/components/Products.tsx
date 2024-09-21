import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FiEdit2, FiEye, FiEyeOff, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import ProductSidebar from './ProductSidebar';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [modal, setModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    fetch('https://tastykitchen-backend.vercel.app/products')
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        const uniqueCategories = ['All', ...new Set(data.map(product => product.menuId.name))];
        setCategories(uniqueCategories);
        setLoading(false);
      });
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setEditProduct(null);
    fetchProducts();
  };

  const toggleModal = () => setModal(!modal);

  const handleDelete = (product) => {
    setModalProduct(product);
    setModalAction('delete');
    toggleModal();
  };

  const handleToggleVisible = (product) => {
    setModalProduct(product);
    setModalAction('toggleVisible');
    toggleModal();
  };

  const confirmAction = () => {
    setProcessing(true);
    const url = modalAction === 'delete'
      ? `https://tastykitchen-backend.vercel.app/products/${modalProduct._id}`
      : `https://tastykitchen-backend.vercel.app/products/${modalProduct._id}/toggleVisible`;
    const method = modalAction === 'delete' ? 'DELETE' : 'PUT';

    fetch(url, { method })
      .then(response => response.json())
      .then(() => {
        setProcessing(false);
        toggleModal();
        setModalProduct(null);
        fetchProducts();
      })
      .catch(error => {
        setProcessing(false);
        console.error('Error:', error);
      });
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeCategory === 'All' || product.menuId.name === activeCategory)
  );

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <img className="w-full h-80 object-cover object-center rounded-tr-md rounded-tl-md" src={product.image} alt={product.name} />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-red-600 font-semibold text-lg">
            {product.options[0]?.price ? `€${product.options[0].price.toFixed(2)}` : 'N/A'}
          </span>
          <div className="flex space-x-2">
            <Button color="light" className="p-2 hover:bg-gray-100" onClick={() => handleEdit(product)}>
              <FiEdit2 size={18} />
            </Button>
            <Button 
              color={product.visible ? "success" : "warning"} 
              className={`p-2 ${product.visible ? 'hover:bg-green-600' : 'hover:bg-yellow-600'}`} 
              onClick={() => handleToggleVisible(product)}
            >
              {product.visible ? <FiEye size={18} /> : <FiEyeOff size={18} />}
            </Button>
            <Button color="danger" className="p-2 hover:bg-red-700" onClick={() => handleDelete(product)}>
              <FiTrash2 size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <Card className="mb-4 border-0 shadow-sm">
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Products</h2>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div className="relative flex items-center">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Button 
                color="danger" 
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="flex items-center justify-center">
                <FiPlus className="mr-2" /> Add Product
                </span>
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category}
                color={activeCategory === category ? "danger" : "light"}
                className={`rounded-full px-4 py-2 text-sm font-medium border ${
                  activeCategory === category 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } transition duration-300 ease-in-out`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {sidebarOpen && (
        <ProductSidebar
          closeSidebar={handleCloseSidebar}
          editProduct={editProduct}
        />
      )}

      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal} className="border-b-0 pb-0">
          <span className="text-xl font-semibold text-gray-800">
            {modalAction === 'delete' ? 'Confirm Delete' : 'Confirm Visibility Change'}
          </span>
        </ModalHeader>
        <ModalBody className="pt-4">
          <p className="text-gray-600">
            {modalAction === 'delete'
              ? `Are you sure you want to delete the product: ${modalProduct?.name}?`
              : `Are you sure you want to ${modalProduct?.visible ? 'hide' : 'show'} the product: ${modalProduct?.name}?`}
          </p>
        </ModalBody>
        <ModalFooter className="border-t-0 pt-0">
          <Button 
            color="danger" 
            onClick={confirmAction} 
            disabled={processing}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            {processing ? 'Processing...' : 'Confirm'}
          </Button>
          <Button 
            color="secondary" 
            onClick={toggleModal}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out ml-2"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Products;