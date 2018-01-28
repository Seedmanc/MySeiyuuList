import {TestBed, inject, async  } from '@angular/core/testing';
import {RoutingService} from "../routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {appRoutes} from "../../app-routing.module";
import {BaseComponent} from "../../base/base.component";
import {AnimeListComponent} from "../../anime-list/anime-list.component";
import {PhotoListComponent} from "../../photo-list/photo-list.component";
import {MagazineListComponent} from "../../magazine-list/magazine-list.component";
import {Router} from "@angular/router";
import {HeaderComponent} from "../../header/header.component";
import {SeiyuuPanelComponent} from "../../seiyuu-panel/seiyuu-panel.component";
import {TabsComponent} from "../../tabs/tabs.component";
import {FooterComponent} from "../../footer/footer.component";
import {OrderByPipe} from "../../orderBy.pipe";
import {RankingComponent} from "../../ranking/ranking.component";
import {SpinnerComponent} from "../../spinner/spinner.component";
import {FormsModule} from "@angular/forms";
import {UniqPipe} from "../../uniq.pipe";
import { Location} from '@angular/common';

describe('RoutingService', () => {
  let location: Location;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoutingService],

      declarations: [BaseComponent, AnimeListComponent, MagazineListComponent, FooterComponent, RankingComponent,
        PhotoListComponent, HeaderComponent, SeiyuuPanelComponent, TabsComponent, OrderByPipe, SpinnerComponent, UniqPipe],

      imports: [RouterTestingModule.withRoutes(appRoutes), FormsModule ],
    });
    router = TestBed.get(Router);
    location = TestBed.get(Location);

    router.initialNavigation();
  });

  it('should be created', inject([RoutingService], (service: RoutingService) => {
    expect(service).toBeTruthy();
  }));

  it('navigate to "" redirects to /-/anime', async(() => {
    router.navigate(['']).then(() => {
      expect(location.path()).toBe('/-/anime');
    });
  }));
  it('navigate to "<id>/photos"', async(() => {
    return router.navigate(['53', 'photos']).then(() => {
      expect(location.path()).toBe('/53/photos');
    });
  }));

  it('add an existing ID to route', async(inject([RoutingService], (service: RoutingService) => {
      router.navigate(['']).then(()=>{
        let navigateSpy = spyOn(router, 'navigate');
        let existing = service.add(53, [53, 24]);

        expect(navigateSpy).toHaveBeenCalledWith(['/53,24','anime']);
        expect(existing).toBeTruthy();
      });
    })
   )
  );
  it('remove an existing ID from route', async(inject([RoutingService], (service: RoutingService) => {
      router.navigate(['/-/photos']).then(()=>{
        let navigateSpy = spyOn(router, 'navigate');
        service.remove(53, [53, 24]);
        expect(navigateSpy).toHaveBeenCalledWith(['/24','photos']);
      });
    })
   )
  );

  //TODO routeId$ can't be properly tested it seems as it requires a real Router
});
