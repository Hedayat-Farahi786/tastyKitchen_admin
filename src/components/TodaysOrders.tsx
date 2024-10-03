import React, { useState, useEffect } from "react";
import { Button } from "reactstrap";
import { FiPackage, FiEye, FiEyeOff } from "react-icons/fi";
import { MdEuroSymbol } from "react-icons/md";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import io from "socket.io-client";
const socket = io("https://tastykitchen-websocket.up.railway.app");
import notification from "../assets/notification-sound.mp3";
import { RxDragHandleDots2 } from "react-icons/rx";


const OrderItem = React.memo(({ order, index, isDone, onToggle }) => (
  <Draggable draggableId={order._id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={`bg-gray-50 p-4 rounded-lg shadow-sm transition-all ${
          snapshot.isDragging ? "shadow-lg bg-gray-100" : ""
        } ${isDone ? "opacity-50" : ""}`}
      >
        <div className="flex justify-between items-start">
          <div
            {...provided.dragHandleProps}
            className="mr-3 mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
          >
            <RxDragHandleDots2 size={24} />
          </div>

          <div className="flex-grow">
            {/* Rest of the order content remains the same */}
            <p className="font-bold text-gray-800">
              <span className="text-main">Order</span> #{order.orderNumber || "N/A"}
            </p>
            <div className="mt-1">
              {order.products?.map((product, idx) => (
                <div key={idx} className="mt-3 flex items-start space-x-4">
                  <img
                    src={product.productId.image}
                    alt="product"
                    className="rounded w-14 h-14 object-cover"
                  />
                  <div>
                    <span className="font-semibold">
                      {product.productId.name} x{product.quantity}
                    </span>
                    <div className="flex flex-col space-y-0">
                      {product.extras.map((extra) => {
                        const name = product?.productId?.menuId?.extras.find(
                          (ext) => ext._id === extra
                        )?.name;
                        return (
                          <span
                            key={extra}
                            className="text-xs md:text-sm text-gray-600"
                          >
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {order?.delivery?.note && (
              <div className="text-sm text-gray-500 w-full border-t mt-3 py-2">
                <span className="font-semibold">Bestellzettel:</span>
                <p>{order.delivery.note}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end">
            <p className="font-semibold text-gray-800 mt-2">
              €{(Number(order.totalPrice) || 0).toFixed(2)}
            </p>
            <Button
              color={isDone ? "warning" : "success"}
              size="sm"
              className="mt-2"
              onClick={() => onToggle(order._id)}
            >
              {isDone ? "Undone" : "Done"}
            </Button>
          </div>
        </div>
      </div>
    )}
  </Draggable>
));

const TodaysOrders = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDoneOrders, setShowDoneOrders] = useState(false);
  const [audio] = useState(new Audio(notification));

  useEffect(() => {
    fetchTodaysOrders();
  }, []);

  useEffect(() => {
    const playSound = () => {
      audio.play().catch((error) => {
        console.warn("Autoplay prevented by browser:", error);
      });
    };

    socket.on("new-order", (newOrder) => {
      playSound();
      setPendingOrders((prevPendingOrders) => [
        { ...newOrder, isDone: false },
        ...prevPendingOrders,
      ]);
    });

    return () => {
      socket.off("new-order");
    };
  }, [audio]);

  const fetchTodaysOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://tastykitchen-backend.vercel.app/orders/today"
      );
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
    return (
      <div className="h-full shadow-sm">
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Today's Orders
          </h3>
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-max shadow-sm w-10/12 mx-auto bg-white rounded-lg">
      <div className="p-6 mt-10 md:mt-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Today's Orders
          </h3>
          <Button
            color="light"
            className="flex items-center"
            onClick={() => setShowDoneOrders(!showDoneOrders)}
          >
            <span className="flex items-center">
              {showDoneOrders ? (
                <FiEyeOff className="mr-2" />
              ) : (
                <FiEye className="mr-2" />
              )}
              {showDoneOrders ? "Show Pending" : "Show Done"}
            </span>
          </Button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Stats cards remain the same */}
              <div className="bg-orange-100 rounded-lg p-4 flex items-center space-x-2">
                <FiPackage className="text-orange-500 text-3xl mr-3" />
                <div className="flex flex-col">
                  <span className="text-sm text-orange-500">Pending Orders</span>
                  <span className="text-xl font-bold text-orange-700">
                    {pendingOrders.length}
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 rounded-lg p-4 flex items-center space-x-2">
                <FiPackage className="text-blue-500 text-3xl mr-3" />
                <div className="flex flex-col">
                  <span className="text-sm text-blue-500">Completed Orders</span>
                  <span className="text-xl font-bold text-blue-700">
                    {completedOrders.length}
                  </span>
                </div>
              </div>
              <div className="bg-green-100 rounded-lg p-4 flex items-center space-x-2">
                <MdEuroSymbol className="text-green-500 text-3xl mr-3" />
                <div className="flex flex-col">
                  <span className="text-sm text-green-500">Total Revenue</span>
                  <span className="text-xl font-bold text-green-700">
                    €{getTotalRevenue()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700">
                {showDoneOrders ? "Completed Orders" : "Pending Orders"}
              </h4>
              
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="orders-list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
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

              {(showDoneOrders ? completedOrders : pendingOrders).length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No {showDoneOrders ? "completed" : "pending"} orders to display.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TodaysOrders;