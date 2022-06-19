type Sheet = {
    meta: SheetMeta;
    data: Map<Address, Cell>
}

type SheetMeta = {
    id: string;
    title: string;
    owner: string;
    tags: Set<Tag>;
    rowMeta: Map<number, Set<Visual>>;
    columnMeta: Map<number, Set<Visual>>;
    whitelist: Whitelist;
    lastModified: Date;
}

type Address = {
    rowAddress: number;
    columnAddress: number;
}

type Tag = string;

type Cell = {
    meta: Set<Visual>;
    data: {
        input: string;
        output: string;
    }
}

type Visual = {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    monospace: boolean;
    strikethrough: boolean;
    foreground: string;
    background: string;
    size: number;
    font: string;
    height?: number;
    width?: number;
}

type Whitelist = Map<string, Access>;

type Access = "read" | "write";