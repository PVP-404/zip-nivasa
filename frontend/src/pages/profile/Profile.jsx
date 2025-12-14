import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Shield,
  Camera,
  Edit3,
  Save,
  X,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  LogOut,
  Bell,
  Lock,
  ChevronRight,
  Loader2,
  Home,
  UtensilsCrossed,
  BadgeCheck,
  Settings,
  HelpCircle,
  FileText,
  Trash2,
} from "lucide-react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getProfile, updateProfile } from "../../services/profileService";

// UTILITIES

const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getRoleInfo = (role) => {
  const roles = {
    tenant: {
      label: "Tenant",
      icon: User,
      color: "bg-blue-100 text-blue-700",
      description: "Looking for accommodation",
    },
    pgowner: {
      label: "PG Owner",
      icon: Home,
      color: "bg-emerald-100 text-emerald-700",
      description: "Property owner",
    },
    messowner: {
      label: "Mess Owner",
      icon: UtensilsCrossed,
      color: "bg-orange-100 text-orange-700",
      description: "Food service provider",
    },
    admin: {
      label: "Admin",
      icon: Shield,
      color: "bg-purple-100 text-purple-700",
      description: "Platform administrator",
    },
  };
  return roles[role] || roles.tenant;
};

// TOAST COMPONENT


const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        "fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border",
        type === "success" && "bg-emerald-50 border-emerald-200 text-emerald-800",
        type === "error" && "bg-red-50 border-red-200 text-red-800",
        type === "info" && "bg-blue-50 border-blue-200 text-blue-800"
      )}
    >
      {type === "success" && <Check className="w-5 h-5 text-emerald-600" />}
      {type === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
      {type === "info" && <AlertCircle className="w-5 h-5 text-blue-600" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-full ml-2">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
// FORM FIELD COMPONENT

const FormField = ({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  icon: Icon,
  placeholder,
  error,
  helperText,
  required,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-4.5 h-4.5 text-slate-400" />
          </div>
        )}
        <input
          type={isPassword && showPassword ? "text" : type}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-xl border transition-all duration-200",
            Icon ? "pl-10 pr-4" : "px-4",
            isPassword ? "pr-10" : "",
            "py-3 text-sm",
            disabled
              ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
              : "bg-white border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
            error && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
          )}
        />
        {isPassword && !disabled && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-slate-400" />
            ) : (
              <Eye className="w-4 h-4 text-slate-400" />
            )}
          </button>
        )}
      </div>
      {(error || helperText) && (
        <p className={cn("text-xs", error ? "text-red-600" : "text-slate-500")}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// AVATAR COMPONENT


const ProfileAvatar = ({ name, image, size = "lg", editable, onImageChange }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(image);

  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-xl",
    lg: "w-24 h-24 text-3xl",
    xl: "w-32 h-32 text-4xl",
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageChange?.(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg",
          sizeClasses[size]
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(name)
        )}
      </div>

      {editable && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-1 -right-1 p-2 bg-white rounded-full shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Camera className="w-4 h-4 text-slate-600" />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};


// SECTION CARD COMPONENT

const SectionCard = ({ title, description, icon: Icon, children, action }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-emerald-600" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// QUICK ACTION COMPONENT

const QuickAction = ({ icon: Icon, label, description, onClick, variant = "default" }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full p-4 rounded-xl border text-left transition-all duration-200 group",
      variant === "default" && "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
      variant === "danger" && "border-red-100 hover:border-red-200 hover:bg-red-50"
    )}
  >
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
          variant === "default" && "bg-slate-100 group-hover:bg-emerald-100",
          variant === "danger" && "bg-red-100"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5",
            variant === "default" && "text-slate-600 group-hover:text-emerald-600",
            variant === "danger" && "text-red-600"
          )}
        />
      </div>
      <div className="flex-1">
        <p
          className={cn(
            "font-medium",
            variant === "default" && "text-slate-900",
            variant === "danger" && "text-red-700"
          )}
        >
          {label}
        </p>
        {description && (
          <p
            className={cn(
              "text-sm",
              variant === "default" && "text-slate-500",
              variant === "danger" && "text-red-500"
            )}
          >
            {description}
          </p>
        )}
      </div>
      <ChevronRight
        className={cn(
          "w-5 h-5 transition-transform group-hover:translate-x-1",
          variant === "default" && "text-slate-400",
          variant === "danger" && "text-red-400"
        )}
      />
    </div>
  </button>
);


// STAT CARD COMPONENT

const StatCard = ({ icon: Icon, label, value, subtext }) => (
  <div className="bg-slate-50 rounded-xl p-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
        <Icon className="w-4 h-4 text-emerald-600" />
      </div>
      <span className="text-sm text-slate-600">{label}</span>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
  </div>
);

// LOADING SKELETON

