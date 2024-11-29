import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonDataTable() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-[120px]" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-[200px]" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[50px]" />
            <Skeleton className="h-4 w-[50px]" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[50px]" />
              <Skeleton className="h-4 w-[50px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
