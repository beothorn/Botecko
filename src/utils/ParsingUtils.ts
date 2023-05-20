export function removeSpecialCharsAndParse(objStr: string){
    return JSON.parse(objStr.replaceAll(/[\u0000-\u001F\u007F-\u009F]/g, ""));
}