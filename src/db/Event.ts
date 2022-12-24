import { WithDocument } from "./Document";

export interface DATABASE_EVENTS<T> {
  delete: (doc: WithDocument<T>) => void;
  update: (oldDoc: WithDocument<T>, newDoc: WithDocument<T>) => void;
  create: (doc: WithDocument<T>) => void;
}

export class BaseEvent<T> {
  private _listeners: {
    [k in keyof DATABASE_EVENTS<T>]?: DATABASE_EVENTS<T>[k][];
  } = {};

  get listeners() {
    return { ...this._listeners };
  }

  on<K extends keyof DATABASE_EVENTS<T>>(event: K, cb: DATABASE_EVENTS<T>[K]) {
    const asEvent = this._listeners[event] || [];

    this._listeners[event as any] = [...asEvent, cb];
  }

  emit<K extends keyof DATABASE_EVENTS<T>>(
    event: K,
    ...args: Parameters<DATABASE_EVENTS<T>[K]>
  ): void {
    if (!(event in this._listeners) || !Array.isArray(this._listeners[event]))
      return;
    this._listeners[event]?.forEach((cb) => cb?.apply(null, args));
  }

  removeListeners(): void;
  removeListeners(forEvent: keyof DATABASE_EVENTS<T>): void;
  removeListeners(forEvent?: keyof DATABASE_EVENTS<T>): void {
    if (forEvent) {
      this._listeners[forEvent] = [];
    } else {
      this._listeners = {};
    }
  }
}
