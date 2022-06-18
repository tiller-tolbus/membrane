type Sheet = {
    meta: SheetMeta;
    data: Map<Address, Cell>
}

type SheetMeta = {
    title: string;
    owner: string;
    tags: Set<Tag>;
    rowMeta: Set<RowVisual>;
    columnMeta: Set<ColumnVisual>;
    whitelist: Whitelist;
}

type Address = {
    rowAddress: number;
    columnAddress: number;
}

type Tag = string;

type Cell = {
    meta: CellMeta;
    data: {
        input: string;
        output: string;
    }
}

type CellMeta = {
    format: Set<Visual>;
    whitelist: Whitelist;
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
}

type RowVisual = Visual | Height;

type ColumnVisual = Visual | Width;

type Height = number;

type Width = number;

type Whitelist = Map<string, Access>;

type Access = "read" | "write";