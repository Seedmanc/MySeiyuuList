import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SeiyuuService} from "../_services/seiyuu.service";

@Component({
  selector: 'msl-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css']
})
export class BaseComponent implements OnInit {

  constructor(private route: ActivatedRoute, private seiyuuSvc: SeiyuuService, private router: Router) { }

  ngOnInit() {
    let id$ = this.route.paramMap
      .map(params => params.get('ids').split(',').map(el => +el.replace(/\D/g, '')).filter(el=>!!el));

    id$.combineLatest(this.seiyuuSvc.totalList$)
      .map(([ids,list]) => ids.filter((id,i) => list.find(el => el._id == id)))
      .filter(ids => !!ids.length)
      //.do(ids => this.router.navigate(['/'+ids.join(','), 'anime'])) //switchMap?
      .do(ids => this.seiyuuSvc.routeId$.next(ids))
      .subscribe();
  }

}