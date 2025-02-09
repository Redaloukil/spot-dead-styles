import { parseTemplate } from '@angular/compiler';

export function extractClassesFromTemplate(template: string): string[] {
    const classes = new Set<string>();
    // Parse the template using Angular's compiler
    const parsed = parseTemplate(template, '');

    // Recursively visit nodes in the parsed template
    const visitNodes = (nodes: any[]) => {
        nodes.forEach((node) => {
            // Handle static class attributes
            if (node.attributes) {
                const classAttr = node.attributes.find(
                    (attribute: any) => attribute.name === 'class'
                );
                if (classAttr && classAttr.value) {
                    classAttr.value.split(/\s+/).forEach((cls: string) => classes.add(cls));
                }
            }

            // Handle class bindings like [class.*] and [ngClass]
            if (node.inputs) {
                node.inputs.forEach((input: any) => {
                    if (input.name.startsWith('class.')) {
                        const dynamicClass = input.name.replace('class.', '');
                        classes.add(dynamicClass);
                    } else if (input.name.startsWith('ngClass')) {
                        if (input.value.source) {
                            extractKeysFromObjectString(input.value.source)
                                .filter(Boolean)
                                .forEach((e) => classes.add(e));
                        }
                    }
                });
            }

            // Recurse into child nodes
            if (node.children) {
                visitNodes(node.children);
            }
        });
    };

    visitNodes(parsed.nodes);
    return Array.from(classes);
}

// Helper function to extract keys from an object string (e.g., "{ active: isActive }")
function extractKeysFromObjectString(objString: string): string[] {
    const keys: string[] = [];
    const regex = /['"]?([\w-]+)['"]?\s*:/g;
    let match;
    while ((match = regex.exec(objString)) !== null) {
        keys.push(match[1]);
    }
    return keys;
}
