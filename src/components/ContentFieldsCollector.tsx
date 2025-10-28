import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "email" | "tel";
  placeholder: string;
  required?: boolean;
}

interface ContentFieldsCollectorProps {
  contentType: string;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

const fieldsByType: Record<string, FieldConfig[]> = {
  blog: [
    { name: "topic", label: "Main Topic", type: "text", placeholder: "e.g., AI in Healthcare", required: true },
    { name: "targetAudience", label: "Target Audience", type: "text", placeholder: "e.g., Healthcare professionals" },
    { name: "keyPoints", label: "Key Points to Cover", type: "textarea", placeholder: "List main points you want covered" },
  ],
  email: [
    { name: "recipientName", label: "Recipient Name", type: "text", placeholder: "John Smith" },
    { name: "senderName", label: "Your Name", type: "text", placeholder: "Jane Doe", required: true },
    { name: "subject", label: "Subject", type: "text", placeholder: "Meeting Request", required: true },
    { name: "purpose", label: "Purpose", type: "textarea", placeholder: "What's the main goal of this email?", required: true },
  ],
  letter: [
    { name: "senderName", label: "Your Full Name", type: "text", placeholder: "John Doe", required: true },
    { name: "senderAddress", label: "Your Address", type: "text", placeholder: "123 Main St, City, State ZIP" },
    { name: "senderPhone", label: "Your Phone", type: "tel", placeholder: "+1 234 567 8900" },
    { name: "senderEmail", label: "Your Email", type: "email", placeholder: "john@example.com" },
    { name: "recipientName", label: "Recipient Name", type: "text", placeholder: "Jane Smith", required: true },
    { name: "recipientTitle", label: "Recipient Title", type: "text", placeholder: "Hiring Manager" },
    { name: "companyName", label: "Company Name", type: "text", placeholder: "ABC Corporation" },
    { name: "recipientAddress", label: "Recipient Address", type: "text", placeholder: "456 Business Ave, City, State ZIP" },
    { name: "purpose", label: "Purpose of Letter", type: "textarea", placeholder: "What is this letter about?", required: true },
  ],
  resume: [
    { name: "fullName", label: "Full Name", type: "text", placeholder: "John Doe", required: true },
    { name: "email", label: "Email", type: "email", placeholder: "john@example.com", required: true },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+1 234 567 8900", required: true },
    { name: "location", label: "Location", type: "text", placeholder: "New York, NY", required: true },
    { name: "jobTitle", label: "Target Job Title", type: "text", placeholder: "Senior Software Engineer", required: true },
    { name: "experience", label: "Work Experience", type: "textarea", placeholder: "List your work history with company names, roles, and achievements", required: true },
    { name: "education", label: "Education", type: "textarea", placeholder: "Your degrees, schools, and graduation years", required: true },
    { name: "skills", label: "Skills", type: "textarea", placeholder: "Technical and soft skills", required: true },
  ],
  essay: [
    { name: "topic", label: "Essay Topic", type: "text", placeholder: "The Impact of Social Media on Democracy", required: true },
    { name: "thesisStatement", label: "Thesis Statement", type: "textarea", placeholder: "Your main argument or position", required: true },
    { name: "keyArguments", label: "Key Arguments", type: "textarea", placeholder: "Main points that support your thesis" },
    { name: "sources", label: "Sources/References", type: "textarea", placeholder: "List sources you want cited or referenced" },
  ],
  marketing: [
    { name: "productName", label: "Product/Service Name", type: "text", placeholder: "Premium Coffee Subscription", required: true },
    { name: "targetAudience", label: "Target Audience", type: "text", placeholder: "Coffee enthusiasts aged 25-45", required: true },
    { name: "keyBenefits", label: "Key Benefits", type: "textarea", placeholder: "What problems does it solve? What value does it provide?", required: true },
    { name: "callToAction", label: "Call to Action", type: "text", placeholder: "Sign up today", required: true },
    { name: "uniqueValue", label: "Unique Value Proposition", type: "textarea", placeholder: "What makes this different from competitors?" },
  ],
};

export const ContentFieldsCollector = ({ contentType, values, onChange }: ContentFieldsCollectorProps) => {
  const fields = fieldsByType[contentType] || [];

  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-3">Content Details</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Provide specific information to generate personalized content instead of generic placeholders
        </p>
      </div>
      
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label} {field.required && <span className="text-destructive">*</span>}
          </Label>
          {field.type === "textarea" ? (
            <Textarea
              id={field.name}
              value={values[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className="resize-none"
            />
          ) : (
            <Input
              id={field.name}
              type={field.type}
              value={values[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
          )}
        </div>
      ))}
    </div>
  );
};
