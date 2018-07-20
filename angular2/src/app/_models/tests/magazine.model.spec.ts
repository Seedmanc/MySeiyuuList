import {Magazine} from "../magazine.model";

describe('Magazine model', () => {
  it('should work, duh', () => {
    let magazine = new Magazine('hm3 Spe cial:', [{issue: '22 2005', seiyuus:'Maeda Konomi , "test", Chihara Minori'}]);

    expect(magazine.magazine).toBe('hm3 Spe cial');
    expect(magazine.logo).toBe('hm3_spe_cial');
    expect(magazine.issues[0].issue).toBe('22 2005');
    expect(magazine.issues[0].seiyuus.join('')).toBe('Chihara MinoriMaeda Konomi');
  });

});
