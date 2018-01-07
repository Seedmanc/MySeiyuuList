export class Seiyuu /*implements SeiyuuDB*/ {

  constructor(
    public _id: number,
    public name: string,
    public pic: string,
    public count: number,
    public hits: number,
    public l?:boolean,
    public c?:boolean
  ) {
  }
}

export interface SeiyuuDB {
  _id: number,
  name: string,
  pic: string,
  count: number,
  hits: number,
  roles: {
    name: string,
    main: boolean,
    _id: number
  }[],
  l?: boolean,
  updated: Date,
  accessed: Date
}

export interface BasicSeiyuu {
  _id?: number,
  name: string,
  hits?: number,
  count?: number,
  updated?: Date,
  accessed?: Date
}