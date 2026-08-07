import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/housing/listing/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/housing/$id",
      params: { id: params.id }
    });
  }
});
