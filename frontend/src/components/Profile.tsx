import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, User } from "lucide-react";
import './profile.css';


const Profile: React.FC = () => {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Unauthorized or failed to fetch');

        const data = await res.json();
        setFirstName(data.user.firstname);
        setLastName(data.user.lastname);
        setEmail(data.user.email);
      } catch (error) {
        setStatus('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname,
          lastname,
          password: password || undefined, // Optional
        }),
      });

      if (!res.ok) throw new Error('Update failed');

      setStatus('✅ Profile updated successfully!');
      setPassword('');
    } catch (error) {
      setStatus('❌ Failed to update profile.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">My Profile</h2>
        {status && (
          <div
            className={`text-center mb-4 py-2 px-4 rounded text-sm font-medium ${
              status.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {status}
          </div>
        )}
        <form onSubmit={handleUpdate} className="space-y-4">
      
          <div>
            <label className="block text-sm mb-1 font-medium">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">Last Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">New Password (optional)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button className="w-full" type="submit">
            Update Profile
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
