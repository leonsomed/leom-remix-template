import PubSub from "pubsub-js";
import type { AppEvent } from "~/server/events";

type FindByType<Union, Type> = Union extends { type: Type } ? Union : never;

export const Events = {
  subscribe: <T extends AppEvent["type"]>(
    type: T,
    fn: (event: FindByType<AppEvent, T>) => void,
  ) => {
    return PubSub.subscribe(type, (_, data) => {
      fn(data);
    });
  },
  unsubscribe: (token: string) => {
    return PubSub.unsubscribe(token);
  },
  publish: (event: AppEvent) => {
    return PubSub.publish(event.type, event);
  },
};
