import {Utils} from "../_services/utils.service";

export class BasicSeiyuu {
  public _id: number;
  public name: string;
  public hits?: number;
  public count?: number;
  public updated: Date;
  public accessed?: Date;
  public namesakes: any[];

  constructor(obj) {
    let temp ={...obj,
        updated: new Date(obj.updated),
        accessed: obj.accessed && new Date(obj.accessed) || new Date(obj.updated)
      };
     this.upgrade(temp);
    }

  public get pending(): boolean {
    return !this['roles'] && !this.namesakes && !!this.name;
  };

  public get link(): string {
    return `//${Utils.theSite}/people/${this._id}`;
  }

  public upgrade(obj) {
    Object.keys(obj).forEach(key => {
      if (this[key] === undefined) this[key] = obj[key]
    });
  }

  protected get photo(): string {
    return this['pic'] && `//${Utils.theSite}/${this['pic']}`;
  }
  protected get thumb(): string {
    return this.photo && this.photo.replace('.jp', 'v.jp');
  }
}

export class Seiyuu extends BasicSeiyuu {

  private pic: string;
  private roles: {
    _id: number,
    name: string,
    main: boolean,
  }[];
  public l?:boolean;
  public c?:boolean;

  constructor(obj) {
    super(obj);
  }

}
