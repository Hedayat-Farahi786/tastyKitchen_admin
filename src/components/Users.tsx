import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { FiUserPlus, FiTrash2, FiUsers } from "react-icons/fi";
import { API_BASE_URL } from "../config/api";

interface User {
  _id: string;
  username: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/auth/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Fehler beim Laden der Benutzer");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/auth/delete/${deleteUserId}`);
      setSuccessMessage("Benutzer erfolgreich gelöscht");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setErrorMessage("Fehler beim Löschen des Benutzers");
    } finally {
      setIsDeleteModalOpen(false);
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, newUser);
      setSuccessMessage("Benutzer erfolgreich registriert");
      fetchUsers();
      setIsRegisterModalOpen(false);
      setNewUser({ username: "", password: "" });
    } catch (error) {
      console.error("Error registering user:", error);
      setErrorMessage("Fehler bei der Registrierung");
    } finally {
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Benutzer</h2>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FiUserPlus className="w-5 h-5" />
            <span>Benutzer hinzufügen</span>
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Users Table */}
        {users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-12 text-center">
            <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Keine Benutzer gefunden</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Benutzername
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user: User, index: number) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setDeleteUserId(user._id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>Löschen</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        toggle={() => setIsDeleteModalOpen(false)}
        centered
      >
        <ModalHeader toggle={() => setIsDeleteModalOpen(false)}>
          Löschen bestätigen
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-700">
            Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?
          </p>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleDeleteUser}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
          >
            Ja, löschen
          </button>
        </ModalFooter>
      </Modal>

      {/* Register New User Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        toggle={() => setIsRegisterModalOpen(false)}
        centered
      >
        <ModalHeader toggle={() => setIsRegisterModalOpen(false)}>
          Neuen Benutzer registrieren
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleRegisterUser} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Benutzername
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-medium"
            >
              Registrieren
            </button>
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default Users;
