/**
 * Cyber-style console logger to match the front-end neon aesthetic.
 * Provides colored sections, event logs, and key/value output helpers.
 */

const palette = {
    reset: '\u001b[0m',
    bold: '\u001b[1m',
    dim: '\u001b[2m',
    frame: '\u001b[38;2;95;126;255m', // cool blue for structural lines
    label: '\u001b[38;2;255;92;206m', // neon magenta for labels
    accent: '\u001b[38;2;0;255;200m', // aqua for highlights
    text: '\u001b[38;2;214;236;255m', // soft cyan for body text
    success: '\u001b[38;2;144;255;173m',
    warn: '\u001b[38;2;255;214;102m',
    error: '\u001b[38;2;255;120;140m',
};

const typeStyles = {
    INFO: { icon: 'ℹ', color: palette.accent },
    SUCCESS: { icon: '✔', color: palette.success },
    WARN: { icon: '⚠', color: palette.warn },
    ERROR: { icon: '✖', color: palette.error },
    SOCKET: { icon: '🔌', color: palette.accent },
    GAME: { icon: '🎮', color: palette.label },
    PLAYER: { icon: '🧩', color: palette.success },
    LOBBY: { icon: '🏟', color: palette.accent },
    SYSTEM: { icon: '⚙', color: palette.accent },
};

function colorize(color, text) {
    return `${color}${text}${palette.reset}`;
}

function emit(type, message, detail) {
    const upperType = type.toUpperCase();
    const style = typeStyles[upperType] || typeStyles.INFO;
    const label = `${style.icon} ${palette.bold}[${upperType}]${palette.reset}`;
    const body = colorize(palette.text, message);
    const suffix = detail ? ` ${palette.dim}›${palette.reset} ${colorize(palette.accent, detail)}` : '';
    console.log(`${colorize(style.color, label)} ${body}${suffix}`);
}

function banner(title, subtitle) {
    const width = 58;
    const line = colorize(palette.frame, '═'.repeat(width));
    console.log('\n' + line);
    console.log(`${colorize(palette.frame, '◢')} ${colorize(palette.label + palette.bold, title)} ${colorize(palette.frame, '◣')}`);
    if (subtitle) {
        console.log(`${colorize(palette.frame, '◥')} ${colorize(palette.text + palette.dim, subtitle)} ${colorize(palette.frame, '◤')}`);
    }
    console.log(line + '\n');
}

function divider() {
    console.log(colorize(palette.frame, '─'.repeat(58)));
}

function section(title) {
    console.log(`${colorize(palette.frame, '┠')} ${colorize(palette.label + palette.bold, title)} ${colorize(palette.frame, '┨')}`);
}

function detail(label, value) {
    console.log(`${colorize(palette.frame, '┠')} ${colorize(palette.label, label)} ${colorize(palette.frame, '›')} ${colorize(palette.text, value)}`);
}

function info(message, detailValue) {
    emit('INFO', message, detailValue);
}

function success(message, detailValue) {
    emit('SUCCESS', message, detailValue);
}

function warn(message, detailValue) {
    emit('WARN', message, detailValue);
}

function error(message, detailValue) {
    emit('ERROR', message, detailValue);
}

function event(type, message, detailValue) {
    emit(type, message, detailValue);
}

function footer(url) {
    divider();
    console.log(`${colorize(palette.frame, '▶')} ${colorize(palette.accent + palette.bold, 'OPEN PORTAL')} ${colorize(palette.frame, '▶')}`);
    console.log(`${colorize(palette.frame, '└')} ${colorize(palette.text, url)}`);
    console.log(colorize(palette.frame, '═'.repeat(58)) + '\n');
}

module.exports = {
    banner,
    divider,
    section,
    detail,
    info,
    success,
    warn,
    error,
    event,
    footer,
};
