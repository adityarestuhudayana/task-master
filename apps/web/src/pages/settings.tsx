import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileSchema, changePasswordSchema, type ProfileValues, type ChangePasswordValues } from "@/lib/validators"
import { useCurrentUser, useUpdateProfile, useChangePassword, useLogout } from "@/hooks/use-auth"
import { LogOut, Camera } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"

export function SettingsPage() {
    const { data: user } = useCurrentUser()
    const updateProfile = useUpdateProfile()
    const changePassword = useChangePassword()
    const logout = useLogout()
    const navigate = useNavigate()

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        reset: resetProfile,
        setValue: setProfileValue,
        watch: watchProfile,
        formState: { errors: profileErrors },
    } = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { displayName: user?.name || "", email: user?.email || "" },
    })

    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const watchedImage = watchProfile("image")

    // Sync form with user data when it loads
    useEffect(() => {
        if (user) {
            resetProfile({
                displayName: user.name || "",
                email: user.email || "",
                image: user.image || "",
            })
        }
    }, [user, resetProfile])

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 1024 * 1024) {
            setStatus({ type: "error", message: "Image must be smaller than 1MB" })
            return
        }

        try {
            setIsUploading(true)
            setStatus(null)

            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default")

            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo"
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData,
            })

            const data = await res.json()
            if (data.secure_url) {
                setProfileValue("image", data.secure_url, { shouldDirty: true })
            }
        } catch (err) {
            setStatus({ type: "error", message: "Failed to upload image" })
        } finally {
            setIsUploading(false)
        }
    }



    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { errors: passwordErrors },
    } = useForm<ChangePasswordValues>({
        resolver: zodResolver(changePasswordSchema),
    })

    const onProfileSave = async (data: ProfileValues) => {
        try {
            setStatus(null)
            await updateProfile.mutateAsync(data)
            setStatus({ type: "success", message: "Profile updated successfully!" })
            // Auto hide success message after 3 seconds
            setTimeout(() => setStatus(null), 3000)
        } catch (err) {
            setStatus({ type: "error", message: "Failed to update profile. Please try again." })
        }
    }

    const onPasswordChange = async (data: ChangePasswordValues) => {
        try {
            setPasswordStatus(null)
            await changePassword.mutateAsync({ currentPassword: data.currentPassword, newPassword: data.newPassword })
            setPasswordStatus({ type: "success", message: "Password updated successfully!" })
            resetPassword()
            setTimeout(() => setPasswordStatus(null), 3000)
        } catch (err: any) {
            console.error(err)
            const errorMessage = err.response?.data?.message || err.message || "Failed to change password. Please check your current password."
            setPasswordStatus({ type: "error", message: errorMessage })
        }
    }

    const onLogout = async () => {
        await logout.mutateAsync()
        navigate("/login")
    }

    return (
        <div className="flex flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
            {/* Main Content */}
            <main className="flex-1 flex flex-col gap-8">
                {/* Profile Section */}
                <form
                    onSubmit={handleProfileSubmit(onProfileSave)}
                    className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
                >
                    <div className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Update your personal information.</p>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* Avatar */}
                        <div className="flex items-center gap-6">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-3xl font-bold border-4 border-white dark:border-surface-dark shadow-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    {watchedImage ? (
                                        <img src={watchedImage} alt={user?.name} className="h-full w-full object-cover" />
                                    ) : (
                                        user?.name
                                            ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                                            : "??"
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full disabled:opacity-100"
                                >
                                    {isUploading ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Camera className="w-8 h-8" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</span>
                                <input
                                    {...registerProfile("displayName")}
                                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white py-3 px-4 outline-none focus:ring-2 focus:ring-primary transition-shadow w-full"
                                />
                                {profileErrors.displayName && (
                                    <span className="text-xs text-red-500">{profileErrors.displayName.message}</span>
                                )}
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</span>
                                <input
                                    type="email"
                                    {...registerProfile("email")}
                                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white py-3 px-4 outline-none focus:ring-2 focus:ring-primary transition-shadow w-full"
                                />
                                {profileErrors.email && (
                                    <span className="text-xs text-red-500">{profileErrors.email.message}</span>
                                )}
                            </label>
                        </div>

                        {status && (
                            <div className={`p-4 rounded-lg text-sm font-medium ${status.type === "success"
                                ? "bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400 border border-green-100 dark:border-green-900/20"
                                : "bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400 border border-red-100 dark:border-red-900/20"
                                }`}>
                                {status.message}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-4 mt-8">
                        <button type="button" className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateProfile.isPending}
                            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium shadow-sm shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updateProfile.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>

                {/* Change Password */}
                <form
                    onSubmit={handlePasswordSubmit(onPasswordChange)}
                    className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                    </div>
                    <div className="grid grid-cols-1 max-w-2xl gap-6">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</span>
                            <input
                                type="password"
                                {...registerPassword("currentPassword")}
                                placeholder="••••••••••••"
                                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white py-3 px-4 outline-none focus:ring-2 focus:ring-primary transition-shadow w-full"
                            />
                            {passwordErrors.currentPassword && (
                                <span className="text-xs text-red-500">{passwordErrors.currentPassword.message}</span>
                            )}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</span>
                                <input
                                    type="password"
                                    {...registerPassword("newPassword")}
                                    placeholder="••••••••••••"
                                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white py-3 px-4 outline-none focus:ring-2 focus:ring-primary transition-shadow w-full"
                                />
                                {passwordErrors.newPassword && (
                                    <span className="text-xs text-red-500">{passwordErrors.newPassword.message}</span>
                                )}
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</span>
                                <input
                                    type="password"
                                    {...registerPassword("confirmPassword")}
                                    placeholder="••••••••••••"
                                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white py-3 px-4 outline-none focus:ring-2 focus:ring-primary transition-shadow w-full"
                                />
                                {passwordErrors.confirmPassword && (
                                    <span className="text-xs text-red-500">{passwordErrors.confirmPassword.message}</span>
                                )}
                            </label>
                        </div>
                        {passwordStatus && (
                            <div className={`p-4 rounded-lg text-sm font-medium ${passwordStatus.type === "success"
                                ? "bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400 border border-green-100 dark:border-green-900/20"
                                : "bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400 border border-red-100 dark:border-red-900/20"
                                }`}>
                                {passwordStatus.message}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-4 mt-8">
                        <button disabled={changePassword.isPending} type="submit" className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium shadow-sm shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                            {changePassword.isPending ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>

                {/* Account Actions */}
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Actions</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account session and security.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-red-900 dark:text-red-400">Sign Out</h3>
                            <p className="text-sm text-red-700 dark:text-red-500/80">You'll need to sign back in to access your boards.</p>
                        </div>
                        <button
                            onClick={onLogout}
                            disabled={logout.isPending}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                        >
                            <LogOut className="w-4 h-4" />
                            {logout.isPending ? "Signing out..." : "Sign Out"}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
