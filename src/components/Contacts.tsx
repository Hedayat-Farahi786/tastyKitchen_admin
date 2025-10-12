import React, { useEffect, useState } from "react";
import { FiDownload, FiSearch, FiMail } from "react-icons/fi";
import { API_BASE_URL } from "../config/api";
import LoadingSpinner from "./LoadingSpinner";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/contacts`)
      .then((response) => response.json())
      .then((data) => {
        setContacts(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching contacts:", error));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = () => {
    const csvData = contacts.map((contact) => ({
      Name: contact.name,
      Email: contact.email,
      Message: contact.message,
      CreatedAt: new Date(contact.createdAt).toLocaleString(),
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(csvData[0]).join(",") +
      "\n" +
      csvData.map((e) => Object.values(e).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contacts.csv");
    document.body.appendChild(link);

    link.click();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Kontakte werden geladen..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kontaktanfragen
        </h1>
        <p className="text-gray-600">Übersicht aller Kundenanfragen</p>
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
              placeholder="Suchen nach Name, Email oder Nachricht..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <FiDownload size={18} />
            <span>CSV Exportieren</span>
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
              <FiMail className="text-gray-400 text-5xl" />
            </div>
            <p className="text-gray-900 font-semibold text-lg mb-2">
              Keine Kontaktanfragen gefunden
            </p>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? "Versuchen Sie einen anderen Suchbegriff"
                : "Es sind noch keine Anfragen eingegangen"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Nachricht
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Eingegangen am
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-primary-50 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                          <span className="text-sm font-semibold text-primary-600">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {contact.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {contact.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                      <div className="line-clamp-2">{contact.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contact.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
