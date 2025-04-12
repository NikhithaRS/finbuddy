import {
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import Link from 'next/link'; // For potential links
import ProtectedRoute from '@/components/ProtectedRoute';

export default function LearningHubPage() {
  // Placeholder data - replace with actual content sources later
  const learningResources = [
    {
      title: "Understanding Mutual Funds",
      description: "An introduction to mutual funds, how they work, and their types.",
      type: "Video",
      embedUrl: "https://www.youtube.com/embed/JUtes-k-VX4?si=ipuATYagI3rKC-wb" // Placeholder link
    },
    {
      title: "Understanding SIPs",
      description: "Learn about Systematic Investment Plans and their benefits.",
      type: "Video",
      embedUrl: "https://www.youtube.com/embed/Tv4pkivGvdU?si=h5mBgt8VK4hRqhSq" // Example embed URL (replace!)
    },
    {
      title: "Basics of Stock Market Investing",
      description: "Key concepts for beginners looking to invest in stocks.",
      type: "Video",
      embedUrl: "https://www.youtube.com/embed/A7fZp9dwELo?si=s2ZfRhHxYYgBr67H"
    },
     {
      title: "Debt vs Equity Investments",
      description: "Understanding the difference between debt and equity assets.",
      type: "Video",
      embedUrl: "https://www.youtube.com/embed/toUYmsUob4Y?si=rWUSm9ePsNFRM5h1"
    },
     {
      title: "Importance of Diversification",
      description: "Why spreading your investments is crucial for managing risk.",
      type: "Video",
      embedUrl: "https://www.youtube.com/embed/jg_MflByI3Y?si=K2sSZxVUACi2wj96" // Example embed URL (replace!)
    },
     {
      title: "Reading Financial Statements",
      description: "A beginner's guide to understanding balance sheets and income statements.",
      type: "Video",
      embedUrl: "https://www.youtube.com/embed/uEjKr_Z92mA?si=k8yfLJdiViRik7Zo"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Learning Hub</h1>
        <p className="text-muted-foreground">
          Expand your financial knowledge with these resources.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningResources.map((resource, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <CardTitle>{resource.title}</CardTitle>
                <CardDescription>{resource.type}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                {resource.type === 'Video' && resource.embedUrl && (
                  <div className="aspect-video overflow-hidden rounded">
                     {/* Basic iframe embed - consider a proper video player component later */}
                     <iframe 
                       width="100%" 
                       height="100%" 
                       src={resource.embedUrl} 
                       title={resource.title} 
                       frameBorder="0" 
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                       referrerPolicy="strict-origin-when-cross-origin" 
                       allowFullScreen>
                     </iframe>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {resource.type === 'Article' && (
                  <span className="text-sm text-muted-foreground">Article link not available</span>
                )}
                 {resource.type === 'Video' && (
                   <span className="text-sm text-muted-foreground">Watch Video Above</span>
                 )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
} 