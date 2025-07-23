const fetch = require('node-fetch');

class Ytmp {
    static async get(link, type = "mp3") {
        const id = link.match(/https:\/\/(www.youtube.com\/watch\?v=|youtu.be\/|youtube.com\/shorts\/|youtube.com\/watch\?v=)([^&|^?]+)/)?.[2]
        if (!id) throw Error("invalid youtube link")

        const ok = ["mp3", "mp4"]
        if (!ok.includes(type)) throw Error(`invalid type, use: ${ok.join(", ")}`)

        const q = { v: id, f: type, _: Math.random() }
        const head = { Referer: "https://id.ytmp3.mobi/" }

        const j = async (u, t) => {
            const r = await fetch(u, { headers: head })
            if (!r.ok) throw Error(`${t} failed: ${r.status} ${r.statusText}`)
            return await r.json()
        }

        const { convertURL: c } = await j("https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=" + Math.random(), "init")
        const { progressURL: p, downloadURL: d } = await j(`${c}&${new URLSearchParams(q)}`, "convert")

        let e, s, n
        while (s != 3) {
            ({ error: e, progress: s, title: n } = await j(p, "progress"))
            if (e) throw Error(`error: ${e}`)
        }

        return { title: n, url: d }
    }
}

module.exports = Ytmp
