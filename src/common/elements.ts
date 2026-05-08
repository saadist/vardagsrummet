export function SoundPlayer(src: string) {
    const sound = new Audio(src);
    return () => {
        sound.currentTime = 0;
        sound.play();
    }
}


export function createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    props?: Partial<HTMLElementTagNameMap[K] | null>,
    children?: (Node | string)[],
): HTMLElementTagNameMap[K] {
    const el = document.createElement(tagName);
    if (children) el.append(...children);
    return Object.assign(el, props);
}

export function updateElement<K extends keyof HTMLElementTagNameMap>(
    el: HTMLElementTagNameMap[K],
    props: Partial<HTMLElementTagNameMap[K]>
): HTMLElementTagNameMap[K] {
    return Object.assign(el, props);
}
