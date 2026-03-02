import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-[420px] bg-card text-card-foreground border-border shadow-md rounded-xl mx-4 sm:mx-0">
      <CardHeader className="space-y-2 px-4 sm:px-6 pt-6">
        <p
          className="text-center text-base sm:text-lg font-semibold text-foreground font-[family-name:var(--font-heading)]"
          style={{ fontFamily: "var(--font-cinzel-decorative), Cinzel Decorative, serif" }}
        >
          BM Wood
        </p>
        <CardTitle 
          className="text-center text-xl sm:text-2xl font-[family-name:var(--font-heading)]" 
          style={{ fontFamily: "var(--font-cinzel-decorative), Cinzel Decorative, serif" }}
        >
          {title}
        </CardTitle>
        <CardDescription className="text-center text-sm sm:text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-6">{children}</CardContent>
    </Card>
  );
}
