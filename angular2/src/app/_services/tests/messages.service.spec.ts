import {TestBed, inject} from '@angular/core/testing';

import { MessagesService } from '../messages.service';

describe('MessagesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessagesService]
    });
  });

  it('should emit an error upon such method',
    inject([MessagesService], (service:MessagesService) => {
      let x;
      service.message$.subscribe(data => x=data);

      service.error('error');
      expect(JSON.stringify(x)).toEqual(JSON.stringify({isError: true, data: 'error'}));
    })
  );

  it('should emit a status upon such method',
    inject([MessagesService], (service:MessagesService) => {
      let x;
      service.message$.subscribe(data => x=data);

      service.status('status');
      expect(JSON.stringify(x)).toEqual(JSON.stringify({isError: false, data: 'status'}));
    })
  );

  it('should emit a blank upon such method',
    inject([MessagesService], (service:MessagesService) => {
      let x;
      service.message$.subscribe(data => x=data);
      service.status('status');
      service.blank();

      expect(JSON.stringify(x)).toEqual(JSON.stringify({}));
    })
  );

  it('should store seiyuu and anime record counts and display status based on them',
    inject([MessagesService], (service:MessagesService) => {
      let x;

      service.message$.subscribe(data => x=data);
      service.totals();
      expect(JSON.stringify(x)).toEqual(JSON.stringify({isError: true, data: 'no cached records found'}));

      service.setTotals({seiyuu: 2});
      service.totals();
      expect(JSON.stringify(x)).toEqual(JSON.stringify({isError: false, data: '2 seiyuu records cached'}));

      service.setTotals({anime: 3});
      service.totals();
      expect(JSON.stringify(x)).toEqual(JSON.stringify({isError: false, data: '2 seiyuu & 3 anime records cached'}));
    })
  )

});
