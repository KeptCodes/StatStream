import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TopReferrers({ data }: { data: TopReferrer[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Visits</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((referrer) => (
            <TableRow key={referrer.source}>
              <TableCell className="font-medium">{referrer.source}</TableCell>
              <TableCell className="text-right">
                {referrer.visits.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {referrer.percentage}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
