import { Share2, MessageCircle, Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
}

export const ShareDialog = ({ open, onOpenChange, title, content }: ShareDialogProps) => {
  const text = `${title}\n\n${content}`;
  const encodedText = encodeURIComponent(text);
  
  const shareUrls = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedText}`,
      color: "text-green-600 hover:text-green-700",
      bgColor: "bg-green-50 hover:bg-green-100"
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`,
      color: "text-blue-600 hover:text-blue-700",
      bgColor: "bg-blue-50 hover:bg-blue-100"
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
      color: "text-sky-600 hover:text-sky-700",
      bgColor: "bg-sky-50 hover:bg-sky-100"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      color: "text-blue-700 hover:text-blue-800",
      bgColor: "bg-blue-50 hover:bg-blue-100"
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}`,
      color: "text-gray-600 hover:text-gray-700",
      bgColor: "bg-gray-50 hover:bg-gray-100"
    },
  ];

  const handleShare = (url: string) => {
    window.open(url, "_blank", "width=600,height=400");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <DialogTitle>Share your content</DialogTitle>
          </div>
          <DialogDescription>
            Choose a platform to share your generated content
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          {shareUrls.map((platform) => (
            <Button
              key={platform.name}
              variant="outline"
              className={`h-auto py-4 flex flex-col gap-2 ${platform.bgColor} border-0`}
              onClick={() => handleShare(platform.url)}
            >
              <platform.icon className={`h-6 w-6 ${platform.color}`} />
              <span className="text-sm font-medium">{platform.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
