
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType } from "./types";

export function useAuthProvider(): AuthContextType {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          const { 
            user: { id, email, user_metadata }
          } = data.session;
          
          setUser({
            id,
            name: user_metadata.name || email?.split('@')[0] || 'User',
            email: email || ''
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err: any) {
        console.error('Error checking auth session:', err);
        setError(err.message);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Check if the current URL has a confirmation hash for email verification
    const handleEmailConfirmation = async () => {
      if (window.location.hash.includes('#access_token')) {
        // Handle the redirect from email confirmation
        const { data, error } = await supabase.auth.getUser();
        if (data?.user) {
          toast.success("Email confirmed successfully! Please log in.");
          navigate('/login');
        }
        if (error) {
          toast.error("Failed to confirm email. Please try again.");
        }
      }
    };
    
    handleEmailConfirmation();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        
        if (session) {
          const { 
            user: { id, email, user_metadata }
          } = session;
          
          setUser({
            id,
            name: user_metadata.name || email?.split('@')[0] || 'User',
            email: email || ''
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast.success("Welcome back!");
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message);
      toast.error(err.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, check if the email already exists using profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', email)
        .maybeSingle();
      
      // Also check auth.users using a sign-in attempt (this is more reliable)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: 'check-if-exists-only' // We're just checking if the email exists
      });
      
      // If no error occurred during the sign-in attempt with random password, 
      // or if we got a specific error about wrong credentials (means user exists)
      // or if we found a user in the profiles table
      const userExists = !signInError || 
                         (signInError.message && signInError.message.includes('Invalid login credentials')) ||
                         existingProfile;
      
      if (userExists) {
        setError("This email is already registered. Please log in instead.");
        toast.error("This email is already registered. Please log in instead.");
        navigate('/login?email-exists=true');
        return null;
      }
      
      // If email doesn't exist, proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast.success("Account created! Please check your email for verification.");
        return { isNewAccount: true };
      }
      
      return null;
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message);
      toast.error(err.message || "Failed to create account");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("You've been logged out");
      navigate('/login');
    } catch (err: any) {
      console.error('Logout error:', err);
      toast.error(err.message || "Failed to log out");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    signup,
    logout
  };
}
