export class Layout {
    public id: number | null;
    public owner: string;
    public name: string;
    public version: number;
    public belonging: string;
    public shareWith: "None" | "Group" | "All";
    public layout: string;
    public saveDateTime: string;

    constructor(
        id: number | null,
        owner: string,
        name: string,
        version: number,
        belonging: string,
        shareWith: "None" | "Group" | "All",
        layout: string,
        saveDateTime: string,
    ) {
        this.id = id;
        this.owner = owner;
        this.name = name;
        this.version = version;
        this.belonging = belonging;
        this.shareWith = shareWith;
        this.layout = layout;
        this.saveDateTime = saveDateTime;
    }
}
