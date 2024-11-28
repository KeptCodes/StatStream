import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TopPage } from "@/hooks/useAnalyticsData";

export function TopPages({ data }: { data: TopPage[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Page</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Unique Visitors</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((page) => (
            <TableRow key={page.page}>
              <TableCell className="font-medium">{page.page}</TableCell>
              <TableCell className="text-right">
                {page.views.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {page.uniqueVisitors.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
