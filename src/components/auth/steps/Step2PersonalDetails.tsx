import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SignupData } from "../SignupFlow";

interface Step2Props {
  data: SignupData;
  updateData: (data: Partial<SignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2PersonalDetails = ({ data, updateData, onNext, onBack }: Step2Props) => {
  const handleNext = () => {
    // All fields optional, can proceed
    onNext();
  };

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
        <p className="text-center text-muted-foreground mb-2">Tell us about yourself</p>
        <p className="text-center text-sm text-muted-foreground mb-8">Step 2 of 5</p>

        <div className="space-y-6">
          <div>
            <Label htmlFor="age" className="text-sm font-medium">
              Age
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              className="rounded-xl h-12 mt-2 border-gray-200"
              value={data.age}
              onChange={(e) => updateData({ age: e.target.value })}
              min="13"
              max="100"
            />
          </div>

          <div>
            <Label htmlFor="gender" className="text-sm font-medium">
              Gender
            </Label>
            <Select value={data.gender} onValueChange={(value) => updateData({ gender: value })}>
              <SelectTrigger className="rounded-xl h-12 mt-2 border-gray-200">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hobbies" className="text-sm font-medium">
              Hobbies
            </Label>
            <Input
              id="hobbies"
              type="text"
              placeholder="e.g., Reading, Gaming, Photography (comma-separated)"
              className="rounded-xl h-12 mt-2 border-gray-200"
              value={data.hobbies}
              onChange={(e) => updateData({ hobbies: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="interests" className="text-sm font-medium">
              Interests
            </Label>
            <Input
              id="interests"
              type="text"
              placeholder="e.g., AI, Startups, Music (comma-separated)"
              className="rounded-xl h-12 mt-2 border-gray-200"
              value={data.interests}
              onChange={(e) => updateData({ interests: e.target.value })}
            />
          </div>

          <Button
            onClick={handleNext}
            className="w-full rounded-xl h-12 bg-gradient-to-r from-[#4A77FF] to-[#5DA8FF] hover:opacity-90 transition-opacity text-white font-medium"
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};
