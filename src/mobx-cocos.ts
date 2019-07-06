// tslint:disable: variable-name
import { autorun, configure, IReactionDisposer, IReactionPublic, reaction } from "mobx";
configure({ enforceActions: "observed" });
export const observer = <T extends new (...args: any[]) => any>(Constructor: T) => {
  return class extends Constructor {
    public __disposer: IReactionDisposer[] = [];
    public __reaction?: string[];
    public __autorun?: string[];
    /**
     * 开始ob
     */
    public _observe() {
      const __disposer = this.__disposer;
      if (__disposer.length) { return; }
      const __autorun = this.__autorun;
      const __reaction = this.__reaction;
      if (__autorun) {
        __autorun.forEach((fn: string) => {
          const view = (this as any)[fn].bind(this);
          const disposer = autorun(view, { name: Constructor.name + "#" + fn });
          __disposer.push(disposer);
        });
      }
      if (__reaction) {
        __reaction.forEach((fn) => {
          const disposer = (this as any)[fn]();
          __disposer.push(disposer);
        });
      }
    }
    /**
     * 结束ob
     */
    public _dispose() {
      const __disposer = this.__disposer;
      if (__disposer.length) {
        __disposer.splice(0).forEach((x) => x());
      }
    }
    public onLoad() {
      if (super.onLoad && super.onLoad() === false) {
        return;
      }
      this._observe();
    }
    public onDestroy() {
      this._dispose();
      if (super.onDestroy) {
        super.onDestroy();
      }
    }
    public unuse() {
      if (super.unuse) {
        super.unuse();
      }
      this._dispose();
    }
    public reuse() {
      if (super.reuse) {
        super.reuse(...Array.prototype.slice.call(arguments, 0))
      }
      this._observe();
    }
  };
};

/**
 * 用来渲染
 */
export const render = (target: any, key: string, _: TypedPropertyDescriptor<() => void>) => {
  (target.__autorun || (target.__autorun = [])).push(key);
};

/**
 * 和reactor搭配进行副作用操作
 */
export function react<T>(
  expression: (r: IReactionPublic) => T,
  effect: (arg: T, r: IReactionPublic) => void,
): IReactionDisposer {
  return reaction(expression, effect, { fireImmediately: true });
}

export function reactor(
  target: any,
  key: string,
  descriptor: TypedPropertyDescriptor<() => IReactionDisposer>,
): void;
export function reactor<T>(expression: (r: IReactionPublic) => T): (
  target: any,
  key: string,
  descriptor: TypedPropertyDescriptor<(arg: T) => void>,
) => void;
export function reactor() {
  if (arguments.length === 3) {
    return reactorArg3(arguments[0], arguments[1], arguments[2]);
  } else {
    return reactorArg1(arguments[0]);
  }
}

function reactorArg3(target: any, key: string, _: TypedPropertyDescriptor<() => IReactionDisposer>) {
  (target.__reaction || (target.__reaction = [])).push(key);
}

function reactorArg1<T>(expression: (r: IReactionPublic) => T) {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<(arg: T) => void>) => {
    (target.__reaction || (target.__reaction = [])).push(key);
    const value = descriptor.value as (arg: T) => void;
    descriptor.value = function () {
      return reaction(expression, value.bind(this), { fireImmediately: true });
    };
  };
}
