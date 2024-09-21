import React, { useState, useEffect } from "react";
import { Card, CardBody, Badge, Button } from "reactstrap";
import { FiPackage, FiEye, FiEyeOff } from "react-icons/fi";
import { MdEuroSymbol } from "react-icons/md";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const TodaysOrders = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDoneOrders, setShowDoneOrders] = useState(false);

  useEffect(() => {
    fetchTodaysOrders();
  }, []);

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

      setPendingOrders(updatedOrders.filter(order => !order.isDone));
      setCompletedOrders(updatedOrders.filter(order => order.isDone));
    } catch (error) {
      console.error("Error fetching today's orders:", error);
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

  const getOrderCount = () => {
    return pendingOrders.length + completedOrders.length;
  };

  const handleDoneToggle = (orderId) => {
    const orderToToggle = pendingOrders.find(order => order._id === orderId) || 
                          completedOrders.find(order => order._id === orderId);

    if (orderToToggle) {
      const updatedOrder = { ...orderToToggle, isDone: !orderToToggle.isDone };
      if (updatedOrder.isDone) {
        setPendingOrders(pendingOrders.filter(order => order._id !== orderId));
        setCompletedOrders([...completedOrders, updatedOrder]);
      } else {
        setCompletedOrders(completedOrders.filter(order => order._id !== orderId));
        setPendingOrders([...pendingOrders, updatedOrder]);
      }

      // Update localStorage
      const storedDoneStates = JSON.parse(localStorage.getItem("doneOrders") || "{}");
      storedDoneStates[orderId] = updatedOrder.isDone;
      localStorage.setItem("doneOrders", JSON.stringify(storedDoneStates));
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (showDoneOrders) {
      const newCompletedOrders = Array.from(completedOrders);
      const [reorderedItem] = newCompletedOrders.splice(sourceIndex, 1);
      newCompletedOrders.splice(destIndex, 0, reorderedItem);
      setCompletedOrders(newCompletedOrders);
    } else {
      const newPendingOrders = Array.from(pendingOrders);
      const [reorderedItem] = newPendingOrders.splice(sourceIndex, 1);
      newPendingOrders.splice(destIndex, 0, reorderedItem);
      setPendingOrders(newPendingOrders);
    }
  };

  const currentOrders = showDoneOrders ? completedOrders : pendingOrders;

  if (error) {
    return (
      <Card className="h-full shadow-sm">
        <CardBody>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Today's Orders
          </h3>
          <p className="text-red-500">Error: {error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-sm">
      <CardBody>
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
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-100 rounded-lg p-4 flex items-center space-x-2">
                <FiPackage className="text-red-500 text-3xl mr-3" />
                <div className="flex flex-col">
                  <span className="text-sm text-red-500">Total Orders</span>
                  <span className="text-xl font-bold text-red-700">
                    {getOrderCount()}
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
                <Droppable droppableId="orders">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {currentOrders.map((order, index) => (
                        <Draggable
                          key={order._id}
                          draggableId={order._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-3 ${order.isDone ? "opacity-50" : ""}`}
                            >
                              <div className="flex justify-between items-start bg-gray-50 p-3 rounded-lg">
                                <div className="flex-grow">
                                  <p className="font-bold text-gray-800">
                                    Order #{order.orderNumber || "N/A"}
                                  </p>
                                  <div className="mt-1">
                                    {order.products &&
                                      order.products.map((product, index) => (
                                        <p key={index}>
                                          {product.productId.name} x{" "}
                                          {product.quantity}
                                        </p>
                                      ))}
                                  </div>
                                  <span className="text-sm text-gray-500">{order.delivery.note}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <p className="font-semibold text-gray-800 mt-2">
                                    €
                                    {(Number(order.totalPrice) || 0).toFixed(2)}
                                  </p>
                                  <Button
                                    color={order.isDone ? "warning" : "success"}
                                    size="sm"
                                    onClick={() => handleDoneToggle(order._id)}
                                  >
                                    {order.isDone ? "Undone" : "Done"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              {currentOrders.length === 0 && (
                <p className="text-gray-500">No {showDoneOrders ? "completed" : "pending"} orders to display.</p>
              )}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default TodaysOrders;