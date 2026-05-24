import { createFileRoute } from "@tanstack/react-router";
import { ActivityDetailView } from "@/components/ActivityDetailView";
import { useRole } from "@/lib/role";

export const Route = createFileRoute("/admin/activities/$activityId")({
  component: () => {
    const { activityId } = Route.useParams();
    const { isAdmin } = useRole();
    return <ActivityDetailView activityId={activityId} panel={isAdmin ? "admin" : "employee"} />;
  },
  head: ({ params }) => ({ meta: [{ title: `${params.activityId} · Activity` }] }),
});
