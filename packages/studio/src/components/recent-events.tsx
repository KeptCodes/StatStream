import { RecentEvent } from "@/hooks/useAnalyticsData";

export function RecentEvents({ events }: { events: RecentEvent[] }) {
  return (
    <div className="space-y-8">
      {events.map((event, idx) => (
        <div key={idx} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{event.name}</p>
            <p className="text-sm text-muted-foreground">{event.action}</p>
          </div>
          <div className="ml-auto font-medium">{event.timeAgo}</div>
        </div>
      ))}
      {events.map((event, idx) => (
        <div key={idx} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{event.name}</p>
            <p className="text-sm text-muted-foreground">{event.action}</p>
          </div>
          <div className="ml-auto font-medium">{event.timeAgo}</div>
        </div>
      ))}
      {events.map((event, idx) => (
        <div key={idx} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{event.name}</p>
            <p className="text-sm text-muted-foreground">{event.action}</p>
          </div>
          <div className="ml-auto font-medium">{event.timeAgo}</div>
        </div>
      ))}
    </div>
  );
}
