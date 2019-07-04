# cocos creator 中使用 mobx 的一个工具
yarn install mobx-cocos
## 使用说明
@observer 注解的 cc.Component 类
#### Example
```ts
// store.ts
import { observable } from "mobx";

class Store {
  @observable public doing = false
}
export const store = new Store
```
```ts
// ChangeStoreComponent.ts
import { store } from "./store";
import { action } from "mobx";
const { ccclass, property } = cc._decorator;
@ccclass
export default class ChangeStoreComponent extends cc.Component {
  @property(cc.Node)
  private node0: cc.Node | null = null;
  @property(cc.Node)
  private node1: cc.Node | null = null;
  protected onLoad(){
    this.node0!.on(cc.Node.EventType.TOUCH_END, this.onClick0);
    this.node1!.on(cc.Node.EventType.TOUCH_END, this.onClick0);
  }
  @action private onClick0(){ store.doing = true; }
  @action private onClick1(){ store.doing = false; }
}
```
```ts
// ShowDoingComponent.ts
import { observer, render } from "cocos-mobx";
const { ccclass, property } = cc._decorator;

@ccclass
@observer
export default class ShowDoingComponent extends cc.Component {
  @property(cc.Label)
  private label: cc.Label | null = null;
  @render protected renderDoing(){
    if (store.doing) {
      this.label!.string = "doing: true, time:" + new Date().toString();
    } else {
      this.label!.string = "doing: false, time:" + new Date().toString();
    }
  }
}
```
