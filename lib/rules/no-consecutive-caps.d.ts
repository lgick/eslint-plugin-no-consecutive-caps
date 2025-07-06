export namespace meta {
    let type: string;
    namespace docs {
        let description: string;
        let recommended: boolean;
    }
    let schema: {
        type: string;
        properties: {
            exceptions: {
                type: string;
                items: {
                    type: string;
                };
            };
        };
        additionalProperties: boolean;
    }[];
    namespace messages {
        let consecutiveCaps: string;
    }
}
export function create(context: any): {
    Identifier(node: any): void;
};
