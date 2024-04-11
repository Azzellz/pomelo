type Color = "RESET" | "RED" | "GREEN" | "YELLOW" | "BLUE";

const COLOR: Record<Color, string> = {
    RESET: "\x1b[0m",
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
};
function getColoredText(content: string, color: Color) {
    return COLOR[color] + content + COLOR.RESET;
}

function getFormattedTime(showYear: boolean = false) {
    const tmp = new Date();
    const year = tmp.getFullYear();
    const month = tmp.getMonth() + 1;
    const date = tmp.getDate();
    const formattedDate = `${year}/${month}/${date}`;
    const hours = tmp.getHours();
    const minutes =
        tmp.getMinutes() < 10 ? `0${tmp.getMinutes()}` : tmp.getMinutes();
    const seconds =
        tmp.getSeconds() < 10 ? `0${tmp.getSeconds()}` : tmp.getSeconds();
    const formattedMoment = `${hours}:${minutes}:${seconds}`;
    return showYear
        ? `${formattedDate} ${formattedMoment}`
        : `${formattedMoment}`;
}

export function successLog(content: string) {
    console.log(
        getColoredText(`[pomelo|${getFormattedTime()}]: ${content}`, "GREEN")
    );
}

export function warnLog(content: string) {
    console.log(
        getColoredText(`[pomelo|${getFormattedTime()}]: ${content}`, "YELLOW")
    );
}

export function errorLog(content: string) {
    console.log(
        getColoredText(`[pomelo|${getFormattedTime()}]: ${content}`, "RED")
    );
}
