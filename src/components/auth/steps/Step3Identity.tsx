import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SignupData } from "../SignupFlow";

interface Step3Props {
  data: SignupData;
  updateData: (data: Partial<SignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PERSONA_OPTIONS = [
  "Undergrad Student",
  "Postgrad Student",
  "Drop Learner",
  "Self Learner",
  "Exam Aspirant",
  "Working Professional",
  "Gap Year Student",
  "Competitive Programmer",
  "Research Aspirant",
  "Other"
];

export const Step3Identity = ({ data, updateData, onNext, onBack }: Step3Props) => {
  const handleNext = () => {
    if (!data.persona) return;
    if (data.persona === "Other" && !data.personaOther) return;
    onNext();
  };

  const isValid = data.persona && (data.persona !== "Other" || data.personaOther);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl rounded-3xl bg-white">
        <button
          onClick={onBack}
          className="flex items-center text-primary mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <Link to="/" className="text-4xl font-bold text-primary text-center block mb-2">
          Twindle
        </Link>
        <p className="text-center text-muted-foreground mb-2">What best describes you?</p>
        <p className="text-center text-sm text-muted-foreground mb-8">Step 3 of 5</p>

        <div className="space-y-6">
          <div>
            <Label htmlFor="persona" className="text-sm font-medium">
              Identity *
            </Label>
            <Select 
              value={data.persona} 
              onValueChange={(value) => {
                updateData({ persona: value });
                if (value !== "Other") {
                  updateData({ personaOther: "" });
                }
              }}
              required
            >
              <SelectTrigger className="rounded-xl h-12 mt-2 border-gray-200">
                <SelectValue placeholder="Select what describes you best" />
              </SelectTrigger>
              <SelectContent>
                {PERSONA_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.persona === "Other" && (
            <div>
              <Label htmlFor="personaOther" className="text-sm font-medium">
                Please specify *
              </Label>
              <Input
                id="personaOther"
                type="text"
                placeholder="Enter your identity"
                className="rounded-xl h-12 mt-2 border-gray-200"
                value={data.personaOther}
                onChange={(e) => updateData({ personaOther: e.target.value })}
                required
              />
            </div>
          )}

          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="w-full rounded-xl h-12 bg-gradient-to-r from-[#4A77FF] to-[#5DA8FF] hover:opacity-90 transition-opacity text-white font-medium disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};
