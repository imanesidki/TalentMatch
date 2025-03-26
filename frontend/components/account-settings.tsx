"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getUserProfile, updateUserProfile, updatePassword, UserData, ProfileUpdateData, PasswordUpdateData } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function AccountSettings() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Profile form state
  const [formData, setFormData] = useState<ProfileUpdateData>({
    firstname: '',
    lastname: '',
    email: ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordUpdateData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Get user data on component mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const userData = await getUserProfile();
        setUser(userData);
        setFormData({
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email
        });
      } catch (error) {
        console.error("Failed to fetch user data", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, []);
  
  // Generate initials from user data
  const getInitials = () => {
    if (user?.firstname && user?.lastname) {
      return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
    }
    return 'U';
  };
  
  // Handle profile form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === 'first-name' ? 'firstname' : id === 'last-name' ? 'lastname' : 'email']: value
    }));
  };
  
  // Handle password form input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [id === 'current-password' ? 'current_password' : 
       id === 'new-password' ? 'new_password' : 'confirm_password']: value
    }));
  };
  
  // Handle profile update submission
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only include changed fields
    const changedData: ProfileUpdateData = {};
    if (formData.firstname !== user?.firstname) changedData.firstname = formData.firstname;
    if (formData.lastname !== user?.lastname) changedData.lastname = formData.lastname;
    if (formData.email !== user?.email) changedData.email = formData.email;
    
    // If no changes, don't submit
    if (Object.keys(changedData).length === 0) {
      toast({
        title: "No changes",
        description: "No changes were made to your profile",
      });
      return;
    }
    
    setSaving(true);
    try {
      const updatedUser = await updateUserProfile(changedData);
      setUser(updatedUser);
      toast({
        title: "Success!",
        description: "Your profile has been updated successfully",
        variant: "default",
        className: "bg-secondary"
      });
      
      // Refresh the page to update the UI with new user data
      router.refresh();
    } catch (error) {
      console.error("Failed to update profile", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle password update submission
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password inputs
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }
    
    setChangingPassword(true);
    try {
      await updatePassword(passwordData);
      toast({
        title: "Success!",
        description: "Your password has been updated successfully",
        variant: "default",
        className: "bg-secondary"
      });
      
      // Reset password form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error("Failed to update password", error);
      toast({
        title: "Error",
        description: "Failed to update password. Please check your current password and try again.",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading user profile...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate}>
            <div className="space-y-6">

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input 
                    id="first-name" 
                    value={formData.firstname} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input 
                    id="last-name" 
                    value={formData.lastname} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="flex justify-end mt-6">
                <Button type="submit" className="px-10" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>

          <Separator className="my-10" />
          
          <form onSubmit={handlePasswordUpdate}>
            <div>
              <CardTitle className="mb-6 text-xl">Change Password</CardTitle>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password"
                    placeholder="* * * * * * * *"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    placeholder="* * * * * * * *"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    placeholder="* * * * * * * *"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="submit" className="px-10" disabled={changingPassword}>
                {changingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
