function filterBlankKeysDicts(arr: { [key: string]: any }[]): { [key: string]: any } {
    return arr.map(dict => Object.fromEntries(Object.entries(dict).filter(([key, value]) => key !== '')));
}
  

export { filterBlankKeysDicts };