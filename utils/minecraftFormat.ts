import {escapeHtml} from './highlight'

const colorMap: Record<string, string> = {
    red: 'color: rgb(248 113 113);',
    yellow: 'color: rgb(253 224 71);',
    gray: 'color: rgb(161 161 170);',
    green: 'color: rgb(74 222 128);',
    blue: 'color: rgb(56 189 248);',
    gold: 'color: rgb(251 191 36);',
    white: 'color: rgb(255 255 255);'
}

export function renderMinecraftMiniMessage(input?: string) {
    if (!input) return ''

    let html = escapeHtml(input)
    for (const [tag, style] of Object.entries(colorMap)) {
        html = html.replaceAll(`&lt;${tag}&gt;`, `<span style="${style}">`)
        html = html.replaceAll(`&lt;/${tag}&gt;`, '</span>')
    }
    return html
}
