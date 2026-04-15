import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Video, ShoppingCart, FileQuestion, FlaskConical, Star, Award } from "lucide-react";

const PlaceholderPage = ({ title, icon: Icon, description }: { title: string; icon: any; description: string }) => (
  <AppLayout>
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground max-w-md">{description}</p>
          <Badge variant="secondary" className="mt-4">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
);

export const WhatsApp = () => <PlaceholderPage title="WhatsApp Integration" icon={MessageSquare} description="Send notifications, reminders, and announcements directly to parents and students via WhatsApp." />;
export const SMS = () => <PlaceholderPage title="SMS Services" icon={Mail} description="Send bulk SMS for attendance alerts, exam notifications, and fee reminders." />;
export const LiveClass = () => <PlaceholderPage title="Live Class" icon={Video} description="Conduct live online classes with screen sharing, chat, and recording features." />;
export const OnlineStore = () => <PlaceholderPage title="Online Store & POS" icon={ShoppingCart} description="Manage school merchandise, uniforms, and books with point-of-sale system." />;
export const QuestionPaper = () => <PlaceholderPage title="Question Paper Generator" icon={FileQuestion} description="Create and manage question papers with automatic question bank and paper generation." />;
export const ClassTests = () => <PlaceholderPage title="Class Tests" icon={FlaskConical} description="Manage daily class tests, quick assessments, and track student performance." />;
export const BehaviorSkills = () => <PlaceholderPage title="Behaviour & Skills" icon={Star} description="Track student behavior, skills development, and conduct reports." />;
export const Certificates = () => <PlaceholderPage title="Certificates" icon={Award} description="Generate and manage student certificates, transfer certificates, and bonafide certificates." />;
export const Messaging = () => <PlaceholderPage title="Messaging" icon={MessageSquare} description="Internal messaging system for communication between teachers, parents, and administration." />;
