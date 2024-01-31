import { dehydrate, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useInspectHydration() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = setInterval(() => {
      console.log("DEHYDRATE STATE");
      console.log(dehydrate(queryClient));
    }, 1000);

    return () => clearInterval(id);
  }, [queryClient]);
}
