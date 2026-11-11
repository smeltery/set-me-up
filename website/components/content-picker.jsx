"use client";

import { Children, cloneElement, isValidElement, useState } from "react";

export function ContentPicker({ children, ...props }) {
  const [selected, setSelected] = useState(null);
  function enhance(child) {
    if (!isValidElement(child)) return child;
    const extra = {};
    if (child.type === "fieldset") extra.hidden = false;
    if (child.props["data-picker-panel"])
      extra.hidden =
        selected === null ? child.props.hidden : child.props["data-picker-panel"] !== selected;
    return cloneElement(
      child,
      extra,
      child.props.children ? Children.map(child.props.children, enhance) : undefined,
    );
  }
  return (
    <div {...props} onChange={(event) => setSelected(event.target.value)}>
      {Children.map(children, enhance)}
    </div>
  );
}

export function LabLink({ machine, children, ...props }) {
  return (
    <a
      {...props}
      onClick={() =>
        window.dispatchEvent(new CustomEvent("smu:select-machine", { detail: machine }))
      }
    >
      {children}
    </a>
  );
}
