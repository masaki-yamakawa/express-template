export interface PostLayoutRequest {
    owner: string;
    group: string;
    layouts: LayoutProtocol[];
}

export interface GetLayoutResponse {
    owner: string;
    group: string;
    layouts: LayoutProtocol[];
}

export interface GetLayoutCondition {
    owner: number;
    group?: string;
    shareWith?: "None" | "Group" | "All";
}

export interface LayoutProtocol {
    id: number | null;
    name: string;
    shareWith: "None" | "Group" | "All";
    layout: any;
}
