import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiRotateCcw } from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import io from "socket.io-client";
import API_BASE_URL, { WEBSOCKET_URL } from "../config/api";
import notification from "../assets/notification-sound.mp3";
import { RxDragHandleDots2 } from "react-icons/rx";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

// Custom Euro Icon Component
const EuroIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 6.3C17.5 4.9 15.5 4 13.2 4 8.4 4 4.5 7.9 4.5 12.8S8.4 21.5 13.2 21.5c2.3 0 4.3-.9 5.8-2.3" />
    <line x1="3" y1="10" x2="11" y2="10" />
    <line x1="3" y1="14" x2="11" y2="14" />
  </svg>
);

const socket = io(WEBSOCKET_URL);

interface OrderItemProps {
  order: any;
  index: number;
  isDone: boolean;
  onToggle: (orderId: string) => void;
}

const OrderItem = React.memo<OrderItemProps>(
  ({ order, index, isDone, onToggle }) => {
    return (
      <Draggable draggableId={order._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`bg-white rounded-lg border transition-all duration-300 relative ${
              snapshot.isDragging
                ? "shadow-2xl border-primary-500 scale-[1.02] rotate-2"
                : isDone
                  ? "border-primary-200 bg-primary-50 opacity-75"
                  : "border-gray-300 hover:border-primary-300 hover:shadow-lg"
            }`}
          >
            {/* Blinking Indicator for Pending Orders */}
            {!isDone && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="relative">
                  <div className="w-4 h-4 bg-primary-600 rounded-full animate-ping absolute"></div>
                  <div className="w-4 h-4 bg-primary-600 rounded-full relative"></div>
                </div>
              </div>
            )}

            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-2 sm:gap-4">
                {/* Drag Handle */}
                <div
                  {...provided.dragHandleProps}
                  className="text-gray-300 hover:text-primary-500 cursor-grab active:cursor-grabbing transition-colors mt-1"
                >
                  <RxDragHandleDots2 size={20} className="sm:w-6 sm:h-6" />
                </div>

                {/* Order Content */}
                <div className="flex-grow">
                  {/* Order Number & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl font-bold text-primary-600">
                        #{order.orderNumber || "N/A"}
                      </span>
                      {isDone && (
                        <span className="flex items-center text-primary-600 text-xs font-semibold bg-primary-100 px-2 sm:px-3 py-1 rounded-full">
                          <FiCheckCircle className="mr-1" size={12} /> Erledigt
                        </span>
                      )}
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        €{(Number(order.totalPrice) || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                    {order.products?.map((product, idx) => {
                      const productKey =
                        product.productId?._id || `product-${idx}`;
                      return (
                        <div
                          key={productKey}
                          className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={product.productId.image}
                            alt="product"
                            className="rounded-lg w-12 h-12 sm:w-16 sm:h-16 object-cover flex-shrink-0"
                          />
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                {product.productId.name}
                              </span>
                              <span className="text-primary-600 font-bold text-base sm:text-lg px-2 sm:px-2.5 py-0.5 bg-primary-100 rounded-md flex-shrink-0">
                                x{product.quantity}
                              </span>
                            </div>
                            {product.extras.length > 0 && (
                              <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1 sm:mt-2">
                                {product.extras.map((extra) => {
                                  const menuExtras =
                                    product?.productId?.menuId?.extras || [];
                                  const extraItem = menuExtras.find(
                                    (ext) => ext._id === extra
                                  );
                                  const name = extraItem?.name;
                                  return (
                                    <span
                                      key={extra}
                                      className="text-xs bg-white text-gray-600 px-1.5 sm:px-2 py-0.5 rounded border border-gray-200"
                                    >
                                      + {name}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Note */}
                  {order?.delivery?.note && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        📝 Notiz
                      </span>
                      <p className="text-gray-700 text-xs sm:text-sm mt-1 break-words">
                        {order.delivery.note}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => onToggle(order._id)}
                    className={`w-full font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 ${
                      isDone
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    {isDone ? (
                      <>
                        <FiRotateCcw size={16} className="sm:w-5 sm:h-5" />
                        <span>Rückgängig machen</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle size={16} className="sm:w-5 sm:h-5" />
                        <span>Als erledigt markieren</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  }
);

const TodaysOrders = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDoneOrders, setShowDoneOrders] = useState(false);
  const [audio] = useState(new Audio(notification));
  const [socketConnected, setSocketConnected] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }

    // Initialize socket connection status
    setSocketConnected(socket.connected);

    // Try to connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  useEffect(() => {
    fetchTodaysOrders();
  }, []);

  useEffect(() => {
    const playSound = () => {
      audio.play().catch((error) => {
        console.warn("Autoplay prevented by browser:", error);
      });
    };

    // Listen for new orders from socket (using underscore for compatibility with Railway)
    socket.on("new_order", (newOrder) => {
      console.log("New order received:", newOrder);
      playSound();

      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Neue Bestellung!", {
          body: `Bestellung #${newOrder.orderNumber} - €${(Number(newOrder.totalPrice) || 0).toFixed(2)}`,
          icon: "/favicons/favicon-32x32.png",
          tag: newOrder._id,
        });
      }

      setPendingOrders((prevPendingOrders) => [
        { ...newOrder, isDone: false },
        ...prevPendingOrders,
      ]);
    });

    // Listen for socket connection events
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setSocketConnected(true);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocketConnected(false);
    });

    return () => {
      socket.off("new_order");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, [audio]);

  const fetchTodaysOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/today`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      const storedDoneStates = JSON.parse(
        localStorage.getItem("doneOrders") || "{}"
      );

      const updatedOrders = Array.isArray(data)
        ? data.map((order) => ({
            ...order,
            isDone: storedDoneStates[order._id] || false,
          }))
        : [];

      setPendingOrders(updatedOrders.filter((order) => !order.isDone));
      setCompletedOrders(updatedOrders.filter((order) => order.isDone));
    } catch (error) {
      setError(error.message);
      setPendingOrders([]);
      setCompletedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    const allOrders = [...pendingOrders, ...completedOrders];
    return allOrders
      .reduce((total, order) => total + (Number(order.totalPrice) || 0), 0)
      .toFixed(2);
  };

  const handleDoneToggle = (orderId) => {
    const orderToToggle =
      pendingOrders.find((order) => order._id === orderId) ||
      completedOrders.find((order) => order._id === orderId);

    if (orderToToggle) {
      const updatedOrder = { ...orderToToggle, isDone: !orderToToggle.isDone };
      if (updatedOrder.isDone) {
        setPendingOrders(
          pendingOrders.filter((order) => order._id !== orderId)
        );
        setCompletedOrders([...completedOrders, updatedOrder]);
      } else {
        setCompletedOrders(
          completedOrders.filter((order) => order._id !== orderId)
        );
        setPendingOrders([...pendingOrders, updatedOrder]);
      }

      const storedDoneStates = JSON.parse(
        localStorage.getItem("doneOrders") || "{}"
      );
      storedDoneStates[orderId] = updatedOrder.isDone;
      localStorage.setItem("doneOrders", JSON.stringify(storedDoneStates));
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const list = showDoneOrders ? [...completedOrders] : [...pendingOrders];
    const [removed] = list.splice(sourceIndex, 1);
    list.splice(destinationIndex, 0, removed);

    if (showDoneOrders) {
      setCompletedOrders(list);
    } else {
      setPendingOrders(list);
    }
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTodaysOrders} />;
  }

  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        message="Heutige Bestellungen werden geladen..."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Heutige Bestellungen
          </h1>
          {/* Socket Connection Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${socketConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            ></div>
            <span className="text-xs sm:text-sm text-gray-600">
              {socketConnected ? "Live verbunden" : "Offline"}
            </span>
          </div>
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          Verwalten Sie alle Bestellungen des Tages
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Pending Orders */}
        <div className="bg-white rounded-lg border border-gray-300 p-4 sm:p-5 hover:border-primary-300 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Ausstehend
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {pendingOrders.length}
              </p>
            </div>
            <div className="bg-primary-50 p-2 sm:p-3 rounded-lg">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                {pendingOrders.length}
              </div>
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-lg border border-gray-300 p-4 sm:p-5 hover:border-primary-300 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Erledigt
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {completedOrders.length}
              </p>
            </div>
            <div className="bg-primary-50 p-2 sm:p-3 rounded-lg">
              <FiCheckCircle className="text-primary-600 text-xl sm:text-2xl" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-primary-100 mb-1">
                Tagesumsatz
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                €{getTotalRevenue()}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg">
              <EuroIcon className="text-main w-7 h-7 sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-lg border border-gray-300 p-1.5 sm:p-2 mb-4 sm:mb-6 inline-flex w-full sm:w-auto">
        <button
          onClick={() => setShowDoneOrders(false)}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md font-medium transition-all duration-200 text-xs sm:text-sm ${
            !showDoneOrders
              ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Ausstehend ({pendingOrders.length})
        </button>
        <button
          onClick={() => setShowDoneOrders(true)}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md font-medium transition-all duration-200 text-xs sm:text-sm ${
            showDoneOrders
              ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Erledigt ({completedOrders.length})
        </button>
      </div>

      {/* Orders List */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="orders-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3 sm:space-y-4"
            >
              {(showDoneOrders ? completedOrders : pendingOrders).map(
                (order, index) => (
                  <OrderItem
                    key={order._id}
                    order={order}
                    index={index}
                    isDone={order.isDone}
                    onToggle={handleDoneToggle}
                  />
                )
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Empty State */}
      {(showDoneOrders ? completedOrders : pendingOrders).length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="bg-white rounded-lg border border-gray-300 p-8 sm:p-12 inline-block">
            <div className="bg-gray-100 p-4 sm:p-6 rounded-full inline-block mb-3 sm:mb-4">
              {showDoneOrders ? (
                <FiCheckCircle className="text-gray-400 text-4xl sm:text-5xl" />
              ) : (
                <div className="text-gray-400 text-4xl sm:text-5xl font-bold">
                  0
                </div>
              )}
            </div>
            <p className="text-gray-900 font-semibold text-base sm:text-lg mb-2">
              Keine {showDoneOrders ? "erledigten" : "ausstehenden"}{" "}
              Bestellungen
            </p>
            <p className="text-gray-500 text-xs sm:text-sm px-4">
              {showDoneOrders
                ? "Markieren Sie Bestellungen als erledigt, um sie hier zu sehen"
                : "Neue Bestellungen erscheinen automatisch hier"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysOrders;
