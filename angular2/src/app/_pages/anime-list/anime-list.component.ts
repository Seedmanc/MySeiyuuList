import { Component, OnInit } from '@angular/core';
import {ActivatedRoute } from "@angular/router";

import {RoutingService} from "../../_services/routing.service";
import {PageComponent} from "../../_misc/page.component";
import {AnimeService} from "../../_services/anime.service";
import {SorterService} from "../../_services/sorter.service";
import {MessagesService} from "../../_services/messages.service";

@Component({
  selector: 'msl-anime-list',
  templateUrl: './anime-list.component.html',
  styleUrls: ['./anime-list.component.css'],
  providers: [SorterService]
})
export class AnimeListComponent extends PageComponent implements OnInit {
  output = [
    {
      type: 'main',
      list: []
    },
    {
      type: 'supporting',
      list: []
    },
  ];
  tierOrder: boolean = true;
  mainOnly: boolean = false;

  constructor(protected route: ActivatedRoute,
              protected routingSvc: RoutingService,
              private messageSvc: MessagesService,
              public animeSvc: AnimeService,
              public sorter: SorterService) {
      super(route, routingSvc);
    }

  ngOnInit() {
    super.ngOnInit();

    this.animeSvc.mainOnly$.subscribe(value => this.mainOnly = value);

    this.animeSvc.displayAnime$
      .takeUntil(this.unsubscribe$)
      .do(([anime, seiyuuCount]) => {
        let entity = seiyuuCount > 1 ? 'shared anime' : 'anime';

          this.messageSvc.results(
            anime.length && `${anime.length} ${entity}`,
            seiyuuCount,
            entity
          );
      })
      .subscribe(([anime]) => {
        this.output[0].list = anime.filter(a => a.main);
        this.output[1].list = anime.filter(a => !a.main);
      });

    if (localStorage.mainOnly) {
      this.mainOnly = localStorage.mainOnly == 'true';
      this.onMainOnlyChange(this.mainOnly);
    }
  }

  onMainOnlyChange(value) {
    localStorage.mainOnly = value;
    this.animeSvc.mainOnly$.next(value);
  }

}
