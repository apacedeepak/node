/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
interface JQuery {
    fileinput(className: any):JQuery;
    fullCalendar(options?: any);
}
