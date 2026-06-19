import type { Root, Element, ElementContent } from "hast";

function isWhitespace(node: ElementContent): boolean {
  return node.type === "text" && node.value.trim() === "";
}

// An image-only paragraph: a <p> whose single meaningful child is an <img>.
function imageOnlyParagraph(node: ElementContent): Element | null {
  if (node.type !== "element" || node.tagName !== "p") return null;
  const meaningful = node.children.filter((child) => !isWhitespace(child));
  const [only] = meaningful;
  if (meaningful.length === 1 && only.type === "element" && only.tagName === "img") {
    return only;
  }
  return null;
}

/**
 * Markdown convention used by our posts: an image on its own line, immediately
 * followed by a line of text that is the caption. This rehype plugin turns each
 * such image into a <figure>, and pulls the following paragraph's content into a
 * <figcaption> (preserving inline links inside the caption).
 */
export default function rehypeFigureCaptions() {
  return (tree: Root) => {
    const walk = (children: ElementContent[]) => {
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        if (node.type === "element" && node.children) {
          walk(node.children);
        }
        const img = imageOnlyParagraph(node);
        if (!img) continue;

        const figureChildren: ElementContent[] = [img];
        // remark-rehype inserts whitespace text nodes between block elements,
        // so the caption paragraph is the next *non-whitespace* sibling.
        let j = i + 1;
        while (j < children.length && isWhitespace(children[j])) j++;
        const next = children[j];
        if (next && next.type === "element" && next.tagName === "p") {
          figureChildren.push({
            type: "element",
            tagName: "figcaption",
            properties: {},
            children: next.children,
          });
          children.splice(i + 1, j - i);
        }

        children[i] = {
          type: "element",
          tagName: "figure",
          properties: {},
          children: figureChildren,
        };
      }
    };
    walk(tree.children);
  };
}
