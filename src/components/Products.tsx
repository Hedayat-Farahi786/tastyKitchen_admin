import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import {
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiList,
} from "react-icons/fi";
import ProductSidebar from "./ProductSidebar";
import { MdVerified } from "react-icons/md";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/api";
import LoadingSpinner from "./LoadingSpinner";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Alle");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/products`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        const categories = Object.entries(
          data.reduce(
            (a, p) => ({ ...a, [p.menuId.name]: (a[p.menuId.name] || 0) + 1 }),
            {}
          )
        ).map(([name, count]) => ({ name, count }));

        const uniqueCategories = [
          { name: "Alle", count: data.length },
          { name: "Top", count: data.reduce((n, p) => n + !!p.topProduct, 0) },
          ...categories,
        ];
        setCategories(uniqueCategories);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        toast.error("Fehler beim Laden der Produkte");
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
    setModalAction("delete");
    toggleModal();
  };

  const handleToggleVisible = (product) => {
    setModalProduct(product);
    setModalAction("toggleVisible");
    toggleModal();
  };

  const handleToggleTop = (product) => {
    setModalProduct(product);
    setModalAction("toggleTop");
    toggleModal();
  };

  const confirmAction = () => {
    setProcessing(true);
    let url;
    const baseUrl = `${API_BASE_URL}/products/${modalProduct._id}`;

    switch (modalAction) {
      case "delete":
        url = baseUrl;
        break;
      case "toggleTop":
        url = `${baseUrl}/toggleTop`;
        break;
      default:
        url = `${baseUrl}/toggleVisible`;
        break;
    }

    const method = modalAction === "delete" ? "DELETE" : "PUT";

    fetch(url, { method })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            setProcessing(false);
            console.error("Error:", error);
            toast.error(error.message || "Ein Fehler ist aufgetreten");
            throw new Error(error.message);
          });
        }
        return response.json();
      })
      .then(() => {
        setProcessing(false);
        toggleModal();
        setModalProduct(null);
        toast.success("Erfolgreich aktualisiert");
        fetchProducts();
      })
      .catch((error) => {
        setProcessing(false);
        console.error("Error:", error);
      });
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeCategory === "Alle" || product.menuId.name === activeCategory)
  );

  const topProducts = products.filter((product) => product.topProduct);

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-primary-200 group">
      {/* Product Image */}
      <div className="relative overflow-hidden h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const placeholder = parent.querySelector(
                ".image-placeholder-card"
              );
              if (placeholder) {
                (placeholder as HTMLElement).style.display = "flex";
              }
            }
          }}
        />
        {/* Placeholder for broken images in card */}
        <div
          className="image-placeholder-card absolute inset-0 hidden flex-col items-center justify-center text-gray-400"
          style={{ display: "none" }}
        >
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16 mb-2"
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
          <span className="text-xs font-medium">Bild nicht verfügbar</span>
        </div>
        {/* Top Product Badge */}
        {product.topProduct && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg">
            <MdVerified className="mr-1" size={14} /> Top-Produkt
          </div>
        )}
        {/* Hidden Overlay */}
        {!product.visible && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-white text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm shadow-lg">
              🚫 Versteckt
            </span>
          </div>
        )}
        {/* Price Tag */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg">
          <span className="text-primary-600 font-bold text-lg sm:text-xl">
            {product.options[0]?.price
              ? `€${product.options[0].price.toFixed(2)}`
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 md:p-5">
        <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed min-h-[32px] sm:min-h-[40px]">
          {product.description}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t border-gray-100">
          {/* Top Product Toggle */}
          <button
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border-2 transition-all duration-200 font-medium text-xs sm:text-sm ${
              product.topProduct
                ? "bg-primary-600 border-primary-600 text-white shadow-md hover:bg-primary-700"
                : "bg-white border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600"
            }`}
            onClick={() => handleToggleTop(product)}
            title={
              product.topProduct
                ? "Von Top-Produkten entfernen"
                : "Als Top-Produkt markieren"
            }
          >
            <MdVerified
              size={14}
              className={`sm:w-[18px] sm:h-[18px] ${product.topProduct ? "" : "text-gray-400"}`}
            />
            <span className="hidden sm:inline">{product.topProduct ? "Top entfernen" : "Als Top"}</span>
            <span className="sm:hidden">Top</span>
          </button>

          {/* Visibility Toggle */}
          <button
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border-2 transition-all duration-200 font-medium text-xs sm:text-sm ${
              product.visible
                ? "bg-primary-600 border-primary-600 text-white shadow-md hover:bg-primary-700"
                : "bg-white border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600"
            }`}
            onClick={() => handleToggleVisible(product)}
            title={product.visible ? "Produkt verstecken" : "Produkt anzeigen"}
          >
            {product.visible ? (
              <FiEye size={14} className="sm:w-[18px] sm:h-[18px]" />
            ) : (
              <FiEyeOff size={14} className="sm:w-[18px] sm:h-[18px] text-gray-400" />
            )}
            <span className="hidden sm:inline">{product.visible ? "Sichtbar" : "Versteckt"}</span>
            <span className="sm:hidden">{product.visible ? "Ja" : "Nein"}</span>
          </button>

          {/* Edit Button */}
          <button
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border-2 bg-white border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600 transition-all duration-200 font-medium text-xs sm:text-sm"
            onClick={() => handleEdit(product)}
            title="Produkt bearbeiten"
          >
            <FiEdit2 size={14} className="sm:w-[18px] sm:h-[18px]" />
            <span>Bearbeiten</span>
          </button>

          {/* Delete Button */}
          <button
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border-2 bg-primary-600 border-primary-600 text-white hover:bg-primary-700 transition-all duration-200 font-medium text-xs sm:text-sm shadow-md"
            onClick={() => handleDelete(product)}
            title="Produkt löschen"
          >
            <FiTrash2 size={14} className="sm:w-[18px] sm:h-[18px]" />
            <span>Löschen</span>
          </button>
        </div>
      </div>
    </div>
  );
        {!product.visible && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
              🚫 Versteckt
            </span>
          </div>
        )}
        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
          <span className="text-primary-600 font-bold text-xl">
            {product.options[0]?.price
              ? `€${product.options[0].price.toFixed(2)}`
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed min-h-[40px]">
          {product.description}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
          {/* Top Product Toggle */}
          <button
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
              product.topProduct
                ? "bg-primary-600 border-primary-600 text-white shadow-md hover:bg-primary-700"
                : "bg-white border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600"
            }`}
            onClick={() => handleToggleTop(product)}
            title={
              product.topProduct
                ? "Von Top-Produkten entfernen"
                : "Als Top-Produkt markieren"
            }
          >
            <MdVerified
              size={18}
              className={product.topProduct ? "" : "text-gray-400"}
            />
            <span>{product.topProduct ? "Top entfernen" : "Als Top"}</span>
          </button>

          {/* Visibility Toggle */}
          <button
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
              product.visible
                ? "bg-primary-600 border-primary-600 text-white shadow-md hover:bg-primary-700"
                : "bg-white border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600"
            }`}
            onClick={() => handleToggleVisible(product)}
            title={product.visible ? "Produkt verstecken" : "Produkt anzeigen"}
          >
            {product.visible ? (
              <FiEye size={18} />
            ) : (
              <FiEyeOff size={18} className="text-gray-400" />
            )}
            <span>{product.visible ? "Sichtbar" : "Versteckt"}</span>
          </button>

          {/* Edit Button */}
          <button
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 bg-white border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600 transition-all duration-200 font-medium text-sm"
            onClick={() => handleEdit(product)}
            title="Produkt bearbeiten"
          >
            <FiEdit2 size={18} />
            <span>Bearbeiten</span>
          </button>

          {/* Delete Button */}
          <button
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border-2 bg-primary-600 border-primary-600 text-white hover:bg-primary-700 transition-all duration-200 font-medium text-xs sm:text-sm shadow-md"
            onClick={() => handleDelete(product)}
            title="Produkt löschen"
          >
            <FiTrash2 size={14} className="sm:w-[18px] sm:h-[18px]" />
            <span>Löschen</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Produkte werden geladen..." />;
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
        {/* Header */}
        <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Produkte verwalten
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm">
                Erstellen, bearbeiten und verwalten Sie Ihre Produkte
              </p>
            </div>

            {/* Search Bar and Add Button Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:min-w-[280px] lg:min-w-[320px]">
                <Input
                  type="text"
                  placeholder="Suche nach Produktname..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full text-sm"
                />
                <FiSearch
                  className="absolute left-3 sm:left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>

              {/* Add Product Button */}
              <button
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
                onClick={() => setSidebarOpen(true)}
              >
                <FiPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>Neues Produkt</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-100">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
            <FiList className="mr-2" size={14} />
            Kategorien filtern
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((category) => {
              const isActive = activeCategory === category.name;
              return (
                <button
                  key={category.name}
                  className={`rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold border-2 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 ${
                    isActive
                      ? "bg-primary-600 text-white border-primary-600 shadow-md hover:bg-primary-700"
                      : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
                  }`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  <span>{category.name}</span>
                  <span
                    className={`text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {activeCategory === "Top" ? (
          topProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {topProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <p className="text-gray-500 text-base sm:text-lg">
                Keine Top-Produkte gefunden
              </p>
            </div>
          )
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <p className="text-gray-500 text-base sm:text-lg">Keine Produkte gefunden</p>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <ProductSidebar
          closeSidebar={handleCloseSidebar}
          editProduct={editProduct}
        />
      )}

      <Modal isOpen={modal} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal} className="border-0">
          <span className="text-xl font-bold text-gray-900">
            {modalAction === "delete"
              ? "Löschen bestätigen"
              : modalAction === "toggleTop"
                ? "Top-Status ändern"
                : "Sichtbarkeit ändern"}
          </span>
        </ModalHeader>
        <ModalBody className="pt-2 pb-4">
          <p className="text-gray-700 leading-relaxed">
            {modalAction === "delete"
              ? `Möchten Sie das Produkt "${modalProduct?.name}" wirklich löschen?`
              : modalAction === "toggleTop"
                ? `Möchten Sie "${modalProduct?.name}" ${modalProduct?.topProduct ? "von den Top-Produkten entfernen" : "als Top-Produkt markieren"}?`
                : `Möchten Sie "${modalProduct?.name}" ${modalProduct?.visible ? "verstecken" : "anzeigen"}?`}
          </p>
        </ModalBody>
        <ModalFooter className="border-0 pt-0">
          <Button
            color="light"
            onClick={toggleModal}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-xl transition-all duration-200"
          >
            Abbrechen
          </Button>
          <Button
            color="danger"
            onClick={confirmAction}
            disabled={processing}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ml-2"
          >
            {processing ? "Wird verarbeitet..." : "Bestätigen"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Products;
