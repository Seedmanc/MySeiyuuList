import {TestBed, inject, fakeAsync, tick, discardPeriodicTasks} from '@angular/core/testing';

import { SeiyuuService } from '../seiyuu.service';
import {RestService} from "../rest.service";
import {HttpClientModule} from "@angular/common/http";
import {MessagesService} from "../messages.service";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {env} from "../../../environments/environment";
import {basicModel, basicModel2, model, model2} from "../../_models/tests/seiyuu.model.spec";
import {Namesake, BasicSeiyuu, Seiyuu} from "../../_models/seiyuu.model";
import {RoutingServiceMock} from "./routing.service.mock";
import {RoutingService} from "../routing.service";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
export const mockList = (backend, returned) => backend.expectOne({
  url:
    `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&f={"name":1,"hits":1,"updated":1,"count":1,"accessed":1,"alternate_name":1}&s={"name":1}`,
  method:'GET'
}, 'GET to count the # of records in the seiyuu DB').flush(...returned);
export const basicList = [
  basicModel,
  basicModel2
];

describe('SeiyuuService', () => {
  let x;

  beforeEach(() => {
    x = undefined;
    TestBed.configureTestingModule({
      providers: [SeiyuuService, RestService, MessagesService, {provide: RoutingService, useClass: RoutingServiceMock} ],
      imports:[HttpClientModule, RouterTestingModule, HttpClientTestingModule ]
    });
  });

  it('should on init fetch the brief list from seiyuu, toggling pending state',
    inject([SeiyuuService, HttpTestingController, MessagesService],
      (service:SeiyuuService, backend:HttpTestingController, msgSvc:MessagesService) => {

      expect(service.pending).toBeTruthy();
      service.totalList$.subscribe(data => x=data);

      mockList(backend, [basicList]);

      expect(x).toBeTruthy();
      expect(service.pending).toBeFalsy();
    })
   );

  it('should report if loading the brief list fails with 404',
    inject([SeiyuuService, HttpTestingController, MessagesService],
      (service:SeiyuuService, backend:HttpTestingController, msgSvc:MessagesService) => {
      let spy = spyOn(msgSvc, 'error');

      expect(service.pending).toBeTruthy();

      expect(()=> {
        service.totalList$.subscribe(data => x = data);

        mockList(backend, ['', {status: 404, statusText: 'Not Found'}]);
      }).toThrow();
      expect(x).toBeFalsy();
      expect(service.pending).toBeFalsy();
      expect(spy).toHaveBeenCalledWith('Error getting cached list: 404');
    })
   );

  it('should report if loading the brief list fails with a network error',
    inject([SeiyuuService, HttpTestingController, MessagesService],
      (service:SeiyuuService, backend:HttpTestingController, msgSvc:MessagesService) => {
      let spy = spyOn(msgSvc, 'error');
      let x;

      expect(service.pending).toBeTruthy();

      expect(()=>{
        service.totalList$
          .subscribe(r => x=r);

        let request = backend.expectOne(
          `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&f={"name":1,"hits":1,"updated":1,"count":1,"accessed":1,"alternate_name":1}&s={"name":1}`
        );
        request.error(new ErrorEvent(''));
      }).toThrow();

      expect(x).toBeFalsy();
      expect(service.pending).toBeFalsy();
      expect(spy).toHaveBeenCalledWith('Error getting cached list: 0');
    })
   );

  it('should report if loading details fails with 500', fakeAsync(
    inject([SeiyuuService, HttpTestingController, MessagesService],
      (service:SeiyuuService, backend:HttpTestingController, msgSvc:MessagesService) => {
        let spy = spyOn(msgSvc, 'error');

        mockList(backend, [basicList]);

        service.updateRequest$.next(53);
        tick(200);

        backend.expectOne({
          url: `${env.mongoUrl}/collections/seiyuu-test?apiKey=${env.apiKey}&q={"_id":{"$in":[53]}}`,
          method:'GET'
        }, 'GET to load seiyuu details').flush('', {status: 500, statusText: 'Bad Request'});

        expect(spy).toHaveBeenCalledWith('Error loading seiyuu details: 500');
        discardPeriodicTasks();
      })
  ));

  it('should load seiyuu details upon an update request and emit to loaded list', fakeAsync(
    inject([SeiyuuService, HttpTestingController, RestService, RoutingService],
      (service:SeiyuuService, backend:HttpTestingController, restSvc:RestService, routingSvc:RoutingService) => {
      let loaded;
      service.totalList$.subscribe(data => x=data );
      service.loadedSeiyuu$.subscribe(data => loaded=data );
      let spy = spyOn(restSvc, 'mongoCall').and.returnValue(Observable.of([model,model2]));

      routingSvc.add(0,[578]);

      mockList(backend, [basicList]);

      expect(x[0].pending).toBeTruthy();
      service.updateRequest$.next(53);
      service.updateRequest$.next(0);
      tick(200);

      expect(spy).toHaveBeenCalledWith({
        coll: 'seiyuu-test',
        mode: 'GET',
        query: {
          q: {
            _id: {'$in': [53,0]}
          }
        }
      });

      expect(JSON.stringify(x)).toBe(JSON.stringify([new Seiyuu(model), new BasicSeiyuu(model2)]));
      expect(JSON.stringify(loaded)).toBe(JSON.stringify([new Seiyuu(model), new BasicSeiyuu(model2)]));
      expect(loaded[0].pending).toBeFalsy();

      discardPeriodicTasks();
    })
  ));

  it('should emit to loaded list from cache immediately', fakeAsync(
    inject([SeiyuuService, HttpTestingController, RestService, RoutingService],
      (service:SeiyuuService, backend:HttpTestingController, restSvc:RestService, routingSvc:RoutingService) => {
      let loaded, display:any = [1];
      service.totalList$.subscribe(data => x=data );
      service.loadedSeiyuu$.subscribe(data => loaded=data );
      service.displayList$.subscribe(data => display=data );
      let spy = spyOn(restSvc, 'mongoCall').and.returnValue(Observable.of([model]));

      routingSvc.add(0,[578]);

      mockList(backend, [[basicModel]]);

      expect(x[0].pending).toBeTruthy();
      service.updateRequest$.next(578);
      tick(200);

      expect(JSON.stringify(x)).toBe(JSON.stringify([new Seiyuu(model) ]));
      expect(loaded[0].pending).toBeFalsy();

      service.removed$.next(578);
      expect(loaded.length).toBeFalsy();
      routingSvc.add(0,[578]);
      expect(display.length).toBeTruthy();
      expect(loaded[0].pending).toBeFalsy();

      discardPeriodicTasks();
    })
  ));

  it('should error on searching for unknown name',
    inject([SeiyuuService, MessagesService, HttpTestingController],
      (service:SeiyuuService, msgSvc:MessagesService, backend:HttpTestingController) => {
      let spy = spyOn(msgSvc, 'error');

      mockList(backend, [basicList]);

      service.addSearch(Observable.of('derp'));
      expect(spy).toHaveBeenCalledWith(`"derp" is not found`);
    })
  );

  it('should find by name',
    inject([SeiyuuService,  HttpTestingController],
      (service:SeiyuuService, backend:HttpTestingController) => {
      service.displayList$.subscribe(data => x=data);

      mockList(backend, [basicList]);

      service.addSearch(Observable.of('Maeda Konomi'));
      expect(JSON.stringify(x)).toBe(JSON.stringify([new BasicSeiyuu(basicModel)]));
    })
  );

  it('should remove seiyuu from display by id',
    inject([SeiyuuService, RoutingService, HttpTestingController],
      (service:SeiyuuService, routingSvc:RoutingService,  backend:HttpTestingController) => {
      service.displayList$.subscribe(data => x=data);
      let spy = spyOn(routingSvc, 'remove').and.callThrough();

      mockList(backend, [basicList]);

      service.addSearch(Observable.of('Maeda Konomi'));
      service.removed$.next(578);

      expect(spy).toHaveBeenCalledWith(578,[578]);
      expect(JSON.stringify(x)).toBe(JSON.stringify([]));
    })
  );

  it('should remove namesakes by name',
    inject([SeiyuuService,  HttpTestingController],
      (service:SeiyuuService, backend:HttpTestingController) => {
      service.displayList$.subscribe(data => x=data);

      mockList(backend, [[basicModel,basicModel]]);

      service.addSearch(Observable.of('Maeda Konomi'));
      service.removed$.next('Maeda Konomi');

      expect(JSON.stringify(x)).toBe(JSON.stringify([]));
    })
  );

  it('should avoid duplicates',
    inject([SeiyuuService, MessagesService, HttpTestingController],
      (service:SeiyuuService, msgSvc:MessagesService, backend:HttpTestingController) => {
      service.displayList$.subscribe(data => x=data);
      let search = new BehaviorSubject('Maeda Konomi');

      mockList(backend, [basicList]);

      service.addSearch(search.asObservable());
      search.next('Test Name');
      search.next('Maeda Konomi');
      expect(x.length).toBe(2);
    })
  );

  it('should find namesakes',
    inject([SeiyuuService, HttpTestingController],
      (service:SeiyuuService, backend:HttpTestingController) => {
      service.displayList$.subscribe(data => x=data);

      mockList(backend, [[basicModel,basicModel]]);

      service.addSearch(Observable.of('Maeda Konomi'));
      expect(JSON.stringify(x)).toBe(JSON.stringify([new Namesake([new BasicSeiyuu(basicModel), new BasicSeiyuu(basicModel)])]
      ));
    })
  );

  it('should pick one seiyuu from a list of namesakes',
    inject([SeiyuuService, HttpTestingController],
      (service:SeiyuuService, backend:HttpTestingController) => {
        service.displayList$.subscribe(data => x=data);

        let bm2= Object.assign({}, basicModel);
        bm2._id = bm2._id*1000;

        mockList(backend, [[basicModel,bm2]]);

        service.addSearch(Observable.of('Maeda Konomi'));

        expect(JSON.stringify(x)).toBe(JSON.stringify([new Namesake([new BasicSeiyuu(basicModel), new BasicSeiyuu(bm2)])]));
        service.picked$.next(bm2._id);

        expect(JSON.stringify(x)).toBe(JSON.stringify([new BasicSeiyuu(bm2)]));
      })
  );

  it('should limit selections to 4',
    inject([SeiyuuService, HttpTestingController],
      (service:SeiyuuService, backend:HttpTestingController) => {
        service.displayList$.subscribe(data => x=data);
        let search = new BehaviorSubject('');
        let list = basicList.slice();

        for (let i=0;i<3;i++) {
          let el = Object.assign({},list[0]);
          el._id = el._id*(i+2);
          el.name = el.name+i;
          list.push(el)
        }

        mockList(backend, [list]);

        service.addSearch(search);
        search.next('Test Name');
        search.next('Maeda Konomi');
        search.next('Maeda Konomi0');
        search.next('Maeda Konomi1');
        search.next('Maeda Konomi2');
        expect(x.length).toBe(4);
      })
  );
});