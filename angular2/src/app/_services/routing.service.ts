import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {Utils} from "./utils.service";
import {Subject} from "rxjs/Subject";
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';

@Injectable()
export class RoutingService {
  routeId$: Subject<number[]> = new Subject();
  paramMap$ = new Subject<any>();
  tab$ = new Subject<string>();

  private tab: string = '';

  constructor(private router: Router) {
   this.router.events
     .filter(e => e instanceof NavigationEnd)                                                             .do(Utils.lg('tab'))
     .map((e: any) => e.urlAfterRedirects.split('/')[1])
     .do(t => this.tab = t)
     .subscribe(this.tab$);

    this.paramMap$                                                                                         .do(Utils.log('paramMap'))
     .map(params => (params.get('ids')||''))
     .distinctUntilChanged()
     .map(ids => ids.split(',')
        .map(el => +el.replace(/\D/g, ''))
        .filter(el => !!el)
     ).subscribe(this.routeId$);
  }

  add(id, list): number {
    const newList = Utils.unique([...list, id]);
    this.router.navigate([this.tab, newList.join(',')]);
    // was it a duplicate?
    return list.length === newList.length ? id : null;
  }

  remove(id, list) {
    const newList = list.filter(el => el !== id);

    return this.router.navigate([this.tab, newList.join(',')]);
  }

}