const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header Skeleton */}
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-slate-200 rounded w-48" />
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="h-6 bg-slate-200 rounded-full w-20" />
        </div>
      </div>
    </div>

    {/* Form Skeleton */}
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="h-5 bg-slate-200 rounded w-40 mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-12 bg-slate-200 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// MAIN PROFILE COMPONENT

const Profile = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(null);

  // Form Data
  const [base, setBase] = useState({});
  const [roleData, setRoleData] = useState({});
  const [originalBase, setOriginalBase] = useState({});
  const [originalRoleData, setOriginalRoleData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  // Password Change
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setBase(res.user);
        setRoleData(res.roleData || {});
        setOriginalBase(res.user);
        setOriginalRoleData(res.roleData || {});
      } catch (error) {
        showToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Toast helper
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile({
        name: base.name,
        phone: base.phone,
        roleData,
        avatar: avatarFile,
      });

      setOriginalBase(base);
      setOriginalRoleData(roleData);
      setEditMode(false);
      showToast("Profile updated successfully!");
    } catch (error) {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setBase(originalBase);
    setRoleData(originalRoleData);
    setAvatarFile(null);
    setEditMode(false);
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordErrors({});

    // Validation
    const errors = {};
    if (!passwordData.current) errors.current = "Current password is required";
    if (!passwordData.new) errors.new = "New password is required";
    if (passwordData.new.length < 8) errors.new = "Password must be at least 8 characters";
    if (passwordData.new !== passwordData.confirm) {
      errors.confirm = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setSaving(true);
    try {
      // await changePassword(passwordData);
      setPasswordData({ current: "", new: "", confirm: "" });
      showToast("Password changed successfully!");
    } catch (error) {
      showToast("Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  // Get role info
  const roleInfo = getRoleInfo(base.role);
  const RoleIcon = roleInfo.icon;

  // Check for unsaved changes
  const hasChanges =
    JSON.stringify(base) !== JSON.stringify(originalBase) ||
    JSON.stringify(roleData) !== JSON.stringify(originalRoleData) ||
    avatarFile !== null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-1">
          <Sidebar isOpen={isSidebarOpen} />
          <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
            <ProfileSkeleton />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} />

        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
            <p className="text-slate-500 mt-1">
              Manage your profile, security, and preferences
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 overflow-x-auto">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "security", label: "Security", icon: Lock },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-24" />
                <div className="px-6 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                    <ProfileAvatar
                      name={base.name}
                      image={base.avatar}
                      size="xl"
                      editable={editMode}
                      onImageChange={setAvatarFile}
                    />
                    <div className="flex-1 pt-4 sm:pt-8">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-slate-900">
                              {base.name}
                            </h2>
                            {base.isVerified && (
                              <BadgeCheck className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                          <p className="text-slate-500">{base.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                                roleInfo.color
                              )}
                            >
                              <RoleIcon className="w-3.5 h-3.5" />
                              {roleInfo.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              Member since {formatDate(base.createdAt)}
                            </span>
                          </div>
                        </div>

                        {!editMode ? (
                          <button
                            type="button"
                            onClick={() => setEditMode(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleCancel}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSave}
                              disabled={saving || !hasChanges}
                              className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 font-medium rounded-xl transition-colors",
                                hasChanges
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                              )}
                            >
                              {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              Save Changes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Account Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SectionCard
                  title="Account Overview"
                  description="Your activity summary"
                  icon={Clock}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      icon={Calendar}
                      label="Member Since"
                      value={formatDate(base.createdAt)}
                    />
                    <StatCard
                      icon={Clock}
                      label="Last Login"
                      value={formatDate(base.lastLogin)}
                    />
                    <StatCard
                      icon={Home}
                      label="Properties"
                      value={roleData.propertiesCount || 0}
                      subtext="Listed properties"
                    />
                    <StatCard
                      icon={Bell}
                      label="Notifications"
                      value={roleData.unreadNotifications || 0}
                      subtext="Unread messages"
                    />
                  </div>
                </SectionCard>
              </motion.div>

              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SectionCard
                  title="Personal Information"
                  description="Your basic profile details"
                  icon={User}
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Full Name"
                      value={base.name}
                      onChange={(v) => setBase({ ...base, name: v })}
                      disabled={!editMode}
                      icon={User}
                      placeholder="Enter your full name"
                      required
                    />

                    <FormField
                      label="Email Address"
                      value={base.email}
                      disabled
                      icon={Mail}
                      helperText="Email cannot be changed"
                    />

                    <FormField
                      label="Phone Number"
                      value={base.phone}
                      onChange={(v) => setBase({ ...base, phone: v })}
                      disabled={!editMode}
                      icon={Phone}
                      placeholder="+91 98765 43210"
                    />

                    <FormField
                      label="Location"
                      value={roleData.city || roleData.location}
                      onChange={(v) => setRoleData({ ...roleData, city: v })}
                      disabled={!editMode}
                      icon={MapPin}
                      placeholder="Your city"
                    />
                  </div>
                </SectionCard>
              </motion.div>

              {/* Role-specific Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SectionCard
                  title="Business Information"
                  description={`Details specific to your ${roleInfo.label.toLowerCase()} account`}
                  icon={Building2}
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {base.role === "pgowner" && (
                      <>
                        <FormField
                          label="PG Name"
                          value={roleData.pgName}
                          onChange={(v) => setRoleData({ ...roleData, pgName: v })}
                          disabled={!editMode}
                          icon={Home}
                          placeholder="Your PG name"
                        />
                        <FormField
                          label="Business Address"
                          value={roleData.businessAddress}
                          onChange={(v) =>
                            setRoleData({ ...roleData, businessAddress: v })
                          }
                          disabled={!editMode}
                          icon={MapPin}
                          placeholder="Business address"
                        />
                      </>
                    )}

                    {base.role === "messowner" && (
                      <>
                        <FormField
                          label="Mess Name"
                          value={roleData.messName}
                          onChange={(v) => setRoleData({ ...roleData, messName: v })}
                          disabled={!editMode}
                          icon={UtensilsCrossed}
                          placeholder="Your mess name"
                        />
                        <FormField
                          label="Business Address"
                          value={roleData.businessAddress}
                          onChange={(v) =>
                            setRoleData({ ...roleData, businessAddress: v })
                          }
                          disabled={!editMode}
                          icon={MapPin}
                          placeholder="Business address"
                        />
                      </>
                    )}

                    {base.role === "tenant" && (
                      <>
                        <FormField
                          label="Preferred City"
                          value={roleData.preferredCity}
                          onChange={(v) =>
                            setRoleData({ ...roleData, preferredCity: v })
                          }
                          disabled={!editMode}
                          icon={MapPin}
                          placeholder="Where are you looking?"
                        />
                        <FormField
                          label="Occupation"
                          value={roleData.occupation}
                          onChange={(v) => setRoleData({ ...roleData, occupation: v })}
                          disabled={!editMode}
                          icon={Building2}
                          placeholder="Student / Professional"
                        />
                      </>
                    )}
                  </div>
                </SectionCard>
              </motion.div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SectionCard
                  title="Change Password"
                  description="Update your password regularly for security"
                  icon={Lock}
                >
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <FormField
                          label="Current Password"
                          type="password"
                          value={passwordData.current}
                          onChange={(v) =>
                            setPasswordData({ ...passwordData, current: v })
                          }
                          icon={Lock}
                          placeholder="Enter current password"
                          error={passwordErrors.current}
                          required
                        />
                      </div>
                      <FormField
                        label="New Password"
                        type="password"
                        value={passwordData.new}
                        onChange={(v) =>
                          setPasswordData({ ...passwordData, new: v })
                        }
                        icon={Lock}
                        placeholder="Enter new password"
                        error={passwordErrors.new}
                        helperText="Minimum 8 characters"
                        required
                      />
                      <FormField
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirm}
                        onChange={(v) =>
                          setPasswordData({ ...passwordData, confirm: v })
                        }
                        icon={Lock}
                        placeholder="Confirm new password"
                        error={passwordErrors.confirm}
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        Update Password
                      </button>
                    </div>
                  </form>
                </SectionCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SectionCard
                  title="Security Actions"
                  description="Manage your account security"
                  icon={Shield}
                >
                  <div className="space-y-3">
                    <QuickAction
                      icon={LogOut}
                      label="Sign Out Everywhere"
                      description="Sign out from all devices"
                      onClick={() => {}}
                    />
                    <QuickAction
                      icon={Trash2}
                      label="Delete Account"
                      description="Permanently delete your account and data"
                      onClick={() => {}}
                      variant="danger"
                    />
                  </div>
                </SectionCard>
              </motion.div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SectionCard
                  title="Notifications"
                  description="Manage how you receive updates"
                  icon={Bell}
                >
                  <div className="space-y-4">
                    {[
                      {
                        label: "Email Notifications",
                        description: "Receive updates via email",
                      },
                      {
                        label: "SMS Notifications",
                        description: "Get SMS alerts for important updates",
                      },
                      {
                        label: "Push Notifications",
                        description: "Browser push notifications",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{item.label}</p>
                          <p className="text-sm text-slate-500">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SectionCard
                  title="Quick Actions"
                  description="Manage your account"
                  icon={Settings}
                >
                  <div className="space-y-3">
                    <QuickAction
                      icon={HelpCircle}
                      label="Help & Support"
                      description="Get help with your account"
                      onClick={() => {}}
                    />
                    <QuickAction
                      icon={FileText}
                      label="Terms & Privacy"
                      description="Read our terms and privacy policy"
                      onClick={() => {}}
                    />
                    <QuickAction
                      icon={LogOut}
                      label="Sign Out"
                      description="Sign out of your account"
                      onClick={() => {}}
                    />
                  </div>
                </SectionCard>
              </motion.div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;