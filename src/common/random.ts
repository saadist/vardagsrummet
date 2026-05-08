export const randInt = (n: number) => Math.floor(Math.random() * n);

export const shuffleArray = (arr: string[]) => {
    for (const i in arr) {
        const j = randInt(arr.length);
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}
