export class Utils {

  public static unorderedEquals(input: string, name: string): string {
    if (name) {
      input = input.toLowerCase();
      name = name.toLowerCase();

      return (input === name || input.split(' ').reverse().join(' ') === name) && name;
    } else return '';
  }

  public static pluralize(number) {
    return number !== undefined && (number % 10 > 1 || (number % 10) == 0) ? 's' : '';
  };

  public static unique<T>(list: T[], prop?: string): T[] {
    return list.filter((el,i) => list.findIndex(elem => elem === el ||
      elem[prop] && elem[prop] === el[prop]) === i);
  }

  public static readonly theSite: string = 'myanimelist.net';
}