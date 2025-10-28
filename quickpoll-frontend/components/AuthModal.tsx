"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authApi, saveAuth } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AuthModalProps {
  open?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ open = true, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let authData;
      if (isLogin) {
        authData = await authApi.login(email, password);
      } else {
        if (!username.trim()) {
          setError("Username is required");
          setIsLoading(false);
          return;
        }
        authData = await authApi.register(username, email, password);
      }

      saveAuth(authData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#1C1C1C] border-[#323232] border-[1.5px]">
        <DialogHeader>
          <DialogTitle className="text-[#E6E6E6] text-2xl">
            {isLogin ? "Welcome back" : "Create an account"}
          </DialogTitle>
          <DialogDescription className="text-[#A4A4A4]">
            {isLogin
              ? "Enter your credentials to login and manage polls"
              : "Sign up to create and manage polls"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-[#E6E6E6]">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required={!isLogin}
                minLength={3}
                maxLength={50}
                className="bg-black border-[#323232] border-[1.5px] text-[#E6E6E6] placeholder:text-[#A4A4A4] focus-visible:border-white focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-[#E6E6E6]">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
              className="bg-black border-[#323232] border-[1.5px] text-[#E6E6E6] placeholder:text-[#A4A4A4] focus-visible:border-white focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-[#E6E6E6]">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              minLength={6}
              className="bg-black border-[#323232] border-[1.5px] text-[#E6E6E6] placeholder:text-[#A4A4A4] focus-visible:border-white focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="bg-red-500/10 border-red-500 text-red-500"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#34CC41] text-black hover:bg-[#2eb838] font-medium"
          >
            {isLoading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </Button>

          <div className="text-center text-sm">
            {isLogin ? (
              <p className="text-[#A4A4A4]">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                  className="text-[#34CC41] hover:text-[#2eb838] hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-[#A4A4A4]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                  className="text-[#34CC41] hover:text-[#2eb838] hover:underline font-medium"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
