function token(text, kind) {
  const span = document.createElement("span");
  span.className = `syntax-${kind}`;
  span.textContent = text;
  return span;
}

export function highlightCommand(element, text) {
  let executable = true;
  const parts = text.split(/(\s+|&&|\|\||[|;])/);
  element.replaceChildren(...parts.map(part => {
    if (!part.trim()) return part;
    if (["&&", "||", "|", ";"].includes(part)) {
      executable = true;
      return token(part, "operator");
    }
    if (executable) {
      executable = part === "sudo";
      return token(part, "command");
    }
    if (part.startsWith("-")) return token(part, "flag");
    if (part.includes("/") || part.endsWith(".sh")) return token(part, "value");
    return part;
  }));
}

export function highlightTranscript(element, lines) {
  element.replaceChildren();
  for (const [index, line] of lines.entries()) {
    if (index) element.append("\n");
    const fields = line.match(/^(\S.*?) {2,}(\S.*)$/);
    const module = line.match(/^(.*?)(\[[a-z]+\])$/);
    if (fields) {
      const [, label, value] = fields;
      element.append(token(label, "command"), line.slice(label.length, -value.length), value);
    } else if (module) {
      element.append(module[1], token(module[2], "flag"));
    } else {
      element.append(line.endsWith("/") ? token(line, "value") : line);
    }
  }
}
