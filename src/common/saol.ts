type SAOLResult = Array<{
    ordled: string,
    ordklass: string,
    huvudlemma: string,
    böjning: string,
    definition: string[]
    hänvisning: string[],
    exempel: string[],
}>

export class SAOL {
    
    static async lookup(word: string): Promise<SAOLResult> {
        const res = await fetch(`https://svenska.se/api/search/saol?q=${encodeURIComponent(word)}&size=5&exact_match=true`);
        const data = await res.json();
        //console.log(data?.hits.hits.map(({ _source }) => (_source)));
        return data?.hits.hits.map(({ _source }: { _source: any }) => ({
            ordled: stripHtml(_source.ordled),
            ordklass: stripHtml(_source.ordklass),
            huvudlemma: stripHtml(_source.huvudlemma),
            böjning: stripHtml(_source.böjning),
            definition: _source.huvudbetydelser?.map((b: any) => stripHtml(b.definition)).filter(Boolean) || [],
            hänvisning: _source.huvudbetydelser?.flatMap((b: any) => b.hänvisningar?.map((e: any) => stripHtml(e.hänvisning))).filter(Boolean) || [],
            exempel: _source.huvudbetydelser?.flatMap((b: any) => b.exempel?.map((e: any) => `“${stripHtml(e.text)}” ${stripHtml(e.parafras)}`)).filter(Boolean) || [],
        }));
    }

    static toHTML(saol: SAOLResult) {
        let html = ''
        let i = 1;
        for (const res of saol) {
            const p = `<sup>${i}</sup>`
                + `<span style="font-size:1.5rem;font-weight:bold">${res.ordled}</span>`
                + `&nbsp;<span style="font-size:1rem;">${res.ordklass}</span>`
                + (res.böjning ? `&nbsp;<span style="font-size:1rem;font-style: italic;">${res.böjning}</span>` : '');
            const ul =
                (res.huvudlemma ? `<li>→${res.huvudlemma}</li>` : '') +
                res.hänvisning?.map(text => `<li>→${text}</li>`).join('') +
                res.definition?.map(text => `<li>${text}</li>`).join('') +
                res.exempel?.map(text => `<li>${text}</li>`).join('')
            html += `<p>${p}</p><ul>${ul}</ul>`
            i++;
        }
        return html;
        //return saol.length > 0 ? `${html}<a tabIndex={-1} href="https://svenska.se/saol/?sok=${word}&exactMatch=true" target="_blank">Källa: SAOL</a>` : '<p>Saknas i saol<p>';
    }

}

function stripHtml(html: string) {
    const doc = new DOMParser().parseFromString(html || '', "text/html");
    return doc.body.textContent || "";
}
