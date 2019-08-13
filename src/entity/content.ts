export class Content {
    public id: number;
    public title: string;
    public url: string;

    constructor(
        id: number,
        title: string,
        url: string,
    ) {
        this.id = id;
        this.title = title;
        this.url = url;
    }
}
