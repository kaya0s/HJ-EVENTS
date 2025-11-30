import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Edit, Trash2, Mail, User } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";

const ManageClients = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    phone: "",
    address: "",
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/users");
      const usersList = Array.isArray(res.data?.users)
        ? res.data.users
        : Array.isArray(res.data)
        ? res.data
        : [];
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authUser?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchUsers();
  }, [authUser, navigate, fetchUsers]);

  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.phone?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "",
      phone: user.phone || "",
      address: user.address || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      // Attach lastKnownUpdatedAt for concurrency checks
      const payload = { ...editFormData, lastKnownUpdatedAt: selectedUser.updatedAt };
      await axiosInstance.put(`/users/${selectedUser._id}`, payload);
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      // Handle concurrency conflict specially
      if (error.response?.status === 409) {
        toast.error(error.response?.data?.message || "User was updated by someone else. Please refresh.");
        fetchUsers();
      } else if (error.response?.status === 403) {
        toast.error(error.response?.data?.message || "Cannot grant admin role via this interface.");
      } else {
        toast.error(error.response?.data?.message || "Failed to update user");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;

    try {
      await axiosInstance.delete(`/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      user: "badge-primary",
      admin: "badge-error",
      supplier: "badge-warning",
    };
    return (
      <span className={`badge ${roleConfig[role] || "badge-ghost"}`}>
        {role}
      </span>
    );
  };

  if (authUser?.role !== "admin") {
    return null;
  }

  const modal =
    isEditModalOpen && selectedUser ? (
      <div className="modal modal-open">
        <div className="modal-box max-w-2xl">
          <h3 className="text-2xl font-bold mb-4">Edit User</h3>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={editFormData.fullName}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    fullName: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    email: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Role</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={editFormData.role}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    role: e.target.value,
                  })
                }
                required
                disabled={selectedUser?._id === authUser?._id}
              >
                <option value="user">Client</option>
                <option value="supplier">Supplier</option>
              </select>
              {selectedUser?._id === authUser?._id && (
                <p className="text-sm text-base-content/60 mt-1">You cannot change your own role.</p>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Phone</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={editFormData.phone}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    address: e.target.value,
                  })
                }
                rows="3"
              />
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update User
              </button>
            </div>
          </form>
        </div>
        <div
          className="modal-backdrop"
          onClick={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
        >
          {" "}
        </div>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-base-100">
      <AdminSidebar />
      <main className="lg:ml-20 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Manage Clients & Users</h1>
            <p className="text-base-content/60">
              View, edit, and manage all users in the system.
            </p>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="form-control w-full md:w-48">
                  <label className="label">
                    <span className="label-text">Filter by Role</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Clients</option>
                    <option value="supplier">Suppliers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                <div className="form-control flex-1 md:max-w-xs">
                  <label className="label">
                    <span className="label-text">Search</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone..."
                      className="input input-bordered flex-1"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-square" type="button">
                      <Search size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Users ({filteredUsers.length})</h2>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <Loader className="animate-spin mx-auto" size={32} />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-base-content/60">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <User
                                size={18}
                                className="text-base-content/60"
                              />
                              <span className="font-medium">
                                {user.fullName}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Mail
                                size={16}
                                className="text-base-content/60"
                              />
                              <span className="text-sm">{user.email}</span>
                            </div>
                          </td>
                          <td>{getRoleBadge(user.role)}</td>
                          <td>{user.phone || "N/A"}</td>
                          <td>
                            <span className="text-sm text-base-content/70">
                              {user.address || "N/A"}
                            </span>
                          </td>
                          <td>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => handleEdit(user)}
                                title="Edit"
                                type="button"
                              >
                                <Edit size={16} />
                              </button>
                              {user._id !== authUser._id && (
                                <button
                                  className="btn btn-sm btn-error btn-ghost"
                                  onClick={() => handleDeleteUser(user._id)}
                                  title="Delete"
                                  type="button"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {modal}
    </div>
  );
};

export default ManageClients;
