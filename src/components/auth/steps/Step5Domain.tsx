import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SignupData } from "../SignupFlow";

interface Step5Props {
  data: SignupData;
  updateData: (data: Partial<SignupData>) => void;
  onBack: () => void;
  onComplete: () => void;
  loading: boolean;
}

const DOMAINS = [
  "Technology & Computing",
  "Engineering",
  "Design & Creative",
  "Business, Entrepreneurship & Startups",
  "Science & Research",
  "Medical & Healthcare",
  "Law & Public Policy",
  "Others"
];

const SPECIALIZATIONS: Record<string, string[]> = {
  "Technology & Computing": [
    "Computer Science",
    "AI/ML",
    "Data Science",
    "Software Engineering",
    "Cybersecurity",
    "Cloud Computing",
    "DevOps",
    "Full-stack Development",
    "Game Development",
    "Robotics",
    "IoT"
  ],
  "Engineering": [
    "Mechanical",
    "Electrical",
    "Civil",
    "Chemical",
    "Mechatronics",
    "Industrial",
    "Aerospace",
    "Automobile",
    "Environmental",
    "Petroleum"
  ],
  "Design & Creative": [
    "UI/UX",
    "Graphic Design",
    "Animation",
    "Game Design",
    "Architecture",
    "Interior Design",
    "Fashion Design",
    "Film/Media",
    "Music Production",
    "Visual Communication"
  ],
  "Business, Entrepreneurship & Startups": [
    "Entrepreneurship",
    "Business Administration",
    "Marketing",
    "Finance",
    "Operations",
    "Analytics"
  ],
  "Science & Research": [
    "Biotechnology",
    "Microbiology",
    "Biochemistry",
    "Physics Research",
    "Chemistry",
    "Bioinformatics",
    "Earth Science",
    "Space Science"
  ],
  "Medical & Healthcare": [
    "Medicine",
    "Nursing",
    "Biomedical Engineering",
    "Physiotherapy",
    "Public Health",
    "Dentistry"
  ],
  "Law & Public Policy": [
    "Law",
    "Public Policy",
    "Criminology",
    "International Law"
  ]
};

export const Step5Domain = ({ data, updateData, onBack, onComplete, loading }: Step5Props) => {
  const handleComplete = () => {
    if (!data.domain) return;
    if (data.domain === "Others" && (!data.domainOther || !data.specializationOther)) return;
    if (data.domain !== "Others" && !data.specialization) return;
    onComplete();
  };

  const isValid = 
    data.domain &&
    (data.domain === "Others" 
      ? (data.domainOther && data.specializationOther)
      : data.specialization);

  const currentSpecializations = data.domain && data.domain !== "Others" 
    ? SPECIALIZATIONS[data.domain] || [] 
    : [];

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
        <p className="text-center text-muted-foreground mb-2">Almost there!</p>
        <p className="text-center text-sm text-muted-foreground mb-8">Step 5 of 5</p>

        <div className="space-y-6">
          <div>
            <Label htmlFor="domain" className="text-sm font-medium">
              Domain *
            </Label>
            <Select 
              value={data.domain} 
              onValueChange={(value) => {
                updateData({ domain: value, specialization: "" });
                if (value !== "Others") {
                  updateData({ domainOther: "", specializationOther: "" });
                }
              }}
              required
            >
              <SelectTrigger className="rounded-xl h-12 mt-2 border-gray-200">
                <SelectValue placeholder="Select your domain" />
              </SelectTrigger>
              <SelectContent>
                {DOMAINS.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.domain === "Others" ? (
            <>
              <div>
                <Label htmlFor="domainOther" className="text-sm font-medium">
                  Specify Domain *
                </Label>
                <Input
                  id="domainOther"
                  type="text"
                  placeholder="Enter your domain"
                  className="rounded-xl h-12 mt-2 border-gray-200"
                  value={data.domainOther}
                  onChange={(e) => updateData({ domainOther: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="specializationOther" className="text-sm font-medium">
                  Specify Specialization *
                </Label>
                <Input
                  id="specializationOther"
                  type="text"
                  placeholder="Enter your specialization"
                  className="rounded-xl h-12 mt-2 border-gray-200"
                  value={data.specializationOther}
                  onChange={(e) => updateData({ specializationOther: e.target.value })}
                  required
                />
              </div>
            </>
          ) : data.domain ? (
            <div>
              <Label htmlFor="specialization" className="text-sm font-medium">
                Specialization *
              </Label>
              <Select 
                value={data.specialization} 
                onValueChange={(value) => updateData({ specialization: value })}
                required
              >
                <SelectTrigger className="rounded-xl h-12 mt-2 border-gray-200">
                  <SelectValue placeholder="Select your specialization" />
                </SelectTrigger>
                <SelectContent>
                  {currentSpecializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <Button
            onClick={handleComplete}
            disabled={!isValid || loading}
            className="w-full rounded-xl h-12 bg-gradient-to-r from-[#4A77FF] to-[#5DA8FF] hover:opacity-90 transition-opacity text-white font-medium disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Complete Signup"}
          </Button>
        </div>

        {data.domain && data.specialization && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-center text-muted-foreground">
              You'll be automatically joined to the <span className="font-semibold text-primary">{data.specialization}</span> community
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
