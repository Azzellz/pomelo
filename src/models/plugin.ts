export type PomeloPlugin = {
    name?: string;
    onAccepted?: (this: PomeloPlugin, content: string, link: string) => void;
    onRejected?: (this: PomeloPlugin, content: string, link: string) => void;
    onMatchBegin?: (this: PomeloPlugin) => void;
    onMatchEnd?: (this: PomeloPlugin) => void;
};
