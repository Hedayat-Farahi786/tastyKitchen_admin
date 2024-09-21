import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, Card } from "reactstrap";
import { FiUserPlus, FiTrash2 } from "react-icons/fi";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [alert, setAlert] = useState({ color: "", message: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://tastykitchen-backend.vercel.app/auth/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`https://tastykitchen-backend.vercel.app/auth/delete/${deleteUserId}`);
      setAlert({ color: "success", message: "User deleted successfully" });
      fetchUsers();
    } catch (error) {
      setAlert({ color: "danger", message: "Error deleting user" });
    } finally {
      setIsDeleteModalOpen(false);
      setTimeout(() => setAlert({ color: "", message: "" }), 3000);
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://tastykitchen-backend.vercel.app/auth/register", newUser);
      setAlert({ color: "success", message: "User registered successfully" });
      fetchUsers();
      setIsRegisterModalOpen(false);
      setNewUser({ username: "", password: "" });
    } catch (error) {
      setAlert({ color: "danger", message: "Error registering user" });
    } finally {
      setTimeout(() => setAlert({ color: "", message: "" }), 3000);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Card className="shadow-sm border-0">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Users</h2>
            <Button
              color="danger"
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center"
              onClick={() => setIsRegisterModalOpen(true)}
            >
              <span className="flex items-center">
              <FiUserPlus className="mr-2" /> Add User
              </span>
            </Button>
          </div>

          {alert.message && (
            <Alert color={alert.color} className="mb-4">
              {alert.message}
            </Alert>
          )}

          <div className="overflow-x-auto">
            <Table className="w-full" hover>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button
                        color="danger"
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-md transition duration-300 ease-in-out flex items-center"
                        onClick={() => {
                          setDeleteUserId(user._id);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <span className="flex items-center">
                        <FiTrash2 className="mr-2" /> Delete
                        </span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} toggle={() => setIsDeleteModalOpen(false)}>
        <ModalHeader toggle={() => setIsDeleteModalOpen(false)} className="border-b-0">Confirm Delete</ModalHeader>
        <ModalBody>
          <p className="text-gray-700">Are you sure you want to delete this user?</p>
        </ModalBody>
        <ModalFooter className="border-t-0">
          <Button color="danger" onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700 border-0">
            Yes, Delete
          </Button>
          <Button color="secondary" onClick={() => setIsDeleteModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Register New User Modal */}
      <Modal isOpen={isRegisterModalOpen} toggle={() => setIsRegisterModalOpen(false)}>
        <ModalHeader toggle={() => setIsRegisterModalOpen(false)} className="border-b-0">Register New User</ModalHeader>
        <ModalBody>
          <Form onSubmit={handleRegisterUser}>
            <FormGroup>
              <Label for="username" className="text-gray-700">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
              />
            </FormGroup>
            <FormGroup>
              <Label for="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
              />
            </FormGroup>
            <Button type="submit" color="danger" className="w-full bg-red-600 hover:bg-red-700 border-0 mt-4">
              Register
            </Button>
          </Form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default Users;