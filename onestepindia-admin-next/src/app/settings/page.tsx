"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

interface SettingsForm {
  siteName: string;
  adminEmail: string;
  notifications: {
    email: boolean;
    push: boolean;
    orders: boolean;
    fraud: boolean;
  };
  timezone: string;
  currency: string;
  language: string;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<SettingsForm>({
    siteName: "OneStepIndia",
    adminEmail: "admin@onestepindia.com",
    notifications: {
      email: true,
      push: true,
      orders: true,
      fraud: true,
    },
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "en",
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Settings saved:", settings);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ ...settings, theme }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          if (importedSettings.theme) {
            setTheme(importedSettings.theme);
          }
        } catch (error) {
          console.error("Error importing settings:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your admin portal preferences and system settings
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn btn-outline btn-sm">
            <Download className="h-4 w-4" />
            Export
          </button>
          <label className="btn btn-outline btn-sm cursor-pointer">
            <Upload className="h-4 w-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="btn btn-primary btn-sm"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Settings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <h3 className="card-title">General</h3>
            </div>
            <p className="card-description">
              Basic site configuration and preferences
            </p>
          </div>
          <div className="card-content space-y-4">
            <div className="form-group">
              <label className="form-label">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) =>
                  setSettings({ ...settings, adminEmail: e.target.value })
                }
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Theme</label>
              <select
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value as "light" | "dark" | "system")
                }
                className="input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) =>
                  setSettings({ ...settings, timezone: e.target.value })
                }
                className="input"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
                className="input"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Language</label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings({ ...settings, language: e.target.value })
                }
                className="input"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              <h3 className="card-title">Notifications</h3>
            </div>
            <p className="card-description">
              Configure notification preferences
            </p>
          </div>
          <div className="card-content space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        email: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                />
                <span className="text-sm font-medium">Email Notifications</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        push: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                />
                <span className="text-sm font-medium">Push Notifications</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.notifications.orders}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        orders: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                />
                <span className="text-sm font-medium">New Order Alerts</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.notifications.fraud}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        fraud: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                />
                <span className="text-sm font-medium">
                  Fraud Detection Alerts
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              <h3 className="card-title">Security</h3>
            </div>
            <p className="card-description">
              Security and authentication settings
            </p>
          </div>
          <div className="card-content space-y-4">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 interactive"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="input"
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="input"
                placeholder="Confirm new password"
              />
            </div>

            <div className="pt-4">
              <button className="btn btn-destructive btn-sm w-full">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            <h3 className="card-title">System Information</h3>
          </div>
          <p className="card-description">
            Current system status and version information
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Platform Version
                </span>
                <span className="text-sm font-medium">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Database
                </span>
                <span className="text-sm font-medium">MySQL 8.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last Backup
                </span>
                <span className="text-sm font-medium">2 hours ago</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Active Users
                </span>
                <span className="text-sm font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total Orders
                </span>
                <span className="text-sm font-medium">5,892</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  System Status
                </span>
                <span className="text-sm font-medium text-green-600">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
