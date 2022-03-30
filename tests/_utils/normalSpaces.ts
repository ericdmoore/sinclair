export const normalSpaces = (s:string) => s
    .replaceAll(/\t/gi,'  ')
    .replaceAll(/\n/gi,'  ')
    .replaceAll(/  */gi,' ')
