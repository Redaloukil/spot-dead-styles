import postcss, { Root, Rule } from 'postcss';
import postcssScss from 'postcss-scss';
import fs from 'fs';


export function extractClassesFromSCSS(scssContent: string): string[] {
  const root = postcss.parse(scssContent, { syntax: postcssScss } as any);
  const classes = new Set<string>();


  // Helper function to recursively process rules and handle nested selectors
  function processRule(rule: postcss.Rule, parentSelector: string = ""): void {
    
    rule.each((node) => {
      if (node.type === "rule") {
        // Replace `&` with the parent selector
        const selector = node.selector.replace(/&/g, parentSelector || "").trim();

        // Extract class names using regex
        const matches = selector.match(/\.[a-zA-Z0-9_-]+/g);
        if (matches) {
          matches.forEach((cls) => classes.add(cls.replace(".", "")));
        }

        // Recursively process nested rules
        processRule(node as postcss.Rule, selector);
      }
    });
  }

  // Start processing the root rules
  processRule(root as any);

  return Array.from(classes) as any;
}