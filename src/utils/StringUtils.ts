export function countWords(str: string): number {
    // Use a regular expression to match all word characters (\w+)
    // and count the number of matches using the length property
    return str.match(/\w+/g)?.length || 0;
}