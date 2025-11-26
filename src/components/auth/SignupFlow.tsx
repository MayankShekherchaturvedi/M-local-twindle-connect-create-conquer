import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Step1AccountDetails } from "./steps/Step1AccountDetails";
import { Step2PersonalDetails } from "./steps/Step2PersonalDetails";
import { Step3Identity } from "./steps/Step3Identity";
import { Step4Organization } from "./steps/Step4Organization";
import { Step5Domain } from "./steps/Step5Domain";

export interface SignupData {
  username: string;
  email: string;
  password: string;
  age: string;
  gender: string;
  hobbies: string;
  interests: string;
  persona: string;
  personaOther?: string;
  organization: string;
  domain: string;
  domainOther?: string;
  specialization: string;
  specializationOther?: string;
}

export const SignupFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [signupData, setSignupData] = useState<SignupData>({
    username: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    hobbies: "",
    interests: "",
    persona: "",
    personaOther: "",
    organization: "",
    domain: "",
    domainOther: "",
    specialization: "",
    specializationOther: ""
  });

  const updateData = (data: Partial<SignupData>) => {
    setSignupData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleCompleteSignup = async () => {
    setLoading(true);

    try {
      // Final validation
      if (!signupData.username || !signupData.email || !signupData.password) {
        toast({
          title: "Missing required fields",
          description: "Please complete all required fields",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Password validation
      if (signupData.password.length < 8) {
        toast({
          title: "Weak password",
          description: "Password must be at least 8 characters",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Prepare final persona and domain values
      const finalPersona = signupData.persona === "Other" && signupData.personaOther 
        ? signupData.personaOther 
        : signupData.persona;

      const finalDomain = signupData.domain === "Others" && signupData.domainOther
        ? signupData.domainOther
        : signupData.domain;

      const finalSpecialization = signupData.domain === "Others" && signupData.specializationOther
        ? signupData.specializationOther
        : signupData.specialization;

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: signupData.username,
            full_name: signupData.username,
            age: signupData.age,
            gender: signupData.gender,
            persona: finalPersona,
            organization: signupData.organization,
            domain: finalDomain,
            branch: finalSpecialization
          }
        }
      });

      if (signUpError) {
        toast({
          title: "Signup failed",
          description: signUpError.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast({
          title: "Signup failed",
          description: "Could not create user account",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Update profile with additional data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: signupData.username,
          hobbies: signupData.hobbies,
          persona: finalPersona,
          organization: signupData.organization,
          domain: finalDomain,
          specialization: finalSpecialization,
          branch: finalSpecialization,
          college: signupData.organization
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      // Add interests
      if (signupData.interests) {
        const interestsArray = signupData.interests.split(',').map(i => i.trim()).filter(i => i);
        for (const interest of interestsArray) {
          await supabase.from('interests').insert({
            user_id: authData.user.id,
            interest_name: interest
          });
        }
      }

      // Add hobbies as skills for backward compatibility
      if (signupData.hobbies) {
        const hobbiesArray = signupData.hobbies.split(',').map(h => h.trim()).filter(h => h);
        for (const hobby of hobbiesArray) {
          await supabase.from('skills').insert({
            user_id: authData.user.id,
            skill_name: hobby
          });
        }
      }

      setLoading(false);
      toast({
        title: "Account created successfully!",
        description: `Welcome to Twindle, ${signupData.username}!`
      });
      navigate("/");
    } catch (error: any) {
      setLoading(false);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {currentStep === 1 && (
        <Step1AccountDetails
          data={signupData}
          updateData={updateData}
          onNext={nextStep}
        />
      )}
      {currentStep === 2 && (
        <Step2PersonalDetails
          data={signupData}
          updateData={updateData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 3 && (
        <Step3Identity
          data={signupData}
          updateData={updateData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 4 && (
        <Step4Organization
          data={signupData}
          updateData={updateData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === 5 && (
        <Step5Domain
          data={signupData}
          updateData={updateData}
          onBack={prevStep}
          onComplete={handleCompleteSignup}
          loading={loading}
        />
      )}
    </>
  );
};
