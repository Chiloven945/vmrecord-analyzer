export function escapeHtml(input: string) {
    return input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
}

export function highlightText(text: string, keyword: string) {
    if (!keyword.trim()) return escapeHtml(text)
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    return escapeHtml(text).replace(regex, '<mark class="record-mark">$1</mark>')
}
