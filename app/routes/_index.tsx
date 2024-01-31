import { trpc } from "~/app/utils/trpc";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { trpcLoader } from "~/server/trpc/router";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const loader = await trpcLoader(args);
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: [["todo"], { type: "query" }],
    queryFn: () => loader.todo(),
  });

  return json({ dehydratedState: dehydrate(queryClient) });
}

export default function PageRoute() {
  const { dehydratedState } = useLoaderData<typeof loader>();
  return (
    <HydrationBoundary state={dehydratedState}>
      <Page />
    </HydrationBoundary>
  );
}

function Page() {
  const query = trpc.hooks.todo.useQuery();
  const mutation = trpc.hooks.addTodo.useMutation();
  trpc.hooks.onTodo.useSubscription(undefined, {
    onError(err) {
      console.log(err);
    },
    onData(data) {
      console.log(data);
    },
  });

  return (
    <div className="bg-slate-500">
      <h1>Ready to build something?</h1>
      <ul>
        <li>{query.data ?? "..."}</li>
        <li>
          <button onClick={() => mutation.mutate()}>Add Todo</button>
        </li>
      </ul>
    </div>
  );
}
